"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// ─── 12 images: 4 cells × 3 each ───
// Replace src values with paths inside /public/
const cellImages = [
  // Cell 0 – top-left
  [
    { src: "/img1.png", alt: "Imagem 1A" },
    { src: "/img5.png", alt: "Imagem 1B" },
    { src: "/img1c.png", alt: "Imagem 1C" },
  ],
  // Cell 1 – top-right
  [
    { src: "/img2.png", alt: "Imagem 2A" },
    { src: "/img6.png", alt: "Imagem 2B" },
    { src: "/img2c.png", alt: "Imagem 2C" },
  ],
  // Cell 2 – bottom-left
  [
    { src: "/img3.png", alt: "Imagem 3A" },
    { src: "/img7.jpg", alt: "Imagem 3B" },
    { src: "/img3c.png", alt: "Imagem 3C" },
  ],
  // Cell 3 – bottom-right
  [
    { src: "/img4.png", alt: "Imagem 4A" },
    { src: "/img8.jpg", alt: "Imagem 4B" },
    { src: "/img4c.png", alt: "Imagem 4C" },
  ],
];

// Staggered intervals so cells rotate at different times
const CELL_INTERVALS = [5000, 6500, 4500, 7000];
const FADE_MS = 500;
const FALLBACKS = ["#1a3a3a", "#2a3a1a", "#1a3020", "#1a2a3a"];

function NavTag({ label, href }: { label: string; href: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-block",

        background: hovered ? "#fff" : "#000",
        color: hovered ? "#000" : "#fff",

        fontWeight: 400,
        textTransform: "uppercase",

        fontSize: "2rem",
        lineHeight: 1,

        padding: "0.2rem 0.8rem",

        letterSpacing: "-0.03em",

        textDecoration: "none",

        transition: "all 0.15s ease",

        whiteSpace: "nowrap",

        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",

        boxShadow: hovered
          ? "0 0 25px rgba(255,255,255,0.25)"
          : "none",
      }}
    >
      {label}
    </a>
  );
}

function RotatingCell({ images, interval, fallback }: { images: Array<{ src: string; alt: string }>; interval: number; fallback: string }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % images.length);
        setVisible(true);
      }, FADE_MS);
    }, interval);
    return () => clearInterval(id);
  }, [images.length, interval]);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundImage: `url(${images[index].src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: fallback,
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS * 2}ms linear`,
      }}
      aria-label={images[index].alt}
    />
  );
}

export default function Home() {
  return (
    <main
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "1fr 2fr 1fr",
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
      }}
    >
      {/* ══════════ LEFT – navy ══════════ */}
      <aside
        style={{
          background: "#0b1145",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "2.5rem 2rem",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          overflow: "hidden",
          gap: "4rem",
        }}
      >
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
          {/* USP crest placeholder */}
          <Image src="/brasao_usp1.png" alt="Brasão USP" width={60} height={80} />

          <p style={{ fontSize: 20, lineHeight: 1.6, color: "rgba(255,255,255,0.75)", textAlign: "center", margin: 0 }}>
            <strong style={{ color: "#fff", fontWeight: 700 }}>USP</strong> Universidade de São Paulo<br />
            <strong style={{ color: "#fff", fontWeight: 700 }}>ECA</strong> Escola de Comunicações e Artes<br />
            <strong style={{ color: "#fff", fontWeight: 700 }}>CBD</strong> Departamento de Informação e Cultura
          </p>

          {/* LACIS logo placeholder */}
          <Image src="/logo_semfundo.png" alt="LACIS logo" width={300} height={300} />
        </div>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p style={{ fontSize: 22, color: "rgba(255,255,255,0.8)", lineHeight: 1.5, margin: "0 0 0.5rem" }}>
            <strong style={{ color: "#fff" }}>LACIS</strong> Laboratório de Cultura,<br />
            Informação e Sociedade
          </p>
          <a href="mailto:lacis@usp.br" style={{ display: "block", fontSize: 22, color: "#7ec8f4", textDecoration: "none" }}>
            lacis@usp.br
          </a>
        </div>
      </aside>

      {/* ══════════ CENTER – 2×2 rotating image grid + floating nav ══════════ */}
      <section style={{ position: "relative", background: "#000" }}>

        {/* 2×2 grid fills the whole column */}
        <div
          style={{
            position: "absolute", inset: 0,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
          }}
        >
          <RotatingCell images={cellImages[0]} interval={CELL_INTERVALS[0]} fallback={FALLBACKS[0]} />
          <RotatingCell images={cellImages[1]} interval={CELL_INTERVALS[1]} fallback={FALLBACKS[1]} />
          <RotatingCell images={cellImages[2]} interval={CELL_INTERVALS[2]} fallback={FALLBACKS[2]} />
          <RotatingCell images={cellImages[3]} interval={CELL_INTERVALS[3]} fallback={FALLBACKS[3]} />
        </div>

        {/* Nav overlay – z-index 20, floats above grid, pointer-events on tags only */}
        {/* NAV CENTRAL */}
        <nav
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,

            display: "flex",
            flexDirection: "column",

            alignItems: "center",
            justifyContent: "center",

            gap: 10,

            pointerEvents: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 50,

              pointerEvents: "auto",
            }}
          >
            <NavTag label="CURSOS DE EXTENSÃO" href="#cursos" />
            <NavTag label="AGENDA" href="#agenda" />
            <NavTag label="SOBRE O LACIS" href="#sobre" />
            <NavTag label="TEXTOS" href="#textos" />
            <NavTag label="PESQUISAS" href="#pesquisas" />
          </div>
        </nav>

      </section>

      {/* ══════════ RIGHT – dark green ══════════ */}
      <aside
        style={{
          background: "#0c3b2e",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2.5rem 2rem",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          overflow: "hidden",
          gap: "4rem",
        }}
      >
        <div style={{ width: "91.666%", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
          <h2
            style={{
              color: "#fff", fontWeight: 900, fontSize: "1.5rem",
              textTransform: "uppercase", letterSpacing: "0.15em",
              lineHeight: 1.2, margin: 0, textAlign: "center",
            }}
          >
            PRÓXIMO ENCONTRO: AGOSTO 2026
          </h2>

          {/* Event photo placeholder */}
          <Image src="/evento1.png" alt="Event photo" width={600} height={500} />
        </div>

        <a
          href="#encontro"
          style={{ color: "#fff", fontWeight: 500, fontSize: 24, lineHeight: 1.4, textDecoration: "none", textAlign: "center" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#a8e6cf")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
        >
          O QUE É e INSCRIÇÕES
        </a>
      </aside>
    </main >
  );
}