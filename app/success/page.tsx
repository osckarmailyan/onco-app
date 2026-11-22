import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingStatus } from "../components/booking-status";

export const metadata: Metadata = { title: "Ваша встреча", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function SuccessPage() {
  return <main className="page"><div className="shell narrow"><Suspense fallback={<div className="card"><p role="status">Проверяем статус встречи…</p></div>}><BookingStatus/></Suspense></div></main>;
}
