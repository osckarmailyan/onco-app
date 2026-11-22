import { createPageMetadata, siteTitle, siteDescription } from "@/lib/site-metadata";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "./components/ui-icon";
import { meetingConfig } from "@/lib/meeting-config";
import { MeetingPrice } from "./components/meeting-price";

export const metadata = createPageMetadata({ title: siteTitle, description: siteDescription, path: "/" });

const topics = [
  { icon: "heart", title: "Страх и неопределённость", text: "Ожидание результатов, страх рецидива или прогрессирования и вопросы о том, что будет дальше." },
  { icon: "leaf", title: "Жизнь после диагноза", text: "Как привыкать к изменениям и оставаться собой, когда заболевание стало частью жизни." },
  { icon: "people", title: "Отношения с близкими", text: "Как говорить с семьёй о болезни и об ощущении, что вас не понимают." },
  { icon: "sun", title: "Отношения, сексуальность и тело", text: "Изменения интимной жизни, близости и отношения к собственному телу после диагноза и лечения." },
  { icon: "horizon", title: "Будущее", text: "Работа, планы, потеря ощущения контроля и возможность снова смотреть вперёд." },
];
const questions = [
  ["Это медицинская консультация?", "Встреча предназначена прежде всего для общения, поддержки и обсуждения вопросов, связанных с жизнью при онкологическом заболевании. Она не заменяет приём лечащего врача и не предназначена для постановки диагноза, назначения или изменения лечения. Общие медицинские термины и процессы можно обсудить на информационном уровне."],
  ["Нужно ли готовить медицинские документы?", "Нет. Встреча не предполагает анализа документов, обследований или медицинской истории. Можно прийти без предварительной подготовки."],
  ["Я не знаю, о чём хочу поговорить. Можно просто прийти?", "Да. Не обязательно заранее формулировать вопросы или определять тему разговора. Можно начать с того, что происходит с вами сейчас."],
  ["Можно ли говорить о страхе смерти?", "Да. Можно говорить о страхе смерти и переживаниях, которыми трудно поделиться с близкими. Вам не нужно искать правильные слова — вы сами определяете, чем готовы поделиться."],
  ["Можно ли говорить об отношениях и сексуальности?", "Да. Изменения в отношениях, интимной жизни, самоощущении и восприятии собственного тела могут быть частью разговора."],
  ["Можно ли записаться родственнику пациента?", "Да. Близкий человек может прийти, чтобы поговорить о собственных переживаниях, общении в семье и о том, как быть рядом с заболевшим. Готовить медицинские документы родственника не нужно."],
  ["Что, если мне потребуется ещё одна встреча?", "Можно отдельно согласовать ещё одну встречу. Обязательного курса или регулярных встреч нет — вы сами решаете, нужно ли продолжать."],
];

export default function Home() {
  return <main className="home-page">
    <section className="shell hero">
      <div className="hero-copy">
        <p className="eyebrow"><span className="tiny-leaf" aria-hidden="true"/> Пространство для разговора и поддержки</p>
        <h1 className="title">С диагнозом<br/>не обязательно<br/>оставаться<br/><em>один на один</em></h1>
        <p className="hero-intro">После онкологического диагноза бывают переживания, которыми трудно поделиться с близкими.</p>
        <p className="hero-description">Индивидуальная онлайн-встреча с врачом-онкологом. Спокойный разговор о том, что сейчас важно вам.</p>
        <div className="hero-actions"><Link className="button" href="/request" data-analytics-event="cta_click" data-analytics-placement="hero">Записаться на встречу</Link><Link className="text-link" href="#how">Как проходит встреча</Link></div>
        <div className="hero-meta"><span><Icon name="video"/>Онлайн</span><span><Icon name="clock"/>{meetingConfig.durationLabel}</span><MeetingPrice variant="inline"/></div>
      </div>
      <div className="hero-visual">
        <div className="portrait-arch"><div className="arch-orbit" aria-hidden="true"/><div className="portrait-caption">Иногда самый важный шаг —<br/><em>просто начать разговор.</em></div><Image src="/doctor-color.png" alt="Оскар Маилян, врач-онколог, с которым проходит встреча" width={1485} height={1059} priority sizes="(max-width: 760px) 100vw, 48vw" className="hero-portrait"/><span className="arch-star" aria-hidden="true">✳</span></div>
        <div className="portrait-label"><span className="portrait-label-icon"><Icon name="chat"/></span><div><strong>Оскар Маилян</strong><span>Врач-онколог · онкоурология</span></div></div>
        <p className="visual-note">Без спешки. Без осуждения. В вашем ритме.</p>
      </div>
    </section>
    <div className="reassurance-strip"><div className="shell"><span><Icon name="people"/>Один на один с врачом</span><span><Icon name="leaf"/>Можно быть собой</span><span><Icon name="chat"/>Вы выбираете тему</span></div></div>
    <section className="shell section" id="topics">
      <div className="section-heading"><div><p className="eyebrow">То, что сейчас важно вам</p><h2>Вы можете<br/>поговорить <em>о разном</em></h2></div><p className="section-aside">Не бывает «неправильных» вопросов<br className="desktop-break"/> или недостаточно важных переживаний.</p></div>
      <div className="topics-grid">{topics.map((topic) => <article className="topic-card" key={topic.title}><span className="topic-icon"><Icon name={topic.icon}/></span><h3>{topic.title}</h3><p>{topic.text}</p></article>)}</div>
    </section>
    <section className="meeting-section" id="meeting"><div className="shell meeting-grid"><div className="meeting-quote"><span className="quote-mark" aria-hidden="true">“</span><p>Не обязательно<br/>быть сильным.<br/><em>Можно просто<br/>быть собой.</em></p><span className="quote-flower" aria-hidden="true">✳</span></div><div className="meeting-copy"><p className="eyebrow">Можно начать с себя</p><h2>Не обязательно знать,<br/><em>с чего начать</em></h2><p>Вам не нужно заранее формулировать вопросы, готовить список тем или понимать, как правильно начать разговор.</p><p>Иногда хочется разобраться в происходящем. Иногда — поговорить о страхе, который трудно признать даже самому себе. А иногда важно, чтобы кто-то спокойно выслушал.</p><p>Можно прийти без конкретной проблемы и начать с того, что происходит с вами сейчас. Вы сами определяете, чем готовы поделиться.</p><Link href="/request" data-analytics-event="cta_click" data-analytics-placement="service" className="text-link">Записаться на встречу</Link></div></div></section>
    <section className="shell section" id="how"><div className="section-heading"><div><p className="eyebrow">Всё достаточно просто</p><h2>Как проходит <em>встреча</em></h2></div><p className="section-aside">Не нужно готовиться.<br/>Достаточно прийти.</p></div><ol className="steps-grid">{[
      ["Согласуем время", "Напишите нам по email. Сначала согласуем удобное время, затем — оплату встречи."],
      ["Мы встречаемся онлайн", "Разговор проходит по видеосвязи. Готовить медицинскую историю и документы не нужно. Инструкцию по подключению вы получите на email."],
      ["Говорите о том, что беспокоит", "Без списка вопросов и подготовки документов. Можно обозначить тему заранее или начать с того, что сейчас важно."],
      ["Не нужно решать всё сразу", "Это время для вас, вашей ситуации и ваших переживаний. Вы не обязаны решать всё за один разговор."],
    ].map(([title, text], i) => <li key={title}><span className="step-number">0{i + 1}</span><h3>{title}</h3><p>{text}</p></li>)}</ol></section>
    <section className="shell section doctor-section" id="doctor"><div className="doctor-portrait-panel"><span className="doctor-portrait-detail" aria-hidden="true">✳</span><Image src="/doctor-color.png" alt="Оскар Маилян" width={1485} height={1059} sizes="(max-width: 760px) 100vw, 40vw" className="doctor-photo"/><div className="doctor-name"><strong>Оскар Маилян</strong><span>Врач-онколог, кандидат медицинских наук</span></div></div><div className="doctor-copy"><p className="eyebrow">Кто будет рядом</p><h2>Человек, который<br/><em>понимает</em></h2><p>Меня зовут Оскар Маилян. Я врач-онколог, специализируюсь на онкоурологии. В своей практике я регулярно встречаю людей, для которых онкологический диагноз становится серьёзным испытанием.</p><p>За медицинскими терминами и результатами обследований всегда стоит человек — со своими страхами, вопросами, семьёй, планами и надеждами.</p><p>В обычном приёме время на общение часто ограничено. Мне хотелось создать формат, в котором можно не торопиться, не бояться неудобного вопроса и говорить о том, что важно именно вам. Для этого существует OncoExperts.</p><div className="doctor-credentials"><span>Онкология и онкоурология</span><span>Кандидат медицинских наук</span></div><Link className="text-link" href="/about">Образование и профессиональная деятельность</Link></div></section>
    <section className="audience-section"><div className="shell audience-grid"><div><p className="eyebrow">Время быть услышанным</p><h2>Что может дать<br/><em>эта встреча</em></h2><p>У каждого человека свой разговор. Можно уделить время тому, что важно сейчас, не пытаясь решить всё сразу.</p></div><ul className="audience-list">{["Проговорить то, что долго оставалось внутри", "Задать вопросы, которые трудно обсуждать с близкими", "Уделить время собственным мыслям и переживаниям", "Рассмотреть свою ситуацию с другой стороны", "Поговорить с человеком, который знает онкологический контекст"].map(text => <li key={text}><Icon name="check"/>{text}</li>)}</ul></div></section>
    <section className="shell section format-section" id="format"><div className="format-intro"><p className="eyebrow">Время, посвящённое вам</p><h2>Одна встреча.<br/><em>Ваш разговор.</em></h2><p>Спокойная индивидуальная встреча, посвящённая вашей ситуации, вопросам и переживаниям. Можно начать с одного разговора, без обязательств продолжать.</p><div className="format-small-note"><Icon name="leaf"/><p>Вам не нужно заранее знать,<br/>с чего начать.</p></div></div><div className="service-card"><div className="service-card-top"><span className="service-tag">Индивидуальная встреча</span><Icon name="chat"/></div><MeetingPrice unit="за встречу"/><p className="service-duration">Онлайн-видеозвонок · {meetingConfig.durationLabel}</p><ul className="service-inclusions">{["Только вы и врач", "Спокойный разговор без спешки", "Вы сами определяете тему", "Без подготовки медицинских документов"].map(text => <li key={text}><Icon name="check"/>{text}</li>)}</ul><Link href="/request" data-analytics-event="cta_click" data-analytics-placement="service" className="button">Записаться на встречу</Link><p className="service-footnote">Вы сами выбираете, чем хотите поделиться.</p></div></section>
    <section className="shell section faq-section" id="faq"><div><p className="eyebrow">Если остались вопросы</p><h2>О чём вы, возможно,<br/><em>хотели спросить</em></h2><p className="faq-contact">Остались организационные вопросы?<br/><a data-analytics-event="contact_click" data-analytics-placement="faq" href={`mailto:${meetingConfig.supportEmail}?subject=${encodeURIComponent("Организационный вопрос перед встречей OncoExperts")}`} className="text-link">Задать вопрос перед записью</a></p></div><div className="faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true" className="faq-plus"/></summary><p>{answer}</p></details>)}</div></section>
    <section className="shell card privacy-section" aria-labelledby="privacy-heading">
      <span className="topic-icon"><Icon name="lock"/></span>
      <div>
        <p className="eyebrow">О личном — бережно</p>
        <h2 id="privacy-heading">Разговор один на один</h2>
        <p>Вы сами выбираете, какими переживаниями, вопросами и обстоятельствами готовы поделиться. Не нужно рассказывать больше, чем вам комфортно.</p>
        <p>Для организации встречи достаточно имени, контакта и удобного времени. Медицинские документы и сведения о диагнозе для записи не нужны.</p>
        <Link href="/privacy" className="text-link">Как обрабатываются данные</Link>
      </div>
    </section>
    <section className="closing-section"><div className="shell"><span className="closing-flower" aria-hidden="true">✳</span><p className="eyebrow">Можно начать с разговора</p><h2>Иногда самое важное —<br/><em>не оставаться в одиночестве</em></h2><p>Если хочется поговорить, разобраться в происходящем или просто быть услышанным — можно начать с одной встречи.</p><Link className="button" href="/request" data-analytics-event="cta_click" data-analytics-placement="closing">Записаться на встречу</Link></div></section>
    <div className="mobile-booking-bar"><div><MeetingPrice variant="compact"/><span className="mobile-booking-duration">{meetingConfig.durationLabel} · онлайн</span></div><Link href="/request" data-analytics-event="cta_click" data-analytics-placement="sticky" className="button">Записаться на встречу</Link></div>
  </main>;
}
