import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { socialImageAlt } from "@/lib/site-metadata";

export const alt = socialImageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";
export const dynamic = "force-static";

// Bundled, openly licensed Cyrillic font: no request to a third-party font service.
const fontData = readFile(join(process.cwd(), "assets/fonts/PTSans-Regular.ttf"));

export default async function OpenGraphImage() {
  const font = await fontData;
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "58px 66px", background: "#f8f7f3", color: "#20364a", fontFamily: "PT Sans" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 44, letterSpacing: -1 }}>
        <span>OncoExperts</span>
        <svg width="42" height="42" viewBox="0 0 64 64" fill="none" stroke="#7b866f" strokeWidth="3.5" strokeLinecap="round"><path d="M32 9v46M9 32h46M16 16l32 32M16 48l32-32"/></svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 70, lineHeight: 1.1, letterSpacing: -1.5 }}>
        <span>С диагнозом</span>
        <span>не обязательно оставаться</span>
        <span style={{ color: "#65785f" }}>один на один</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 30, borderTop: "1px solid #cdd5c5", paddingTop: 24, fontSize: 25, color: "#596750" }}>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}><span>Индивидуальная онлайн-встреча</span><span>с врачом-онкологом</span></div>
        <span>oncoexperts.ru</span>
      </div>
    </div>,
    { ...size, fonts: [{ name: "PT Sans", data: Uint8Array.from(font).buffer, style: "normal", weight: 400 }] },
  );
}
