/** The former document-upload service is closed. No files or medical data are accepted. */
export async function POST() {
  return Response.json(
    { error: "Прежний формат заявок закрыт. Записаться на индивидуальную встречу можно на странице записи.", bookingUrl: "/request" },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
