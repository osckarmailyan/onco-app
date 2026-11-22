"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { meetingConfig, formatPrice } from "@/lib/meeting-config";
import { isCheckoutUrl } from "@/lib/booking-validation";
import { trackAnalytics } from "@/lib/analytics";

type Slot = { id: string; startsAt: string; endsAt: string };
const dateKey = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: meetingConfig.timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
const timeLabel = (iso: string) => new Intl.DateTimeFormat("ru-RU", { timeZone: meetingConfig.timeZone, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const fullDate = (iso: string) => new Intl.DateTimeFormat("ru-RU", { timeZone: meetingConfig.timeZone, day: "numeric", month: "long", weekday: "long" }).format(new Date(iso));

export function BookingForm() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState("");
  const [day, setDay] = useState("");
  const [slotId, setSlotId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [terms, setTerms] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const submission = useRef<{fingerprint: string; key: string} | null>(null);
  const contactsHeading = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const days = Array.from(new Map(slots.map(slot => [dateKey(slot.startsAt), slot.startsAt])).entries());
  const selected = slots.find(slot => slot.id === slotId);
  const loadSlots = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setAvailabilityError("");
    try {
      const response = await fetch("/api/booking/slots", { cache: "no-store", signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) });
      const data = await response.json();
      if (!response.ok || data.configured !== true) throw new Error(data.error || "Запись сейчас недоступна.");
      const available = (Array.isArray(data.slots) ? data.slots : []) as Slot[];
      setSlots(available);
      setDay(current => available.some(slot => dateKey(slot.startsAt) === current) ? current : available[0] ? dateKey(available[0].startsAt) : "");
      setSlotId(current => available.some(slot => slot.id === current) ? current : "");
    } catch {
      if (!signal?.aborted) { setSlots([]); setSlotId(""); setAvailabilityError("Онлайн-запись сейчас недоступна. Вы можете написать нам, чтобы уточнить время встречи."); }
    } finally { if (!signal?.aborted) setLoading(false); }
  }, []);
  useEffect(() => { const controller = new AbortController(); void loadSlots(controller.signal); return () => controller.abort(); }, [loadSlots]);

  useEffect(() => {
    const restore = () => setSending(false);
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, []);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    setError("");
    if (!selected || !consent || !terms) { setError("Выберите время и подтвердите согласие с условиями."); return; }
    const payload = JSON.stringify({ name: name.trim(), email: email.trim(), slotId, consentVersion: meetingConfig.legalVersion });
    setSending(true);
    trackAnalytics("booking_form_submit", "booking");
    try {
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
      const fingerprint = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
      if (!submission.current) {
        try { submission.current = JSON.parse(sessionStorage.getItem("oncoexperts.booking-request") || "null"); } catch { /* Storage may be unavailable. */ }
      }
      if (!submission.current || submission.current.fingerprint !== fingerprint || !/^[a-f0-9-]{36}$/i.test(submission.current.key)) {
        submission.current = {fingerprint, key: crypto.randomUUID()};
      }
      try { sessionStorage.setItem("oncoexperts.booking-request", JSON.stringify(submission.current)); } catch { /* In-memory retry remains available. */ }
      const response = await fetch("/api/booking", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": submission.current.key }, body: payload, signal: AbortSignal.timeout(35000) });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) { submission.current = null; try { sessionStorage.removeItem("oncoexperts.booking-request"); } catch {} setSlotId(""); void loadSlots(); }
        throw new Error(data.error || "Не удалось перейти к оплате. Попробуйте ещё раз.");
      }
      const destination = new URL(data.confirmationUrl);
      if (!isCheckoutUrl(destination.href) && !(destination.origin === window.location.origin && destination.pathname === "/success")) throw new Error("Не удалось открыть страницу оплаты.");
      trackAnalytics("payment_redirect", "booking");
      window.location.assign(destination.href);
    } catch (caught) {
      setError(caught instanceof Error && caught.name !== "TimeoutError" && caught.name !== "SyntaxError" ? caught.message : "Не удалось связаться с сервисом. Повторите попытку — повторное нажатие не создаст вторую оплату.");
      setSending(false);
    }
  }

  return <div className="card booking-card" aria-busy={loading || sending}>
    <h2>Выберите день и время</h2>
    {error && <div ref={errorRef} tabIndex={-1} className="notice error" role="alert" style={{marginBottom:20}}>{error}</div>}
    {loading ? <p className="muted" role="status">Проверяем свободное время…</p> : availabilityError ? <div className="stack"><div className="notice" role="status">{availabilityError}</div><div><a className="button" href={`mailto:${meetingConfig.supportEmail}?subject=${encodeURIComponent("Встреча OncoExperts")}`}>Написать о встрече</a></div><button type="button" className="text-button" onClick={() => void loadSlots()}>Проверить ещё раз</button><p className="muted">Пожалуйста, не отправляйте медицинские документы и сведения о диагнозе. Для согласования встречи достаточно контакта и удобного времени.</p></div> : slots.length === 0 ? <div className="stack"><div className="notice" role="status">Сейчас нет свободного времени в расписании. Напишите нам — уточним ближайшую возможность встретиться.</div><a className="link" href={`mailto:${meetingConfig.supportEmail}`}>{meetingConfig.supportEmail}</a><button className="text-button" type="button" onClick={() => void loadSlots()}>Обновить расписание</button></div> : <>
      <div className="slots-dates" role="group" aria-label="День встречи">{days.map(([key, iso]) => <button type="button" className="date-option" key={key} aria-pressed={key === day} disabled={sending} onClick={() => { setDay(key); setSlotId(""); setError(""); }}><span>{new Intl.DateTimeFormat("ru-RU", {timeZone: meetingConfig.timeZone, weekday:"short"}).format(new Date(iso))}</span><strong>{new Intl.DateTimeFormat("ru-RU", {timeZone: meetingConfig.timeZone, day:"numeric", month:"short"}).format(new Date(iso))}</strong></button>)}</div>
      <div className="slots-times" role="group" aria-label="Время встречи">{slots.filter(slot => dateKey(slot.startsAt) === day).map(slot => <button type="button" key={slot.id} className="time-option" aria-pressed={slotId === slot.id} disabled={sending} onClick={() => { setSlotId(slot.id); setError(""); requestAnimationFrame(() => contactsHeading.current?.focus({preventScroll:true})); }}>{timeLabel(slot.startsAt)}</button>)}</div>
      <p className="timezone-note">Время московское (UTC+3). Продолжительность — {meetingConfig.durationLabel}.</p>
      {selected && <form onSubmit={submit} className="form" style={{marginTop:30}}>
        <div className="selected-slot"><span>{fullDate(selected.startsAt)}, {timeLabel(selected.startsAt)} мск</span></div>
        <h2 tabIndex={-1} ref={contactsHeading} style={{marginBottom:0}}>Как к вам обращаться?</h2>
        <label><span className="field-label">Ваше имя</span><input className="field" name="name" autoComplete="given-name" value={name} onChange={event => setName(event.target.value)} required minLength={1} maxLength={100} disabled={sending} placeholder="Имя"/></label>
        <label><span className="field-label">Email для подтверждения и ссылки на встречу</span><input className="field" name="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required maxLength={254} disabled={sending} placeholder="name@example.com"/></label>
        <label className="checkbox-label"><input type="checkbox" required checked={terms} onChange={event => setTerms(event.target.checked)} disabled={sending}/><span>Я принимаю <Link href="/terms" target="_blank" rel="noopener">условия предоставления услуг</Link> и понимаю, что встреча не заменяет приём лечащего врача.</span></label>
        <label className="checkbox-label"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} disabled={sending}/><span>Я даю <Link href="/consent" target="_blank" rel="noopener">согласие на обработку персональных данных</Link> и ознакомился с <Link href="/privacy" target="_blank" rel="noopener">политикой конфиденциальности</Link>.</span></label>
        <button className="button" type="submit" disabled={sending}>{sending ? "Открываем страницу оплаты…" : `Перейти к оплате · ${formatPrice()}`}</button>
        <p className="booking-submit-note">Оплата на защищённой странице ЮKassa. После оплаты здесь появится статус записи, а подтверждение и инструкция придут на email.</p>
      </form>}
    </>}
  </div>;
}
