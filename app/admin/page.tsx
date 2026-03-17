"use client";
export const dynamic = "force-dynamic";


import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";


export default function Admin() {

  const [cases,setCases] = useState<any[]>([]);
  

  async function loadCases(){

    const { data } = await supabase
      .from("cases")
      .select("*")
      .order("created_at",{ascending:false});

    if(data){
      setCases(data);
    }

  }

  useEffect(()=>{
    loadCases();
  },[]);

  return(

    <main style={{maxWidth:"900px",margin:"100px auto",fontFamily:"sans-serif"}}>

      <h1 style={{fontSize:"34px",fontWeight:"bold"}}>
        Панель врача
      </h1>

      {cases.map((c)=>(

        <div key={c.id} style={{
          border:"1px solid #ddd",
          padding:"20px",
          marginTop:"20px",
          borderRadius:"8px"
        }}>

          <p><b>Email:</b> {c.email}</p>

          <p style={{marginTop:"15px"}}><b>Вопрос пациента:</b></p>

          <div style={{
            background:"#f5f5f5",
            padding:"10px",
            borderRadius:"6px"
          }}>
            {c.question}
          </div>

          {c.file && c.file.length > 0 && (
            <div style={{marginTop:"15px"}}>
              <b>Файлы пациента:</b>

              {c.file.map((f:any,i:number)=>(
                <div key={i}>
                  <a
                    href={`https://cmamfntyglctiymqnlfv.supabase.co/storage/v1/object/public/cases/${f}`}
                    target="_blank"
                    style={{color:"blue"}}
                  >
                    📎 файл {i+1}
                  </a>
                </div>
              ))}

            </div>
          )}

          <p style={{marginTop:"15px"}}>
            <b>Статус:</b>{" "}
            {c.status === "in_review"
              ? "🔵 На рассмотрении"
              : c.status === "answered"
              ? "🟢 Ответ готов"
              : "🟡 Новый"}
          </p>

          <button
            style={{marginTop:"10px"}}
            onClick={async ()=>{
              await supabase
                .from("cases")
                .update({status:"in_review"})
                .eq("id",c.id);

              loadCases();
            }}
          >
            В работу
          </button>

          <p style={{color:"gray",marginTop:"10px"}}>
            {new Date(new Date(c.created_at).getTime() + 3 * 60 * 60 * 1000)
              .toLocaleString("ru-RU")}
          </p>

          <p style={{marginTop:"20px"}}><b>Ответ врача:</b></p>

          <textarea
  value={c.answer || ""}
  style={{
    width:"100%",
    height:"120px",
    padding:"10px",
    border:"1px solid #ccc",
    borderRadius:"6px"
  }}
  onChange={(e)=>{

    const updated = cases.map((item)=>{

      if(item.id === c.id){
        return {...item,answer:e.target.value}
      }

      return item

    })

    setCases(updated)
            }}
            onBlur={async (e)=>{

              const value = e.target.value;

              await supabase
                .from("cases")
                .update({
                  answer:value
                })
                .eq("id",c.id);

            }}
          />

          <div style={{
            display:"flex",
            justifyContent:"flex-end",
            marginTop:"15px"
          }}>

            <button
  disabled={!c.answer}
  style={{
    background: c.answer ? "green" : "#999",
    color:"white",
    padding:"10px 20px",
    border:"none",
    borderRadius:"5px",
    cursor: c.answer ? "pointer" : "not-allowed",
    opacity: c.answer ? 1 : 0.6
  }}
  onClick={async ()=>{

  await supabase
    .from("cases")
    .update({status:"answered"})
    .eq("id",c.id);

  await fetch("/api/send-email",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
  email: c.email,
  answer: c.answer,
  id: c.id
})
  });

  loadCases();

}}

>
  Завершить
</button>


          </div>

        </div>

      ))}

    </main>

  );

}
