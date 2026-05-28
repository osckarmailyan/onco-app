import { getSupabaseAdmin } from "../../../lib/supabase-admin";
import { supabase } from "../../../lib/supabase";

const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const maxFileSize = 50 * 1024 * 1024;

type IncomingFile = {
  name: string;
  size: number;
  type: string;
};

function getSafeFileName(name: string) {
  return name.replace(/[^\w.-]/g, "_");
}

function createFilePath(name: string) {
  return `${crypto.randomUUID()}/${crypto.randomUUID()}_${getSafeFileName(name)}`;
}

function isGeneratedPath(path: string) {
  return /^[0-9a-f-]{36}\/[0-9a-f-]{36}_[\w.-]+$/i.test(path);
}

function validateFile(file: IncomingFile) {
  if (!allowedTypes.includes(file.type)) {
    return "Недопустимый формат файла. Поддерживаются PDF, JPG, PNG, DOC и DOCX.";
  }

  if (file.size > maxFileSize) {
    return "Файл больше 50 MB. Для КТ или МРТ загрузите файл на облачный диск и вставьте ссылку в описание.";
  }

  return "";
}

function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function POST(req: Request) {
  let supabaseClient = supabase;

  try {
    supabaseClient = getSupabaseAdmin();
  } catch {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is not configured; using anon key.");
  }

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    let body: {
      action?: string;
      email?: string;
      files?: IncomingFile[] | string[];
      question?: string;
    };

    try {
      body = await req.json();
    } catch {
      return jsonError("Не удалось прочитать заявку.", 400);
    }

    const email = String(body.email || "").trim();
    const question = String(body.question || "").trim();

    if (!email.includes("@")) {
      return jsonError("Введите корректный email.");
    }

    if (body.action === "prepare") {
      const files = Array.isArray(body.files)
        ? (body.files as IncomingFile[]).filter((file) => file.size > 0)
        : [];

      if (!question && files.length === 0) {
        return jsonError("Опишите ситуацию или прикрепите документы.");
      }

      const uploads = [];

      for (const [index, file] of files.entries()) {
        const validationError = validateFile(file);

        if (validationError) {
          return jsonError(validationError);
        }

        const path = createFilePath(file.name);
        const { data, error } = await supabaseClient.storage
          .from("cases")
          .createSignedUploadUrl(path);

        if (error) {
          console.error("Supabase signed upload URL failed", error);
          return jsonError(
            `Supabase не подготовил загрузку: ${error.message || "проверьте bucket cases и Storage policies."}`,
            502,
          );
        }

        uploads.push({
          index,
          name: file.name,
          path,
          token: data.token,
        });
      }

      return Response.json({ uploads });
    }

    if (body.action === "complete") {
      const files = Array.isArray(body.files)
        ? (body.files as string[]).filter(
            (path) => typeof path === "string" && isGeneratedPath(path),
          )
        : [];

      if (!question && files.length === 0) {
        return jsonError("Опишите ситуацию или прикрепите документы.");
      }

      const { error } = await supabaseClient.from("cases").insert([
        {
          email,
          file: files,
          question,
          status: "new",
        },
      ]);

      if (error) {
        console.error("Supabase case insert failed", error);
        return jsonError(
          `Supabase не принял заявку: ${error.message || "проверьте таблицу cases и RLS policies."}`,
          502,
        );
      }

      return Response.json({ success: true });
    }

    return jsonError("Неизвестное действие.", 400);
  }

  let formData: FormData;

  try {
    formData = await req.formData();
  } catch {
    return jsonError("Не удалось прочитать форму.", 400);
  }

  const email = String(formData.get("email") || "").trim();
  const question = String(formData.get("question") || "").trim();
  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (!email.includes("@")) {
    return jsonError("Введите корректный email.");
  }

  if (!question && files.length === 0) {
    return jsonError("Опишите ситуацию или прикрепите документы.");
  }

  const uploadedFiles: string[] = [];

  for (const file of files) {
    const validationError = validateFile(file);

    if (validationError) {
      return jsonError(validationError);
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = createFilePath(file.name);
    const { data, error } = await supabaseClient.storage
      .from("cases")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
      });

    if (error) {
      console.error("Supabase storage upload failed", error);
      return jsonError(
        `Supabase не принял файл: ${error.message || "проверьте bucket cases и Storage policies."}`,
        502,
      );
    }

    uploadedFiles.push(data.path);
  }

  const { error } = await supabaseClient.from("cases").insert([
    {
      email,
      file: uploadedFiles,
      question,
      status: "new",
    },
  ]);

  if (error) {
    console.error("Supabase case insert failed", error);
    return jsonError(
      `Supabase не принял заявку: ${error.message || "проверьте таблицу cases и RLS policies."}`,
      502,
    );
  }

  return Response.json({ success: true });
}
