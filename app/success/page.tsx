export default function Page() {

  return(

    <main style={{
      maxWidth:"700px",
      margin:"120px auto",
      fontFamily:"sans-serif",
      textAlign:"center"
    }}>

      <h1 style={{
        fontSize:"36px",
        fontWeight:"bold"
      }}>
        ✅ Запрос отправлен
      </h1>

      <p style={{
        marginTop:"20px",
        fontSize:"18px",
        color:"#555"
      }}>
        Мы получили ваши документы.
      </p>

      <p style={{
        marginTop:"10px",
        color:"#666"
      }}>
        Врач-онколог изучит материалы и подготовит второе мнение.
      </p>

      <div style={{
        marginTop:"40px",
        padding:"20px",
        background:"#f5f5f5",
        borderRadius:"8px"
      }}>

        <p style={{marginBottom:"10px"}}>
          ⏱ Срок ответа: <b>до 48 часов</b>
        </p>

        <p>
          📧 Ответ будет отправлен на ваш email
        </p>

      </div>

      <a
        href="/"
        style={{
          display:"inline-block",
          marginTop:"40px",
          padding:"14px 26px",
          background:"black",
          color:"white",
          textDecoration:"none",
          borderRadius:"6px"
        }}
      >
        Вернуться на главную
      </a>

    </main>

  );

}
