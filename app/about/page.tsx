import Image from "next/image";
import Link from "next/link";

export default function About() {
  return (
    <main className="page">
      <section className="shell hero">
        <div className="stack">
          <p className="eyebrow">О враче</p>
          <h1 className="title">Доктор Оскар Араратович Маилян</h1>
          <p className="lead">Онколог-уролог, кандидат медицинских наук</p>
          <p className="text">
            Врач-онкоуролог, специализирующийся на диагностике и лечении
            опухолей мочеполовой системы. Занимается клинической и научной
            работой в области онкоурологии.
          </p>
          <p className="text">
            Работает с пациентами с раком предстательной железы, почки,
            мочевого пузыря и другими онкоурологическими заболеваниями.
          </p>
        </div>

        <div className="card">
          <Image
            alt="Доктор Оскар Араратович Маилян"
            className="doctor-photo"
            height={320}
            priority
            src="/doctor.png"
            width={260}
          />
        </div>
      </section>

      <section className="shell stack">
        <div className="grid">
          <div className="card">
            <h2>Специализация</h2>
            <ul className="list">
              <li>рак предстательной железы</li>
              <li>рак почки</li>
              <li>рак мочевого пузыря</li>
              <li>опухоли мочеполовой системы</li>
            </ul>
          </div>

          <div className="card">
            <h2>Ученая степень</h2>
            <p className="text">Кандидат медицинских наук.</p>
          </div>

          <div className="card">
            <h2>Научная деятельность</h2>
            <p className="text">
              Автор более 25 научных публикаций по онкоурологии и онкологии в
              российских медицинских журналах.
            </p>
          </div>
        </div>

        <div className="card stack">
          <h2 className="section-title">Образование</h2>
          <p className="text">
            Первый Московский государственный медицинский университет им. И. М.
            Сеченова (Сеченовский университет) - лечебное дело.
          </p>
          <p className="text">
            Российский университет дружбы народов (РУДН) - ординатура по
            урологии.
          </p>
          <p className="text">
            Сеченовский университет - аспирантура по онкологии.
          </p>
          <p className="text">
            НИИ Урологии им. Н.А. Лопаткина - профессиональная переподготовка
            по специальности онкология.
          </p>
        </div>

        <div className="card stack">
          <h2 className="section-title">Контакты</h2>
          <p className="text">
            Email:{" "}
            <a className="link" href="mailto:oncoexperts@protonmail.com">
              oncoexperts@protonmail.com
            </a>
            <br />
            ИНН: 344113979050
          </p>
          <p className="muted">
            Заявки принимаются только через форму на сайте. Ответ
            предоставляется после оплаты.
          </p>
        </div>

        <div>
          <Link className="button" href="/request">
            Получить второе мнение
          </Link>
        </div>

        <p className="muted">
          Заключение носит информационный характер и не заменяет очную
          консультацию врача.
        </p>
      </section>
    </main>
  );
}
