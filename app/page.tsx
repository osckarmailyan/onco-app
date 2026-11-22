import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "./components/ui-icon";
import { meetingConfig, formatPrice } from "@/lib/meeting-config";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const topics = [
  { icon: "heart", title: "Когда становится страшно", text: "После постановки диагноза, перед операцией, во время лечения или после его завершения." },
  { icon: "chat", title: "Когда слишком много вопросов", text: "Когда медицинская информация кажется сложной, противоречивой и непонятной." },
  { icon: "people", title: "Когда не с кем поговорить", text: "Когда не хочется постоянно беспокоить близких, но переживания никуда не исчезают." },
  { icon: "leaf", title: "Когда меняется привычная жизнь", text: "Работа, отношения, семья, интимная жизнь, планы — заболевание затрагивает гораздо больше, чем физическое здоровье." },
  { icon: "horizon", title: "Когда страшно за будущее", text: "Неопределённость, ожидание результатов, контрольные обследования и страх возвращения заболевания." },
  { icon: "sun", title: "Когда хочется просто поговорить", text: "Без спешки, давления, необходимости быть сильным или делать вид, что всё в порядке." },
];
const questions = [
  ["Это медицинская консультация?", "Встреча предназначена прежде всего для общения, поддержки и обсуждения вопросов, связанных с жизнью при онкологическом заболевании. Она не заменяет приём лечащего врача и не предназначена для постановки диагноза, назначения или изменения лечения."],
  ["Нужно ли заранее готовить медицинские документы?", "Нет. Вам не нужно специально готовить документы, анализы или обследования. Вы можете просто прийти на встречу и поговорить."],
  ["Можно ли просто поговорить, не задавая медицинских вопросов?", "Да. Вы можете говорить о страхах, переживаниях, семье, работе, отношениях, будущем или любой другой теме, связанной с вашей ситуацией."],
  ["Можно ли поговорить о сексуальной жизни после лечения?", "Да. Вы можете обсудить изменения интимной жизни, отношения с партнёром, переживания относительно своего тела и другие деликатные вопросы."],
  ["Что если я не знаю, с чего начать?", "Это нормально. Не обязательно заранее формулировать вопросы или понимать, о чём именно вы хотите поговорить. Мы можем начать с того, как вы сейчас себя чувствуете."],
  ["Вы заменяете моего лечащего врача?", "Нет. OncoExperts не заменяет лечащего врача, клинику или медицинское наблюдение."],
];

export default function Home() {
  return <main className="home-page">
    <section className="shell hero">
      <div className="hero-copy">
        <p className="eyebrow"><span className="tiny-leaf" aria-hidden="true"/> Пространство для разговора и поддержки</p>
        <h1 className="title">С диагнозом<br/>не обязательно<br/>оставаться<br/><em>один на один</em></h1>
        <p className="hero-intro">Онкологическое заболевание — это не только лечение. Это страх, неопределённость и вопросы, о которых иногда просто не с кем поговорить.</p>
        <p className="hero-description">Здесь можно спокойно поговорить с врачом, который понимает, через что вы проходите.</p>
        <div className="hero-actions"><Link className="button" href="/request">Записаться на разговор</Link><Link className="text-link" href="#how">Как проходит встреча</Link></div>
        <div className="hero-meta"><span><Icon name="video"/>Онлайн</span><span><Icon name="clock"/>{meetingConfig.durationLabel}</span><span>{formatPrice()}</span></div>
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
    <section className="meeting-section" id="meeting"><div className="shell meeting-grid"><div className="meeting-quote"><span className="quote-mark" aria-hidden="true">“</span><p>Не обязательно<br/>быть сильным.<br/><em>Можно просто<br/>быть собой.</em></p><span className="quote-flower" aria-hidden="true">✳</span></div><div className="meeting-copy"><p className="eyebrow">Что это за встреча</p><h2>Разговор начинается<br/>с вас, <em>а не с документов</em></h2><p>Иногда человеку не нужен очередной список обследований или сложное медицинское заключение. Иногда нужно спокойно обсудить то, что происходит.</p><p>Вы можете рассказать о своей ситуации, поделиться переживаниями, задать вопросы, обсудить страхи или просто поговорить.</p><p>Встреча проходит онлайн. Вы сами определяете, о чём хотите говорить и какие темы для вас важны. Мы не торопимся и не оцениваем ваши переживания.</p><Link href="/request" className="text-link">Найти время для себя</Link></div></div></section>
    <section className="shell section" id="how"><div className="section-heading"><div><p className="eyebrow">Всё достаточно просто</p><h2>Как проходит <em>встреча</em></h2></div><p className="section-aside">Не нужно готовиться.<br/>Достаточно прийти.</p></div><ol className="steps-grid">{[
      ["Вы записываетесь", "Выбираете удобное время, оставляете контактный email и оплачиваете встречу."],
      ["Мы встречаемся онлайн", "Встреча проходит в формате видеозвонка. Инструкцию по подключению вы получите на email."],
      ["Говорите о том, что беспокоит", "Без списка вопросов и подготовки документов. Можно обозначить тему заранее или начать с того, что сейчас важно."],
      ["Не нужно решать всё сразу", "Это время для вас, вашей ситуации и ваших переживаний. Вы не обязаны решать всё за один разговор."],
    ].map(([title, text], i) => <li key={title}><span className="step-number">0{i + 1}</span><h3>{title}</h3><p>{text}</p></li>)}</ol></section>
    <section className="shell section doctor-section" id="doctor"><div className="doctor-portrait-panel"><span className="doctor-portrait-detail" aria-hidden="true">✳</span><Image src="/doctor-white-coat.png" alt="Оскар Маилян" width={1485} height={1059} sizes="(max-width: 760px) 100vw, 40vw" className="doctor-photo"/><div className="doctor-name"><strong>Оскар Маилян</strong><span>Врач-онколог, кандидат медицинских наук</span></div></div><div className="doctor-copy"><p className="eyebrow">Кто будет рядом</p><h2>Человек, который<br/><em>понимает</em></h2><p>Меня зовут Оскар Маилян. Я врач-онколог, специализируюсь на онкоурологии. В своей практике я регулярно встречаю людей, для которых онкологический диагноз становится серьёзным испытанием.</p><p>За медицинскими терминами и результатами обследований всегда стоит человек — со своими страхами, вопросами, семьёй, планами и надеждами.</p><p>Мне важно, чтобы у человека была возможность спокойно поговорить, быть услышанным и не чувствовать себя один на один с заболеванием.</p><div className="doctor-credentials"><span>Онкология и онкоурология</span><span>Кандидат медицинских наук</span></div><Link className="text-link" href="/about">Образование и профессиональная деятельность</Link></div></section>
    <section className="audience-section"><div className="shell audience-grid"><div><p className="eyebrow">На любом этапе</p><h2>Поддержка может<br/>быть нужна <em>каждому</em></h2><p>И тому, кто столкнулся с диагнозом.<br/>И тем, кто находится рядом.</p></div><ul className="audience-list">{["Вы недавно узнали о диагнозе", "Вы проходите лечение или готовитесь к операции", "Лечение завершено, но переживания остались", "Вас тревожит страх возвращения заболевания", "Вам сложно привыкнуть к изменениям в жизни", "Вы близкий человека с онкологическим заболеванием"].map(text => <li key={text}><Icon name="check"/>{text}</li>)}</ul></div></section>
    <section className="shell section format-section" id="format"><div className="format-intro"><p className="eyebrow">Время, посвящённое вам</p><h2>Одна встреча.<br/><em>Ваш разговор.</em></h2><p>Без подписок, пакетов и обязательств продолжать. Можно начать с одной встречи.</p><div className="format-small-note"><Icon name="leaf"/><p>Вам не нужно заранее знать,<br/>с чего начать.</p></div></div><div className="service-card"><div className="service-card-top"><span className="service-tag">Индивидуальная встреча</span><Icon name="chat"/></div><div className="service-price">{formatPrice()}<span>за встречу</span></div><p className="service-duration">Онлайн-видеозвонок · {meetingConfig.durationLabel}</p><ul className="service-inclusions">{["Личный разговор один на один", "Обсуждение ситуации и переживаний", "Возможность задать вопросы и быть услышанным", "Разговор о жизни, отношениях и трудностях", "Объяснение общих терминов и процессов"].map(text => <li key={text}><Icon name="check"/>{text}</li>)}</ul><Link href="/request" className="button">Записаться на встречу</Link><p className="service-footnote">Вы сами выбираете, чем хотите поделиться.</p></div></section>
    <section className="shell section faq-section" id="faq"><div><p className="eyebrow">Если остались вопросы</p><h2>О чём вы, возможно,<br/><em>хотели спросить</em></h2><p className="faq-contact">Не нашли свой вопрос?<br/><a href={`mailto:${meetingConfig.supportEmail}`} className="text-link">Напишите нам</a></p></div><div className="faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true" className="faq-plus"/></summary><p>{answer}</p></details>)}</div></section>
    <section className="closing-section"><div className="shell"><span className="closing-flower" aria-hidden="true">✳</span><p className="eyebrow">Можно начать с разговора</p><h2>Вам не нужно проходить<br/>через всё это <em>в одиночку</em></h2><p>Иногда достаточно знать, что вас готовы выслушать.</p><Link className="button" href="/request">Записаться на разговор</Link></div></section>
    <div className="mobile-booking-bar"><div><strong>{formatPrice()}</strong><span>{meetingConfig.durationLabel} · онлайн</span></div><Link href="/request" className="button">Записаться</Link></div>
  </main>;
}
