"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const maxFileSize = 50 * 1024 * 1024;

function formatSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export default function Request() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  function validateFile(file: File) {
    if (!allowedTypes.includes(file.type)) {
      return "Недопустимый формат файла. Поддерживаются PDF, JPG, PNG, DOC и DOCX.";
    }

    if (file.size > maxFileSize) {
      return "Файл больше 50 MB. Для КТ или МРТ загрузите файл на облачный диск и вставьте ссылку в описание.";
    }

    return "";
  }

  async function sendRequest() {
    setError("");

    if (!email.includes("@")) {
      setError("Введите корректный email.");
      return;
    }

    if (!question.trim() && files.length === 0) {
      setError("Опишите ситуацию или прикрепите документы.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("question", question);
    files.forEach((file) => formData.append("files", file));

    const response = await fetch("/api/submit-request", {
      body: formData,
      method: "POST",
    });
    const result = (await response.json()) as { error?: string };

    setIsUploading(false);

    if (!response.ok) {
      setError(result.error || "Ошибка отправки заявки. Попробуйте позже.");
      return;
    }

    setEmail("");
    setQuestion("");
    setFiles([]);
    router.push("/success");
  }

  return (
    <main className="page">
      <section className="shell narrow stack">
        <div>
          <p className="eyebrow">Заявка</p>
          <h1 className="section-title">
            Отправить документы на второе мнение
          </h1>
          <p className="lead">
            Загрузите медицинские документы и опишите вашу ситуацию своими
            словами.
          </p>
        </div>

        <div className="notice">
          <b>Правила загрузки документов</b>
          <ul className="list">
            <li>Максимальный размер одного файла - 50 MB</li>
            <li>Поддерживаемые форматы: PDF, JPG, PNG, DOC, DOCX</li>
            <li>Можно прикрепить несколько файлов</li>
            <li>
              КТ и МРТ обычно имеют большой размер. Загрузите их на облако и
              вставьте ссылку в описание.
            </li>
          </ul>
        </div>

        <div className="card form">
          <label className="stack">
            <span className="muted">Ваш email</span>
            <input
              className="field"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              type="email"
              value={email}
            />
          </label>

          <label className="stack">
            <span className="muted">Описание ситуации</span>
            <textarea
              className="field textarea"
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Опишите диагноз, назначенное лечение и главный вопрос врачу"
              value={question}
            />
          </label>

          <div>
            <button
              className="button button-secondary"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              Выбрать файлы
            </button>
            <input
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              multiple
              onChange={(event) => {
                const selectedFiles = Array.from(event.target.files || []);
                const validationError = selectedFiles
                  .map(validateFile)
                  .find(Boolean);

                if (validationError) {
                  setError(validationError);
                  return;
                }

                setError("");
                setFiles((currentFiles) => [
                  ...currentFiles,
                  ...selectedFiles,
                ]);
              }}
              ref={fileInputRef}
              style={{ display: "none" }}
              type="file"
            />
          </div>

          {files.length > 0 && (
            <div>
              {files.map((file, index) => (
                <div className="file-row" key={`${file.name}-${index}`}>
                  <span>
                    {file.name} ({formatSize(file.size)})
                  </span>
                  <button
                    className="danger-link"
                    onClick={() => {
                      setFiles((currentFiles) =>
                        currentFiles.filter((_, fileIndex) => fileIndex !== index),
                      );

                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    type="button"
                  >
                    Удалить
                  </button>
                </div>
              ))}
              <p className="muted">Прикреплено файлов: {files.length}</p>
            </div>
          )}

          {error && <div className="notice">{error}</div>}

          {isUploading && <div className="notice">Загрузка файлов...</div>}

          <div>
            <button
              className="button"
              disabled={isUploading}
              onClick={sendRequest}
              type="button"
            >
              {isUploading ? "Отправляем..." : "Отправить запрос"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
