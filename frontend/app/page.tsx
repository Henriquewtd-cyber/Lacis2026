"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// ─── Image sets – each set shows 4 images simultaneously in a 2×2 grid ───
// Replace src values with your actual paths inside /public/images/
const imageSets: { src: string; alt: string }[][] = [
  [
    { src: "/img1.png", alt: "Imagem 1A" },
    { src: "/img2.png", alt: "Imagem 1B" },
    { src: "/img3.png", alt: "Imagem 1C" },
    { src: "/img4.png", alt: "Imagem 1D" },
  ],
  [
    { src: "/images/set2-a.jpg", alt: "Imagem 2A" },
    { src: "/images/set2-b.jpg", alt: "Imagem 2B" },
    { src: "/images/set2-c.jpg", alt: "Imagem 2C" },
    { src: "/images/set2-d.jpg", alt: "Imagem 2D" },
  ],
  [
    { src: "/images/set3-a.jpg", alt: "Imagem 3A" },
    { src: "/images/set3-b.jpg", alt: "Imagem 3B" },
    { src: "/images/set3-c.jpg", alt: "Imagem 3C" },
    { src: "/images/set3-d.jpg", alt: "Imagem 3D" },
  ],
];

const cellFallbacks = ["#1a3a3a", "#2a3a1a", "#1a3020", "#1a2a3a"];

export default function Home() {
  const [setIndex, setSetIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setSetIndex((prev) => (prev + 1) % imageSets.length);
        setVisible(true);
      }, 500);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const currentSet = imageSets[setIndex];

  return (
    <main
      className="h-screen w-screen overflow-hidden grid grid-cols-3"
      style={{
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        display: "grid",
        gridTemplateColumns: "1fr 2fr 1fr",
      }}
    >
      {/* ══════════ LEFT – navy ══════════ */}
      <aside
        className="flex flex-col items-center justify-around py-10 px-8 border-r border-white/10 overflow-hidden gap-50"
        style={{ background: "#0b1145" }}
      >
        {/* Top block */}
        <div className="w-full flex flex-col items-center gap-6">
          <Image src="/brasao_usp1.png" alt="USP logo" width={50} height={50} />

          <p className="text-[12px] leading-relaxed text-white/75 text-center">
            <strong className="text-white font-bold">USP</strong> Universidade de São Paulo
            <br />
            <strong className="text-white font-bold">ECA</strong> Escola de Comunicações e Artes
            <br />
            <strong className="text-white font-bold">CBD</strong> Departamento de Informação e Cultura
          </p>

          <Image
            src="/logo_semfundo.png"
            alt="LACIS logo"
            width={300}
            height={40}
            className="object-contain"
          />
        </div>

        {/* Bottom block */}
        <div className="text-center mb-0.5">
          <p className="text-[12px] text-white/80 leading-snug">
            <strong className="text-white">LACIS</strong> Laboratório de Cultura,
            <br />
            Informação e Sociedade
          </p>
          <a
            href="mailto:lacis@usp.br"
            className="mt-2 block text-[12px] text-[#7ec8f4] hover:text-white transition-colors"
          >
            lacis@usp.br
          </a>
        </div>
      </aside>

      {/* ══════════ CENTER – 2×2 tall image grid + nav tags ══════════ */}
      <section className="relative overflow-hidden" style={{ background: "#000" }}>

        {/* 2×2 grid filling the full column height */}
        <div
          className="absolute inset-0"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}
        >
          {currentSet.map((img, i) => (
            <div key={i} className="relative overflow-hidden">
              {/*
                Replace with Next.js <Image>:
                <Image src={img.src} alt={img.alt} fill style={{ objectFit: "cover" }} />
              */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${img.src})`,
                  backgroundColor: cellFallbacks[i],
                }}
              />
            </div>
          ))}
        </div>

        {/* Floating nav tags */}
        <nav className="absolute inset-0 pointer-events-none z-10">
          {/* Top-right quadrant: CURSOS × 2 + AGENDA */}
          <div className="absolute top-0 left-1/2 w-1/2 flex flex-col items-start pt-3 pl-2 gap-2 pointer-events-none">
            {[
              { label: "CURSOS DE EXTENSÃO", href: "#cursos" },
              { label: "CURSOS DE EXTENSÃO", href: "#cursos2" },
              { label: "AGENDA", href: "#agenda" },
            ].map((t) => (
              <a
                key={t.href}
                href={t.href}
                className="pointer-events-auto inline-block bg-black text-white
                           font-bold uppercase text-[13px] px-3 py-[5px]
                           hover:bg-white hover:text-black transition-colors duration-150"
                style={{ letterSpacing: "0.07em" }}
              >
                {t.label}
              </a>
            ))}
          </div>

          {/* Bottom-left quadrant: SOBRE / TEXTOS / PESQUISAS */}
          <div className="absolute bottom-10 left-2 flex flex-col items-start gap-2 pointer-events-none">
            {[
              { label: "SOBRE O LACIS", href: "#sobre" },
              { label: "TEXTOS", href: "#textos" },
              { label: "PESQUISAS", href: "#pesquisas" },
            ].map((t) => (
              <a
                key={t.href}
                href={t.href}
                className="pointer-events-auto inline-block bg-black text-white
                           font-bold uppercase text-[13px] px-3 py-[5px]
                           hover:bg-white hover:text-black transition-colors duration-150"
                style={{ letterSpacing: "0.07em" }}
              >
                {t.label}
              </a>
            ))}
          </div>
        </nav>

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {imageSets.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setVisible(false);
                setTimeout(() => { setSetIndex(i); setVisible(true); }, 500);
              }}
              aria-label={`Conjunto ${i + 1}`}
              className="w-2 h-2 rounded-full border border-white/50 transition-colors"
              style={{ background: i === setIndex ? "#fff" : "rgba(255,255,255,0.25)" }}
            />
          ))}
        </div>
      </section>

      {/* ══════════ RIGHT – dark green ══════════ */}
      <aside
        className="flex flex-col items-center justify-around py-10 px-8 border-r border-white/10 overflow-hidden gap-50"
        style={{ background: "#0c3b2e" }}
      >
        {/* Top: event block */}
        <div className="w-11/12 flex flex-col items-center gap-6">
          <h2
            className="text-white font-black text-base uppercase leading-tight mb-5"
            style={{ letterSpacing: "0.15em" }}
          >
            ENCONTRO DE AGOSTO
          </h2>

          {/* Event photo – replace with <Image> */}
          <div
            className="w-full overflow-hidden rounded-sm"
            style={{ aspectRatio: "4/3", background: "rgba(0,0,0,0.35)" }}
          >
            <Image
              src="/evento1.png"
              alt="Foto do encontro"
              width={400}
              height={300}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* CTA */}
        <a
          href="#encontro"
          className="text-white font-bold text-[16px] leading-snug hover:text-[#a8e6cf] transition-colors"
        >
          INFORMAÇÕES e INSCRIÇÕES
        </a>
      </aside>
    </main>
  );
}