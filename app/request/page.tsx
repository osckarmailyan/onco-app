"use client";

import { useSearchParams } from "next/navigation";
import { useState, useRef } from "react";
import { supabase } from "../../lib/supabase";


export default function Request() {

  const searchParams = useSearchParams();

  if (searchParams.get("paid") !== "true") {
    return (
      <main style={{padding:"40px",fontFamily:"sans-serif"}}>
        <h1>Доступ запрещён</h1>
        <p>Сначала оплатите консультацию</p>
      </main>
    );
  }

  const [email,setEmail] = useState("");
  const [question,setQuestion] = useState("");
  const [files,setFiles] = useState<File[]>([]);
  const [isUploading,setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function formatSize(bytes:number){
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(1) + " MB";
  }

  async function sendRequest(){

    setIsUploading(true);

    if(!email.includes("@")){
      alert("Введите корректный email");
      setIsUploading(false);
      return;
    }

    let uploadedFiles:string[] = [];

    for(const file of files){

      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];

      if(!allowedTypes.includes(file.type)){
        alert("Недопустимый формат файла");
        setIsUploading(false);
        return;
      }

      if(file.size > 50 * 1024 * 1024){
        alert("Файл больше 50MB. Если это КТ или МРТ — загрузите файл на облачный диск и вставьте ссылку в описание.");
        setIsUploading(false);
        return;
      }

      const cleanName = file.name.replace(/[^\w.]/g,"_");
      const fileName = Date.now()+"_"+cleanName;

      const { data, error } = await supabase
        .storage
        .from("cases")
        .upload(fileName,file,{
          contentType:file.type
        });

      if(error){
        console.log(error);
        alert("Ошибка загрузки файла");
        setIsUploading(false);
        return;
      }

      uploadedFiles.push(data.path);

    }

    const { error } = await supabase
      .from("cases")
      .insert([
        {
          email:email,
          question:question,
          file:uploadedFiles
        }
      ]);

    if(error){
      alert("Ошибка отправки");
    }else{
      alert("Запрос отправлен");
      setEmail("");
      setQuestion("");
      setFiles([]);
    }

    setIsUploading(false);

  }

  return(

    <main style={{maxWidth:"700px",margin:"100px auto",fontFamily:"sans-serif"}}>

      <h1 style={{fontSize:"34px",fontWeight:"bold"}}>
        Отправить документы на второе мнение
      </h1>

      <p style={{marginTop:"20px"}}>
        Загрузите медицинские документы и опишите вашу ситуацию.
      </p>

      <div style={{
        background:"#fff8e1",
        padding:"20px",
        borderRadius:"8px",
        marginTop:"20px",
        fontSize:"14px"
      }}>

        <b>Правила загрузки документов</b>

        <ul style={{marginTop:"10px"}}>

          <li>
            Максимальный размер одного файла — <b>50 MB</b>
          </li>

          <li>
            Поддерживаемые форматы:
            <b> PDF, JPG, PNG, DOC, DOCX</b>
          </li>

          <li>
            Вы можете прикрепить несколько файлов
          </li>

          <li>
            <b>КТ и МРТ</b> обычно имеют большой размер.
            Загрузите их на облако (Google Drive / Яндекс Диск / Dropbox)
            и вставьте ссылку в описание.
          </li>

        </ul>

      </div>

      <div style={{marginTop:"40px"}}>

        <input
          type="email"
          placeholder="Ваш email"
          value={email}
          style={{
            width:"100%",
            padding:"12px",
            marginBottom:"10px",
            border:"1px solid #ccc"
          }}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <textarea
  placeholder="Вы можете описать ситуацию своими словами — не обязательно медицинским языком"
  value={question}
  style={{
    width:"100%",
    height:"120px",
    padding:"12px",
    marginBottom:"3px",
    border:"1px solid #ccc"
  }}
  onChange={(e)=>setQuestion(e.target.value)}
/>
  
<button
  style={{
    padding:"10px 16px",
    border:"1px solid #ccc",
    background:"#f5f5f5",
    cursor:"pointer",
    marginBottom:"15px"
  }}
  onClick={()=>{
    if(fileInputRef.current){
      fileInputRef.current.click()
    }
  }}
>
  Выбрать файлы
</button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          multiple
          style={{display:"none"}}
          onChange={(e)=>{

            const newFiles = Array.from(e.target.files || []);

            for(const file of newFiles){
              if(file.size > 50 * 1024 * 1024){
                alert("Вы прикрепили файл больше 50MB. Загрузите такие файлы на облачный диск и вставьте ссылку.");
                return;
              }
            }

            setFiles(prev => [...prev,...newFiles]);

          }}
        />

        {files.length > 0 && (

          <div style={{marginBottom:"15px"}}>

            {files.map((file,i)=>(
              <div key={i} style={{
                display:"flex",
                justifyContent:"space-between",
                marginBottom:"6px",
                borderBottom:"1px solid #eee",
                paddingBottom:"4px"
              }}>

                <span>
                  📎 {file.name} ({formatSize(file.size)})
                </span>

                <button
                  style={{
                    background:"none",
                    border:"none",
                    color:"red",
                    cursor:"pointer"
                  }}
                  onClick={()=>{
                    setFiles(files.filter((_,index)=>index !== i))
                    if(fileInputRef.current){
    fileInputRef.current.value = "";
  }
                  }}
                >
                  удалить
                </button>

              </div>
            ))}

          </div>

        )}

        {files.length > 0 && (
          <p style={{color:"gray", marginBottom:"10px"}}>
            📎 прикреплено файлов: {files.length}
          </p>
        )}

        {isUploading && (
          <div style={{
            marginBottom:"20px",
            padding:"15px",
            background:"#f5f5f5",
            borderRadius:"8px"
          }}>
            Загрузка файлов...
          </div>
        )}

        <button
          style={{
            background:"black",
            color:"white",
            padding:"12px 20px",
            border:"none",
            cursor:"pointer"
          }}
          onClick={sendRequest}
        >
          Отправить запрос
        </button>

      </div>

    </main>

  );

}