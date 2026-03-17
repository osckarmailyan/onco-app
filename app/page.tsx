"use client";

export default function Home() {

  return (

    <main style={{
      maxWidth:"800px",
      margin:"100px auto",
      fontFamily:"sans-serif",
      lineHeight:"1.6"
    }}>

      <h1 style={{fontSize:"40px",fontWeight:"bold"}}>
        Второе мнение онколога
      </h1>

      <p style={{marginTop:"20px",fontSize:"18px"}}>
        Независимый анализ медицинских документов и плана лечения.
      </p>

      <ul style={{marginTop:"20px"}}>

        <li>Анализ медицинских документов</li>
        <li>Экспертная оценка диагноза</li>
        <li>Разбор назначенного лечения</li>
        <li>Рекомендации по дальнейшему обследованию</li>

      </ul>

      <p style={{marginTop:"30px",fontSize:"22px",fontWeight:"bold"}}>
        Стоимость: 10 000 ₽
      </p>

      <p style={{marginTop:"10px"}}>
        Ответ в течение 48 часов
      </p>

      <button
        onClick={()=>window.location.href="/request"}
        style={{
          marginTop:"40px",
          background:"black",
          color:"white",
          padding:"14px 26px",
          border:"none",
          cursor:"pointer",
          fontSize:"16px"
        }}
      >
        Получить второе мнение
      </button>

      <div style={{marginTop:"20px"}}>
  <a
    href="/about"
    style={{
      color:"black",
      textDecoration:"underline",
      fontSize:"16px"
    }}
  >
    О враче
  </a>
</div>

      <p style={{marginTop:"40px",color:"gray",fontSize:"14px"}}>
  Заключение носит информационный характер и не заменяет очную консультацию врача.
</p>

<p style={{marginTop:"8px",color:"gray",fontSize:"13px"}}>
  Если ответ не будет предоставлен в течение 48 часов — мы вернем деньги.
</p>
      

    </main>

  );

}
