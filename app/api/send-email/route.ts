import { Resend } from "resend";

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "OncoExperts <onboarding@resend.dev>";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.oncoexperts.ru";

  if (!apiKey) {
    return Response.json(
      { error: "Email service is not configured." },
      { status: 500 },
    );
  }

  const { email, id } = (await req.json()) as {
    email?: string;
    id?: string;
  };

  if (!email || !id) {
    return Response.json({ error: "Email and case id are required." }, { status: 400 });
  }

  const resultUrl = `${siteUrl.replace(/\/$/, "")}/result/${id}`;
  const resend = new Resend(apiKey);

  await resend.emails.send({
    from,
    to: email,
    subject: "Ответ врача готов",
    html: `
<h2>Ваше второе мнение готово</h2>

<p>Здравствуйте!</p>

<p>Ответ врача готов.</p>

<p>
<a href="${resultUrl}">
Посмотреть ответ врача
</a>
</p>

<p>Или откройте ссылку:</p>

<p>${resultUrl}</p>
`,
  });

  return Response.json({ success: true });
}
