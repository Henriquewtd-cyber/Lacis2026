"use client";

import { useEffect, useState } from "react";

// ══════════ Constantes ══════════
export const cellImages = [
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

export const CELL_INTERVALS = [10000, 10500, 11500, 11000];
export const FADE_MS = 1000;
export const FALLBACKS = ["#1a3a3a", "#2a3a1a", "#1a3020", "#1a2a3a"];
export const FONT_FAMILY = "Helvetica Neue, Helvetica, Arial, sans-serif";

// ══════════ Hook: useIsMobile ══════════
/**
 * Retorna:
 *  - null  → ainda não sabemos (SSR / primeiro render)
 *  - true  → viewport <= breakpoint (mobile / tablet pequeno)
 *  - false → desktop
 */
export function useIsMobile(breakpoint = 900): boolean | null {
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, [breakpoint]);

    return isMobile;
}

// ══════════ NavTag ══════════
type NavTagProps = {
    label: string;
    href: string;
    ready?: boolean;
    /** Padrão = tamanho do desktop (2rem). O mobile passa um valor menor. */
    fontSize?: string;
    /** Padrão = true (desktop). No mobile permitimos quebra de linha. */
    nowrap?: boolean;
};

export function NavTag({
    label,
    href,
    ready = true,
    fontSize = "2rem",
    nowrap = true,
}: NavTagProps) {
    if (!ready) {
        return (
            <span
                style={{
                    display: "inline-block",
                    background: "#3a3a3a",
                    color: "#888",
                    fontWeight: 400,
                    textTransform: "uppercase",
                    fontSize,
                    lineHeight: 1,
                    padding: "0.2rem 0.8rem",
                    letterSpacing: "-0.03em",
                    whiteSpace: nowrap ? "nowrap" : "normal",
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
                fontSize,
                lineHeight: 1,
                padding: "0.2rem 0.8rem",
                letterSpacing: "-0.03em",
                textDecoration: "none",
                transition: "color 0.15s ease, box-shadow 0.15s ease",
                whiteSpace: nowrap ? "nowrap" : "normal",
                fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
            }}
        >
            {label}
        </a>
    );
}

// ══════════ RotatingCell ══════════
type RotatingCellProps = {
    images: Array<{ src: string; alt: string }>;
    interval: number;
    fallback: string;
};

export function RotatingCell({ images, interval, fallback }: RotatingCellProps) {
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
                filter: "brightness(0.65) contrast(1.1) saturate(0.9)",
            }}
            aria-label={images[index].alt}
        />
    );
}

// ══════════ Modal "O QUE É" ══════════
export function OQueEModal({ onClose }: { onClose: () => void }) {
    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: "relative",
                    background: "#0c3b2e",
                    color: "#fff",
                    width: "90%",
                    maxWidth: 580,
                    maxHeight: "85vh",
                    overflowY: "auto",
                    padding: "2rem",
                    borderRadius: 8,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                }}
            >
                <button
                    onClick={onClose}
                    aria-label="Fechar"
                    style={{
                        position: "absolute",
                        top: "0.75rem",
                        right: "0.75rem",
                        background: "transparent",
                        border: "none",
                        color: "#fff",
                        fontSize: "1.5rem",
                        lineHeight: 1,
                        cursor: "pointer",
                    }}
                >
                    ×
                </button>

                <h3 style={{ margin: "0 0 1rem", fontSize: "1.25rem", fontWeight: 700 }}>
                    O QUE É
                </h3>

                <p style={{ margin: 0, fontSize: "1rem", lineHeight: 1.6 }}>
                    Anualmente, o LACIS promove um Encontro com os dirigentes municipais de Cultura, os seus interlocutores mais qualificados, com os quais concretiza os seus objetivos centrais. A cada Encontro são expostos e debatidos temas de políticas culturais relevantes para o bom desempenho das instituições e fortalecimento da cultura das cidades. O Encontro de 2026 será realizado no final de novembro (25/11/2026), quando o cenário político-administrativo estará definido, pós eleições. Informações serão enviadas às prefeituras e reproduzidas aqui.
                </p>
            </div>
        </div>
    );
}

// ══════════ Modal "MAIS INFORMAÇÕES" ══════════
export function MaisInfoModal({ onClose }: { onClose: () => void }) {
    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: "relative",
                    background: "#0c3b2e",
                    color: "#fff",
                    width: "90%",
                    maxWidth: 580,
                    maxHeight: "85vh",
                    overflowY: "auto",
                    padding: "2rem",
                    borderRadius: 8,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                }}
            >
                <button
                    onClick={onClose}
                    aria-label="Fechar"
                    style={{
                        position: "absolute",
                        top: "0.75rem",
                        right: "0.75rem",
                        background: "transparent",
                        border: "none",
                        color: "#fff",
                        fontSize: "1.5rem",
                        lineHeight: 1,
                        cursor: "pointer",
                    }}
                >
                    ×
                </button>

                <h3 style={{ margin: "0 0 1rem", fontSize: "1.25rem", fontWeight: 700 }}>
                    MAIS INFORMAÇÕES
                </h3>

                <p style={{ margin: 0, fontSize: "1rem", lineHeight: 1.6 }}>
                    Será realizado no próximo dia 25 de novembro das 9 às 17 horas o Encontro de Dirigentes Municipais de Cultura organizado pelo Laboratório de Cultura, Informação e Sociedade (LACIS) com o apoio da Pró-Reitoria de Cultura e Extensão da USP. São dois os seus objetivos: propor atividades culturais da USP como extensão aos municípios; e debater a função da cultura nas circunscrições das cidades, Estado e País. Não temos o programa pronto, mas é nosso objetivo trazer autoridades das três instâncias citadas para que possam expor suas reflexões. Os contatos já foram feitos e aguardamos as confirmações. Mas, para superar o atraso que tivemos na organização do Encontro, vamos solicitar a sua pré-inscrição para avaliar o grau de interesse pelo evento e, dessa forma, organizá-lo para obter o maior proveito. Para fazer a pré-inscrição, preencha o formulário que está{" "}
                    <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSfqrqGABHND2G1Da7Jk7Kz7ARtC4yjddilI8mhhha5vlI70Tw/viewform?usp=dialog"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#ccff00" }}
                    >
                        aqui
                    </a>
                    . Será conferido atestado de participação pela USP.
                </p>
            </div>
        </div>
    );
}