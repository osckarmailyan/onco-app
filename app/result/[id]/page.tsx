"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function Result() {

  const params = useParams();
  const id = params?.id as string;

  const [caseData,setCaseData] = useState<any>(null);

  useEffect(()=>{

    if(!id) return;

    async function loadCase(){

      const { data } = await supabase
        .from("cases")
        .select("*")
        .eq("id", id)
        .single();

      if(data){
        setCaseData(data);
      }

    }

    loadCase();

  },[id]);

  if(!caseData){
    return <p style={{padding:"40px"}}>Загрузка...</p>
  }

  return(

    <main style={{
      maxWidth:"800px",
      margin:"80px auto",
      fontFamily:"sans-serif",
      padding:"20px"
    }}>

      <h1 style={{
        fontSize:"36px",
        fontWeight:"bold"
      }}>
        Второе мнение врача
      </h1>

      <p style={{
        marginTop:"10px",
        color:"#555"
      }}>
        Ответ подготовлен по вашему медицинскому случаю
      </p>

      <div style={{
        marginTop:"40px",
        padding:"20px",
        border:"1px solid #ddd",
        borderRadius:"8px",
        background:"#fafafa"
      }}>

        <p style={{fontWeight:"bold"}}>
          Ответ подготовил
        </p>

        <p style={{marginTop:"5px"}}>
          👨‍⚕️ Доктор Оскар Араратович Маилян
        </p>

        <p style={{color:"#666"}}>
          Онколог-уролог, кандидат медицинских наук
        </p>

      </div>

      <p style={{
        marginTop:"40px",
        fontWeight:"bold"
      }}>
        Ваш вопрос
      </p>

      <div style={{
        marginTop:"10px",
        background:"#f5f5f5",
        padding:"20px",
        borderRadius:"8px"
      }}>
        {caseData.question}
      </div>

      <p style={{
        marginTop:"40px",
        fontWeight:"bold"
      }}>
        Ответ врача
      </p>

      <div style={{
        marginTop:"10px",
        background:"#e8f7e8",
        padding:"20px",
        borderRadius:"8px"
      }}>
        {caseData.answer || "Ответ пока готовится"}
      </div>

      <p style={{
        marginTop:"40px",
        color:"#777",
        fontSize:"14px"
      }}>
        ⚠️ Данный ответ является информационным вторым мнением
        и не заменяет очную консультацию врача.
      </p>

    </main>

  );

}