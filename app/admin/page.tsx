import type { Metadata } from "next";
import { headers } from "next/headers";
import { getAdminAuthState } from "../../lib/admin-auth";
import { getSupabaseAdmin } from "../../lib/supabase-admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Встречи — панель OncoExperts",
  robots: { index: false, follow: false },
};

type BookingRecord = {
  id: string;
  name: string;
  email: string;
  status: string;
  requires_reschedule: boolean;
  amount_rub: number;
  created_at: string;
  meeting_slots: { starts_at: string; ends_at: string } | null;
};

const statusLabels: Record<string, string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачена",
  canceled: "Отменена",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "long", timeStyle: "short", timeZone: "Europe/Moscow",
  }).format(new Date(value));
}

export default async function Admin() {
  // Defense in depth: never query private records without checking the request,
  // even if this component is later mounted outside the proxy matcher.
  const requestHeaders = await headers();
  if (getAdminAuthState(requestHeaders.get("authorization")) !== "authorized") {
    return <main className="page"><section className="shell narrow card stack"><h1 className="section-title">Доступ ограничен</h1><p className="text">Для просмотра встреч необходим вход администратора.</p></section></main>;
  }

  let bookings: BookingRecord[] = [];
  let unavailable = false;
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("meeting_bookings")
      .select("id,name,email,status,requires_reschedule,amount_rub,created_at,meeting_slots(starts_at,ends_at)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) unavailable = true;
    else bookings = (data || []) as unknown as BookingRecord[];
  } catch {
    unavailable = true;
  }

  return (
    <main className="page">
      <section className="shell narrow stack">
        <div className="stack">
          <p className="eyebrow">Только для администратора</p>
          <h1 className="section-title">Индивидуальные встречи</h1>
          <p className="text">Последние 100 записей. Время указано по Москве. Панель работает в режиме просмотра.</p>
        </div>
        {unavailable ? (
          <div className="notice" role="alert">Не удалось загрузить записи. Проверьте серверную конфигурацию Supabase и применение миграции встреч.</div>
        ) : bookings.length === 0 ? (
          <div className="card"><p className="text">Записей на встречу пока нет.</p></div>
        ) : bookings.map((booking) => (
          <article className="card stack" key={booking.id}>
            <h2>{booking.name}</h2>
            {booking.requires_reschedule && <div className="notice" role="status"><strong>Нужно согласовать другое время</strong><p className="text">Оплата подтверждена после начала выбранного интервала. Свяжитесь с участником, чтобы согласовать дальнейшие действия.</p></div>}
            <p className="text" style={{ overflowWrap: "anywhere" }}>{booking.email}</p>
            <p className="text"><strong>Встреча:</strong> {booking.meeting_slots ? formatDate(booking.meeting_slots.starts_at) : "Время недоступно"} (МСК)</p>
            <p className="text"><strong>Статус:</strong> {statusLabels[booking.status] || "Неизвестен"}</p>
            <p className="text"><strong>Стоимость:</strong> {new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(booking.amount_rub)}</p>
            <p className="muted">Запись создана: {formatDate(booking.created_at)} (МСК)</p>
          </article>
        ))}
      </section>
    </main>
  );
}
