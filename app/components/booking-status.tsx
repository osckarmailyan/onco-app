"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { meetingConfig } from "@/lib/meeting-config";
import { Icon } from "./ui-icon";

type Status = { status: "pending" | "paid" | "canceled" | "expired"; startsAt?: string; endsAt?: string; emailSent: boolean; needsReschedule?: boolean; instructions?: string };
export function BookingStatus() {
  const token = useSearchParams().get("token");
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [checks, setChecks] = useState(0);
  const check = useCallback(async (signal?: AbortSignal) => {
    if (!token || !/^[a-f0-9]{64}$/.test(token)) { setError("Для проверки записи нужна ссылка, которую вы получили после оплаты."); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/booking/status?token=${encodeURIComponent(token)}`, { cache:"no-store", signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000), referrerPolicy:"no-referrer" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Не удалось проверить запись.");
      setStatus(data);
    } catch (caught) { if (!signal?.aborted) setError(caught instanceof Error && caught.name !== "TimeoutError" ? caught.message : "Не удалось проверить статус. Попробуйте ещё раз."); }
    finally { if (!signal?.aborted) { setLoading(false); setChecks(current => current + 1); } }
  }, [token]);
  useEffect(() => { const controller = new AbortController(); void check(controller.signal); return () => controller.abort(); }, [check]);
  useEffect(() => {
    if (!status || status.status !== "pending" || checks >= 12 || error) return;
    const controller = new AbortController();
    const timer = setTimeout(() => void check(controller.signal), 5000);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [status, checks, check, error]);
  const paid = status?.status === "paid";
  return <section className="card stack status-card" aria-busy={loading}>
    <div className="status-icon"><Icon name={paid ? "check" : "chat"}/></div>
    <p className="eyebrow">Ваша встреча</p>
    <h1 className="section-title">{error ? "Проверим вашу запись" : paid ? status.needsReschedule ? "Оплата получена — согласуем время" : "Встреча подтверждена" : status?.status === "canceled" || status?.status === "expired" ? "Оплата не завершена" : "Проверяем оплату"}</h1>
    {loading && <p className="muted" role="status">Обновляем статус…</p>}
    {error && <div className="notice" role="alert">{error}</div>}
    {status?.startsAt && <p className="lead">{new Intl.DateTimeFormat("ru-RU", {timeZone:meetingConfig.timeZone, day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"}).format(new Date(status.startsAt))} мск</p>}
    {paid ? <><p className="text">{status.needsReschedule ? "Оплата поступила после начала выбранного интервала. Напишите нам, чтобы согласовать другое время." : "Спасибо. Это время — для вас. Не нужно готовить документы или заранее знать, о чём говорить."}</p><div className="notice success"><p>{status.emailSent ? status.needsReschedule ? "Информация о согласовании времени отправлена на ваш email." : "Подтверждение и ссылка на видеозвонок отправлены на ваш email." : "Оплата подтверждена. Письмо ещё не отправлено; обновите статус через минуту или напишите нам."}</p><p style={{margin:0}}>{status.instructions}</p></div></> : status?.status === "pending" ? <p className="text">Если вы завершили оплату, подождите немного: подтверждение может прийти не сразу. Повторно оплачивать встречу не нужно.</p> : status ? <><p className="text">Встреча пока не подтверждена. Вы можете выбрать другое время. Если деньги списались, напишите нам и не оплачивайте повторно.</p><div><Link className="button" href="/request">Выбрать время</Link></div></> : null}
    {token && <div><button type="button" className="button button-secondary" disabled={loading} onClick={() => void check()}>Обновить статус</button></div>}
    <p className="muted">Если нужна помощь: <a className="link" href={`mailto:${meetingConfig.supportEmail}`}>{meetingConfig.supportEmail}</a>. Не отправляйте медицинские документы.</p>
    <Link className="link" href="/">На главную</Link>
  </section>;
}
