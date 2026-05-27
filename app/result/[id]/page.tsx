"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type CaseRecord = {
  answer: string | null;
  question: string | null;
};

export default function Result() {
  const params = useParams();
  const id = params?.id as string;
  const [caseData, setCaseData] = useState<CaseRecord | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function loadCase() {
      const { data, error: loadError } = await supabase
        .from("cases")
        .select("question, answer")
        .eq("id", id)
        .single();

      if (loadError) {
        setError("Ответ не найден или ссылка устарела.");
        return;
      }

      setCaseData(data as CaseRecord);
    }

    void loadCase();
  }, [id]);

  if (error) {
    return (
      <main className="page">
        <section className="shell narrow card stack">
          <h1 className="section-title">Не удалось открыть ответ</h1>
          <p className="lead">{error}</p>
        </section>
      </main>
    );
  }

  if (!caseData) {
    return (
      <main className="page">
        <section className="shell narrow card">
          <p className="lead">Загрузка...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="shell narrow stack">
        <div>
          <p className="eyebrow">Второе мнение</p>
          <h1 className="section-title">Ответ врача</h1>
          <p className="lead">
            Ответ подготовлен по вашему медицинскому случаю.
          </p>
        </div>

        <div className="card stack">
          <p className="muted">Ответ подготовил</p>
          <p className="text">
            <b>Доктор Оскар Араратович Маилян</b>
            <br />
            Онколог-уролог, кандидат медицинских наук
          </p>
        </div>

        <div className="card stack">
          <p className="muted">Ваш вопрос</p>
          <p className="text">{caseData.question || "Вопрос не указан."}</p>
        </div>

        <div className="card stack success">
          <p className="muted">Ответ врача</p>
          <p className="text">{caseData.answer || "Ответ пока готовится."}</p>
        </div>

        <p className="muted">
          Данный ответ является информационным вторым мнением и не заменяет
          очную консультацию врача.
        </p>
      </section>
    </main>
  );
}
