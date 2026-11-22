"use client";

import Link from "next/link";
import { useState } from "react";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <header className="site-header">
    <div className="shell nav-inner">
      <Link href="/" className="wordmark" aria-label="OncoExperts — на главную" onClick={close}>onco<span>experts</span><span className="brand-spark" aria-hidden="true">✳</span></Link>
      <button type="button" className="menu-toggle" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>{open ? "Закрыть" : "Меню"}<span aria-hidden="true">{open ? "×" : "☰"}</span></button>
      <nav id="site-navigation" aria-label="Основная навигация" className={`site-nav ${open ? "is-open" : ""}`}>
        <Link href="/#meeting" onClick={close}>О встрече</Link>
        <Link href="/#how" onClick={close}>Как всё проходит</Link>
        <Link href="/#doctor" onClick={close}>О враче</Link>
        <Link href="/#faq" onClick={close}>Вопросы</Link>
        <Link href="/request" className="button nav-cta" onClick={close}>Записаться</Link>
      </nav>
    </div>
  </header>;
}
