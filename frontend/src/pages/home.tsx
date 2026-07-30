"use client";

import { useState, useEffect } from "react";

const cellImages = [
    [
        { src: "home-images/img1.webp", alt: "Imagem 1" },
        { src: "home-images/img5.webp", alt: "Imagem 5" },
        { src: "home-images/img9.webp", alt: "Imagem 9" },
        { src: "home-images/img13.webp", alt: "Imagem 13" },
    ],
    [
        { src: "home-images/img2.webp", alt: "Imagem 2" },
        { src: "home-images/img6.webp", alt: "Imagem 6" },
        { src: "home-images/img10.webp", alt: "Imagem 10" },
        { src: "home-images/img14.webp", alt: "Imagem 14" },
    ],
    [
        { src: "home-images/img3.webp", alt: "Imagem 3" },
        { src: "home-images/img7.webp", alt: "Imagem 7" },
        { src: "home-images/img11.webp", alt: "Imagem 11" },
        { src: "home-images/img15.webp", alt: "Imagem 15" },
    ],
    [
        { src: "home-images/img4.webp", alt: "Imagem 4" },
        { src: "home-images/img8.webp", alt: "Imagem 8" },
        { src: "home-images/img12.webp", alt: "Imagem 12" },
        { src: "home-images/img16.webp", alt: "Imagem 16" },
    ],
];

const CELL_INTERVALS = [10000, 10500, 11500, 11000];
const FADE_MS = 1000;
const FALLBACKS = ["#1a3a3a", "#2a3a1a", "#1a3020", "#1a2a3a"];

function NavTag({ label, href, ready = true }: { label: string; href: string; ready?: boolean }) {

    if (!ready) {
        return (
            <span
                style={{
                    display: "inline-block",
                    background: "#3a3a3a",
                    color: "#888",
                    fontWeight: 400,
                    textTransform: "uppercase",
                    fontSize: "2rem",
                    lineHeight: 1,
                    padding: "0.2rem 0.8rem",
                    letterSpacing: "-0.03em",
                    whiteSpace: "nowrap",
                    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
                    cursor: "default",
                    userSelect: "none",
                }}
                aria-disabled="true"
            >
                {label}
            </span>
        );
    }

    return (
        <a
            href={href}
            style={{
                display: "inline-block",
                background: "#000",
                color: "#fff",
                fontWeight: 400,
                textTransform: "uppercase",
                fontSize: "2rem",
                lineHeight: 1,
                padding: "0.2rem 0.8rem",
                letterSpacing: "-0.03em",
                textDecoration: "none",
                transition: "color 0.15s ease, box-shadow 0.15s ease",
                whiteSpace: "nowrap",
                fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
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
                filter: 'brightness(0.65) contrast(1.1) saturate(0.9)',
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
            {/* ══════════ LEFT – verde escuro quase preto ══════════ */}
            <aside
                style={{
                    background: "#001800",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "2.5rem 2rem",
                    borderRight: "1px solid rgba(255,255,255,0.1)",
                    overflow: "hidden",
                }}
            >
                {/* Bloco superior: brasão + texto USP/ECA/CBD */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
                    <img src="/brasao_usp1.webp" alt="Brasão USP" width={60} height={80} />
                    <p style={{ fontSize: 20, lineHeight: 1.6, color: "#90ee90", textAlign: "center", margin: 0 }}>
                        <strong style={{ color: "#90ee90", fontWeight: 700 }}>USP</strong> Universidade de São Paulo<br />
                        <strong style={{ color: "#90ee90", fontWeight: 700 }}>ECA</strong> Escola de Comunicações e Artes<br />
                        <strong style={{ color: "#90ee90", fontWeight: 700 }}>CBD</strong> Departamento de Informação e Cultura
                    </p>
                </div>

                {/* Centro: logomarca centralizada entre os dois blocos */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src="/logo_semfundo.webp" alt="LACIS logo" width={300} height={300} />
                </div>

                {/* Bloco inferior: nome LACIS + email */}
                <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 22, color: "#90ee90", lineHeight: 1.5, margin: "0 0 0.5rem" }}>
                        <strong style={{ color: "#90ee90" }}>LACIS</strong> Laboratório de Cultura,<br />
                        Informação e Sociedade
                    </p>
                    <a href="mailto:lacis@usp.br" style={{ display: "block", fontSize: 22, color: "#ccff00", textDecoration: "none" }}>
                        lacis@usp.br
                    </a>
                </div>
            </aside>

            {/* ══════════ CENTER – 2×2 rotating image grid + floating nav ══════════ */}
            <section style={{ position: "relative", background: "#000" }}>

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

                {/* Aviso "Site em construção" — flutua acima da primeira tag do nav,
        sem afetar o layout space-evenly do nav em si */}
                <p
                    style={{
                        position: "absolute",
                        top: "1rem",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 11,
                        color: "red",
                        fontSize: "1.5rem",
                        textAlign: "center",
                        margin: 0,
                        whiteSpace: "nowrap",
                    }}
                >
                    Site em construção!
                </p>

                {/* Nav overlay */}
                <nav
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 10,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "space-evenly",
                        padding: "3rem 0",
                    }}
                >
                    <NavTag label="SOBRE O LACIS" href="sobre" />
                    <NavTag label="AGENDA" href="" ready={false} />
                    <NavTag label="CURSOS DE EXTENSÃO" href="" ready={false} />
                    <NavTag label="TEXTOS" href="" ready={false} />
                    <NavTag label="PESQUISAS" href="" ready={false} />
                    <NavTag label="DIRIGENTES DE CULTURA BRASIL" href="dirigentes-de-cultura" />
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
                        ENCONTRO DE AGOSTO
                    </h2>

                    <img src="/evento1.webp" alt="Event photo" width={600} height={500} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>

                    <a
                        href="#sobre"
                        style={{ color: "#fff", fontWeight: 500, fontSize: 24, lineHeight: 1.4, textDecoration: "none", textAlign: "center" }}
                        onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "#a8e6cf")}
                        onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "#fff")}
                    >
                        O QUE É
                    </a>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 20 }}>/</span>

                    <a
                        href="#inscricoes"
                        style={{ color: "#fff", fontWeight: 500, fontSize: 24, lineHeight: 1.4, textDecoration: "none", textAlign: "center" }}
                        onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "#a8e6cf")}
                        onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "#fff")}
                    >
                        INSCRIÇÕES
                    </a>
                </div>
            </aside >
        </main >
    );
}