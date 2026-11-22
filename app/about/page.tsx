import { createPageMetadata } from "@/lib/site-metadata";
import Image from "next/image";
import Link from "next/link";
import { meetingConfig } from "@/lib/meeting-config";

export const metadata = createPageMetadata({ title: "Оскар Маилян — о человеке, с которым вы встретитесь", description: "Врач-онколог Оскар Маилян: профессиональный опыт, образование и спокойный разговор о жизни с онкологическим заболеванием.", path: "/about" });

export default function About() {
  return (
    <main className="page">
      <section className="shell hero">
        <div className="stack">
          <p className="eyebrow">Давайте познакомимся</p>
          <h1 className="title">Меня зовут Оскар Маилян</h1>
          <p className="lead">Я врач-онколог, специализируюсь на онкоурологии.</p>
          <p className="text">
            В своей практике я регулярно встречаю людей, для которых
            онкологический диагноз становится серьёзным испытанием.
            За медицинскими терминами и результатами обследований всегда стоит
            человек — со своими страхами, семьёй, планами и надеждами.
          </p>
          <p className="text">
            В обычном приёме время на общение часто ограничено. Мне хотелось
            создать формат, в котором можно не торопиться, не бояться неудобного
            вопроса и спокойно говорить о том, что важно именно вам.
            Для этого существует OncoExperts.
          </p>
          <div>
            <Link className="button" href="/request" data-analytics-event="cta_click" data-analytics-placement="doctor">Записаться на встречу</Link>
          </div>
        </div>
        <div>
          <Image
            alt="Оскар Маилян, врач-онколог"
            className="doctor-photo profile-photo"
            height={1059}
            priority
            src="/doctor-color.png"
            width={1485}
            sizes="(max-width: 760px) 100vw, 40vw"
          />
        </div>
      </section>

      <section className="shell narrow stack" aria-labelledby="experience-heading">
        <p className="eyebrow">Профессиональный опыт</p>
        <h2 className="section-title" id="experience-heading">Понимание онкологии и внимание к человеку</h2>
        <p className="text">
          Моя клиническая и научная работа связана с онкоурологией.
          Я работаю с людьми с заболеваниями предстательной железы, почки,
          мочевого пузыря и другими онкоурологическими заболеваниями.
        </p>
        <div className="card stack">
          <h3>Специальность и научная деятельность</h3>
          <ul className="list">
            <li>Врач-онколог, уролог.</li>
            <li>Кандидат медицинских наук.</li>
            <li>Научная работа связана с онкоурологией и онкологией.</li>
          </ul>
          <a className="link" href="https://www.sechenov.ru/pressroom/publications/mailyan-ovsep-araratovich/" target="_blank" rel="noopener noreferrer">Сведения о научной работе</a>
        </div>
        <div className="card stack">
          <h3>Образование</h3>
          <ul className="list">
            <li>Первый Московский государственный медицинский университет им. И. М. Сеченова — лечебное дело.</li>
            <li>Российский университет дружбы народов — ординатура по урологии.</li>
            <li>Сеченовский университет — аспирантура по онкологии.</li>
            <li>НИИ урологии им. Н. А. Лопаткина — профессиональная переподготовка по специальности «Онкология».</li>
          </ul>
        </div>
        <p className="text">
          Индивидуальная встреча в OncoExperts — время для разговора и поддержки.
          Она не заменяет приём лечащего врача и не предназначена для постановки
          диагноза, назначения или изменения лечения.
        </p>
        <div className="card stack">
          <h3>Связаться со мной</h3>
          <a data-analytics-event="contact_click" data-analytics-placement="doctor" className="link" href={`mailto:${meetingConfig.supportEmail}`}>{meetingConfig.supportEmail}</a>
          <p className="muted">ИНН: 344113979050</p>
          <Link className="link" href="/terms">Условия предоставления услуг</Link>
        </div>
      </section>
    </main>
  );
}
