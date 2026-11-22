"use client";
import Link from "next/link";
export default function ErrorPage({reset}: {reset: () => void}) { return <main className="page"><section className="shell narrow stack"><p className="eyebrow">Что-то пошло не так</p><h1 className="section-title">Не удалось открыть страницу</h1><p className="lead">Попробуйте ещё раз через некоторое время.</p><div><button className="button" onClick={reset}>Попробовать ещё раз</button></div><Link className="link" href="/">На главную</Link></section></main>; }
