import { Resend } from "resend";

const resend = new Resend("re_iB3Ya7Mo_Q2ziFVtgtiVhxbgEXttrTEm4");

export async function POST(req: Request) {

  const { email, answer, id } = await req.json();

 await resend.emails.send({
  from: "onboarding@resend.dev",
  to: email,
  subject: "Ответ врача",
  html: `
<h2>Ваше второе мнение готово</h2>

<p>Здравствуйте!</p>

<p>Ответ врача готов.</p>

<p>
<a href="http://localhost:3000/result/${id}">
Посмотреть ответ врача
</a>
</p>

<p>Или откройте ссылку:</p>

<p>http://localhost:3000/result/${id}</p>
`
});

  return Response.json({ success: true });

}
