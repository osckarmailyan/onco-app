import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Прежняя заявка",
  robots: { index: false, follow: false },
};

export default function PreviousRequest() {
  return (
    <main className="page">
      <section className="shell narrow stack">
        <div className="card stack">
          <p className="eyebrow">OncoExperts</p>
          <h1 className="section-title">Информация о прежней заявке</h1>
          <p className="lead">
            Формат OncoExperts изменился. Материалы прежних заявок больше не открываются по публичной ссылке.
          </p>
          <p className="text">
            Если вы обращались раньше и хотите уточнить информацию о своей заявке, напишите на{" "}
            <a className="link" href="mailto:oncoexperts@protonmail.com">oncoexperts@protonmail.com</a>.
            Не прикладывайте медицинские документы к первому письму.
          </p>
          <p className="text">Теперь здесь можно записаться на индивидуальный поддерживающий разговор.</p>
          <div><Link className="button" href="/request">Записаться на разговор</Link></div>
        </div>
      </section>
    </main>
  );
}
