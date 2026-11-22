/** The legacy public mail endpoint is closed. Booking emails are sent server-side. */
export async function POST() {
  return Response.json(
    { error: "Этот способ отправки уведомлений больше не используется. Перейдите к записи на встречу.", bookingUrl: "/request" },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
