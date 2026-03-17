import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const response = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotence-Key": Date.now().toString(),
      "Authorization":
        "Basic " +
        Buffer.from(
          process.env.YOOKASSA_SHOP_ID + ":" + process.env.YOOKASSA_SECRET_KEY
        ).toString("base64"),
    },
    body: JSON.stringify({
      amount: {
        value: "10000.00",
        currency: "RUB",
      },
      confirmation: {
        type: "redirect",
        return_url: "https://oncoexperts.ru/request?paid=true",
      },
      capture: true,
      description: "Второе мнение врача",
    }),
  });

  const data = await response.json();

  return NextResponse.json({
    confirmation_url: data.confirmation.confirmation_url,
    payment_id: data.id,
  });
}