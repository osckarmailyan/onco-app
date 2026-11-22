import type { Metadata } from "next";
import { BookingForm } from "../components/booking-form";
import { Icon } from "../components/ui-icon";
import Link from "next/link";
import { meetingConfig, formatPrice } from "@/lib/meeting-config";

export const metadata: Metadata = { title: "Записаться на разговор", description: "Индивидуальная поддерживающая встреча с Оскаром Маиляном. Онлайн, без подготовки документов.", robots: { index: false, follow: true } };
export default function RequestPage() {
  const onlineBooking = process.env.BOOKING_ENABLED === "true";
  return <main className="page"><div className="shell">
    <div className="booking-header"><p className="eyebrow">Небольшой шаг навстречу себе</p><h1 className="section-title">{onlineBooking ? <>Давайте найдём время <em>поговорить</em></> : <>Сделаем первый шаг — <em>поговорим</em></>}</h1><p className="lead">{onlineBooking ? "Выберите удобное время. Вам не нужно готовить документы или заранее формулировать вопросы." : "Напишите нам, чтобы обсудить возможность встречи и согласовать удобное время. Заранее формулировать вопросы не нужно."}</p>{onlineBooking && <div className="booking-steps" aria-label="Этапы записи"><span><b>1</b> Время</span><span><b>2</b> Ваши контакты</span><span><b>3</b> Оплата и подтверждение</span></div>}</div>
    <div className="booking-layout">{onlineBooking ? <BookingForm/> : <section className="card booking-card stack"><span className="topic-icon"><Icon name="chat"/></span><h2>Согласуем время встречи</h2><p className="text">Можно начать с короткого письма. Напишите, как к вам обращаться и когда вам удобно поговорить. Мы ответим на организационные вопросы.</p><div><a className="button" href={`mailto:${meetingConfig.supportEmail}?subject=${encodeURIComponent("Встреча OncoExperts")}`}>Написать о встрече</a></div><a className="link" href={`mailto:${meetingConfig.supportEmail}`}>{meetingConfig.supportEmail}</a><p className="muted" style={{fontSize:14}}>Для согласования встречи достаточно имени, контакта и удобного времени. Пожалуйста, не отправляйте медицинские документы и сведения о диагнозе.</p><Link className="text-link" href="/terms">Условия предоставления услуг</Link></section>}<aside className="card booking-summary"><p className="eyebrow">Индивидуальная встреча</p><h2>Вы и человек,<br/>который понимает</h2><div className="service-price">{formatPrice()}</div><p>Онлайн-видеозвонок<br/>{meetingConfig.durationLabel}<br/>Оскар Маилян, врач-онколог</p><ul className="service-inclusions"><li><Icon name="check"/>Вы сами выбираете тему</li><li><Icon name="check"/>Без подготовки и сбора документов</li><li><Icon name="check"/>Без обязательств продолжать</li></ul><p>Встреча — это разговор и поддержка. Она не заменяет приём лечащего врача.</p></aside></div>
  </div></main>;
}
