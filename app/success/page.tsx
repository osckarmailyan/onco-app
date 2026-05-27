import Link from "next/link";

export default function Page() {
  return (
    <main className="page">
      <section className="shell narrow stack">
        <div className="card stack">
          <p className="eyebrow">Запрос отправлен</p>
          <h1 className="section-title">Мы получили ваши документы</h1>
          <p className="lead">
            Врач-онколог изучит материалы и подготовит второе мнение.
          </p>

          <div className="notice success stack">
            <p className="text">
              <b>Срок ответа:</b> до 48 часов
            </p>
            <p className="text">
              <b>Куда придет ответ:</b> на email, указанный в заявке
            </p>
          </div>

          <div>
            <Link className="button" href="/">
              Вернуться на главную
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
