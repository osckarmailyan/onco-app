import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <section className="shell hero">
        <div className="stack">
          <p className="eyebrow">Онлайн-консультация по документам</p>
          <h1 className="title">Второе мнение онколога-уролога</h1>
          <p className="lead">
            Независимый анализ медицинских документов, диагноза и назначенного
            плана лечения. Ответ подготавливается врачом в течение 48 часов.
          </p>
          <div>
            <Link className="button" href="/request">
              Получить второе мнение
            </Link>
          </div>
          <Link className="link" href="/about">
            О враче
          </Link>
        </div>

        <aside className="card stack" aria-label="Условия услуги">
          <div>
            <p className="muted">Стоимость</p>
            <p className="section-title">10 000 ₽</p>
          </div>
          <ul className="list">
            <li>Анализ медицинских документов</li>
            <li>Экспертная оценка диагноза</li>
            <li>Разбор назначенного лечения</li>
            <li>Рекомендации по дальнейшему обследованию</li>
          </ul>
          <p className="muted">
            Заключение носит информационный характер и не заменяет очную
            консультацию врача.
          </p>
          <p className="muted">
            Если ответ не будет предоставлен в течение 48 часов, мы вернем
            деньги.
          </p>
        </aside>
      </section>
    </main>
  );
}
