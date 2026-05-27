"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type CaseStatus = "new" | "in_review" | "answered";

type CaseRecord = {
  id: string;
  created_at: string;
  email: string;
  question: string;
  file: string[] | null;
  status: CaseStatus | null;
  answer: string | null;
};

const statusLabels: Record<CaseStatus, string> = {
  answered: "Ответ готов",
  in_review: "На рассмотрении",
  new: "Новый",
};

function getStorageUrl(path: string) {
  const { data } = supabase.storage.from("cases").getPublicUrl(path);
  return data.publicUrl;
}

export default function Admin() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [error, setError] = useState("");

  async function loadCases() {
    const { data, error: loadError } = await supabase
      .from("cases")
      .select("*")
      .order("created_at", { ascending: false });

    if (loadError) {
      setError("Не удалось загрузить заявки.");
      return;
    }

    setCases((data || []) as CaseRecord[]);
  }

  useEffect(() => {
    void loadCases();
  }, []);

  return (
    <main className="page">
      <section className="shell stack">
        <div>
          <p className="eyebrow">Админ-панель</p>
          <h1 className="section-title">Панель врача</h1>
        </div>

        {error && <div className="notice">{error}</div>}

        {cases.length === 0 && !error && (
          <div className="card">
            <p className="muted">Заявок пока нет.</p>
          </div>
        )}

        {cases.map((item) => (
          <article className="card admin-case" key={item.id}>
            <div>
              <p className="muted">Email пациента</p>
              <p className="text">
                <b>{item.email}</b>
              </p>
            </div>

            <div>
              <p className="muted">Вопрос пациента</p>
              <div className="notice">{item.question || "Описание не заполнено."}</div>
            </div>

            {item.file && item.file.length > 0 && (
              <div>
                <p className="muted">Файлы пациента</p>
                {item.file.map((file, index) => (
                  <div key={file}>
                    <a
                      className="link"
                      href={getStorageUrl(file)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Файл {index + 1}
                    </a>
                  </div>
                ))}
              </div>
            )}

            <p className="text">
              <b>Статус:</b>{" "}
              {statusLabels[(item.status || "new") as CaseStatus]}
            </p>

            <div>
              <button
                className="button button-secondary"
                onClick={async () => {
                  await supabase
                    .from("cases")
                    .update({ status: "in_review" })
                    .eq("id", item.id);

                  await loadCases();
                }}
                type="button"
              >
                В работу
              </button>
            </div>

            <p className="muted">
              {new Date(item.created_at).toLocaleString("ru-RU", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>

            <label className="stack">
              <span className="muted">Ответ врача</span>
              <textarea
                className="field textarea"
                onBlur={async (event) => {
                  await supabase
                    .from("cases")
                    .update({ answer: event.target.value })
                    .eq("id", item.id);
                }}
                onChange={(event) => {
                  setCases((currentCases) =>
                    currentCases.map((currentCase) =>
                      currentCase.id === item.id
                        ? { ...currentCase, answer: event.target.value }
                        : currentCase,
                    ),
                  );
                }}
                value={item.answer || ""}
              />
            </label>

            <div>
              <button
                className="button"
                disabled={!item.answer}
                onClick={async () => {
                  await supabase
                    .from("cases")
                    .update({ status: "answered" })
                    .eq("id", item.id);

                  await fetch("/api/send-email", {
                    body: JSON.stringify({
                      email: item.email,
                      id: item.id,
                    }),
                    headers: {
                      "Content-Type": "application/json",
                    },
                    method: "POST",
                  });

                  await loadCases();
                }}
                type="button"
              >
                Завершить и отправить письмо
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
