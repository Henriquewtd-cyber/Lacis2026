"use client";

import { useState } from "react";
import { MaisInfoModal, NavTag, cellImages, CELL_INTERVALS, FALLBACKS, FONT_FAMILY, RotatingCell } from "./home-components";

const NAV_FONT = "clamp(1.05rem, 5.2vw, 1.5rem)";

export default function HomeMobile() {
    const [showInfoModal, setShowInfoModal] = useState(false);

    return (
        <main
            style={{
                width: "100%",
                minHeight: "100dvh",
                display: "flex",
                flexDirection: "column",
                fontFamily: FONT_FAMILY,
                background: "#001800",
                overflowX: "hidden",
            }}
        >
            {/* ══════════ TOPO – brasão + USP/ECA/CBD (verde quase preto) ══════════ */}
            <header
                style={{
                    background: "#001800",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1.25rem 1.25rem",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
            >
                <img
                    src="/brasao_usp1.webp"
                    alt="Brasão USP"
                    width={44}
                    height={60}
                    style={{ flexShrink: 0, height: "auto" }}
                />
                <p style={{ fontSize: 13, lineHeight: 1.5, color: "#90ee90", margin: 0 }}>
                    <strong style={{ fontWeight: 700 }}>USP</strong> Universidade de São Paulo<br />
                    <strong style={{ fontWeight: 700 }}>ECA</strong> Escola de Comunicações e Artes<br />
                    <strong style={{ fontWeight: 700 }}>CBD</strong> Departamento de Informação e Cultura
                </p>
            </header>

            {/* ══════════ HERO – grid 2×2 rotativo + navegação flutuante ══════════ */}
            <section
                style={{
                    position: "relative",
                    background: "#000",
                    minHeight: "78dvh",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
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

                <p
                    style={{
                        position: "relative",
                        zIndex: 11,
                        color: "red",
                        fontSize: "1.15rem",
                        textAlign: "center",
                        margin: "1rem 0 0",
                    }}
                >
                    Site em construção!
                </p>

                <nav
                    style={{
                        position: "relative",
                        zIndex: 10,
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "space-evenly",
                        gap: "1.25rem",
                        padding: "1.5rem 1rem 2rem",
                        textAlign: "center",
                    }}
                >
                    <NavTag label="SOBRE O LACIS" href="sobre" fontSize={NAV_FONT} nowrap={false} />
                    <NavTag label="PROGRAMAÇÃO" href="programacao" ready={false} fontSize={NAV_FONT} nowrap={false} />
                    <NavTag label="CURSOS DE EXTENSÃO" href="" ready={false} fontSize={NAV_FONT} nowrap={false} />
                    <NavTag label="TEXTOS" href="" ready={false} fontSize={NAV_FONT} nowrap={false} />
                    <NavTag label="PESQUISAS" href="" ready={false} fontSize={NAV_FONT} nowrap={false} />
                    <NavTag label="DIRIGENTES DE CULTURA BRASIL" href="dirigentes-de-cultura" fontSize={NAV_FONT} nowrap={false} />
                </nav>
            </section>

            {/* ══════════ EVENTO – verde escuro ══════════ */}
            <section
                style={{
                    background: "#0c3b2e",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1.5rem",
                    padding: "2.5rem 1.5rem",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
            >
                <h2
                    style={{
                        color: "#fff",
                        fontWeight: 900,
                        fontSize: "1.15rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        lineHeight: 1.2,
                        margin: 0,
                        textAlign: "center",
                    }}
                >
                    ENCONTRO DE DIRIGENTES MUNICIPAIS DE CULTURA NA USP / 25/11/2026
                </h2>

                <img
                    src="/torredorelogio.webp"
                    alt="Event photo"
                    style={{ width: "100%", maxWidth: 480, height: "auto", display: "block" }}
                />

                <a
                    href="#maisinfo"
                    onClick={(e) => { e.preventDefault(); setShowInfoModal(true); }}
                    style={{
                        color: "#fff",
                        fontWeight: 500,
                        fontSize: 20,
                        lineHeight: 1.4,
                        textDecoration: "none",
                        textAlign: "center",
                        border: "1px solid rgba(255,255,255,0.5)",
                        padding: "0.6rem 1.5rem",
                    }}
                >
                    MAIS INFORMAÇÕES
                </a>
            </section>

            {/* ══════════ RODAPÉ – verde quase preto ══════════ */}
            <footer
                style={{
                    background: "#001800",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1.25rem",
                    padding: "2.5rem 1.5rem 3rem",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                    textAlign: "center",
                }}
            >
                <img
                    src="/logo_semfundo.webp"
                    alt="LACIS logo"
                    style={{ width: "55%", maxWidth: 220, height: "auto" }}
                />
                <p style={{ fontSize: 17, color: "#90ee90", lineHeight: 1.5, margin: 0 }}>
                    <strong>LACIS</strong> Laboratório de Cultura,<br />
                    Informação e Sociedade
                </p>
                <a
                    href="mailto:lacis@usp.br"
                    style={{ fontSize: 18, color: "#ccff00", textDecoration: "none" }}
                >
                    lacis@usp.br
                </a>
            </footer>

            {showInfoModal && <MaisInfoModal onClose={() => setShowInfoModal(false)} />}
        </main>
    );
}