import { getSupabaseAdmin } from "../../../lib/supabase-admin";

const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const maxFileSize = 50 * 1024 * 1024;

function getSafeFileName(name: string) {
  return name.replace(/[^\w.-]/g, "_");
}

function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const supabaseAdmin = getSupabaseAdmin();
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
    if (!allowedTypes.includes(file.type)) {
      return jsonError(
        "Недопустимый формат файла. Поддерживаются PDF, JPG, PNG, DOC и DOCX.",
      );
    }

    if (file.size > maxFileSize) {
      return jsonError(
        "Файл больше 50 MB. Для КТ или МРТ загрузите файл на облачный диск и вставьте ссылку в описание.",
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${crypto.randomUUID()}_${getSafeFileName(file.name)}`;
    const { data, error } = await supabaseAdmin.storage
      .from("cases")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
      });

    if (error) {
      console.error("Supabase storage upload failed", error);
      return jsonError("Не удалось загрузить файл. Попробуйте позже.", 502);
    }

    uploadedFiles.push(data.path);
  }

  const { error } = await supabaseAdmin.from("cases").insert([
    {
      email,
      file: uploadedFiles,
      question,
      status: "new",
    },
  ]);

  if (error) {
    console.error("Supabase case insert failed", error);
    return jsonError("Не удалось отправить заявку. Попробуйте позже.", 502);
  }

  return Response.json({ success: true });
}
