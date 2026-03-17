"use client";

import Link from "next/link";

export default function About() {

  return (

    <main style={{
      maxWidth:"900px",
      margin:"80px auto",
      fontFamily:"sans-serif",
      padding:"20px"
    }}>

      <h1 style={{
        fontSize:"36px",
        fontWeight:"bold"
      }}>
        Доктор Оскар Араратович Маилян
      </h1>

      <p style={{color:"#666",marginTop:"5px"}}>
        Онколог-уролог, кандидат медицинских наук
      </p>

      <div style={{
        display:"flex",
        gap:"40px",
        marginTop:"40px",
        alignItems:"flex-start"
      }}>

        {/* фото */}

        <img
          src="/doctor.png"
          style={{
            width:"220px",
            borderRadius:"8px"
          }}
        />

        {/* текст */}

        <div>

          <p>
          Врач-онкоуролог, специализирующийся на диагностике и лечении опухолей
          мочеполовой системы. Занимаюсь клинической и научной работой
          в области онкоурологии.
          </p>

          <p style={{marginTop:"20px"}}>
          Работаю с пациентами с раком предстательной железы, почки,
          мочевого пузыря и другими онкоурологическими заболеваниями.
          </p>

        </div>

      </div>


      {/* специализация */}

      <h2 style={{marginTop:"50px"}}>Специализация</h2>

      <ul style={{marginTop:"10px"}}>
        <li>рак предстательной железы</li>
        <li>рак почки</li>
        <li>рак мочевого пузыря</li>
        <li>опухоли мочеполовой системы</li>
      </ul>


      {/* образование */}

      <h2 style={{marginTop:"50px"}}>Образование</h2>

      <p style={{marginTop:"10px"}}>
      Первый Московский государственный медицинский университет
      им. И. М. Сеченова (Сеченовский университет) — лечебное дело.
      </p>

      <p>
      Российский университет дружбы народов (РУДН) — ординатура по урологии.
      </p>

      <p>
      Сеченовский университет — аспирантура по онкологии.
      </p>

      <p>
      НИИ Урологии им. Н.А. Лопаткина - профессиональная переподготовка по специальности онкология.
      </p>




      {/* степень */}

      <h2 style={{marginTop:"50px"}}>Ученая степень</h2>

      <p style={{marginTop:"10px"}}>
      Кандидат медицинских наук.
      </p>


      {/* публикации */}

      <h2 style={{marginTop:"50px"}}>Научная деятельность</h2>

      <p style={{marginTop:"10px"}}>
      Автор более 25 научных публикаций по онкоурологии
      и онкологии в российских медицинских журналах.
      </p>


      {/* кнопка */}

      <div style={{marginTop:"60px"}}>

        <Link href="/request">

          <button style={{
            background:"black",
            color:"white",
            padding:"14px 24px",
            border:"none",
            borderRadius:"6px",
            cursor:"pointer",
            fontSize:"16px"
          }}>
            Получить второе мнение
          </button>

        </Link>

      </div>


      <p style={{
        marginTop:"40px",
        fontSize:"14px",
        color:"#777"
      }}>
      Заключение носит информационный характер и
      не заменяет очную консультацию врача.
      </p>


      {/* КОНТАКТЫ */}
<p style={{marginTop:"30px",fontWeight:"bold"}}>
  Контакты
</p>

<p style={{marginTop:"10px"}}>
  Email: oncoexperts@protonmail.com<br/>
  ИНН: 344113979050
</p>

<p style={{marginTop:"20px",color:"#777"}}>
  Заявки принимаются только через форму на сайте.
  Ответ предоставляется после оплаты.
</p>

    </main>

  );

}