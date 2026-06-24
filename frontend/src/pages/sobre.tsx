import { useEffect, useRef, useState } from "react";

const members = [
    { name: "Incitus de Almeida", role: "Coordenador", initials: "IA" },
    { name: "Black Boreal", role: "Vice-coordenador", initials: "BB" },
    { name: "Anita Sóror", role: "Secretária Geral", initials: "AS" },
    { name: "Madelaine Proust", role: "Membro", initials: "MP" },
    { name: "Electra Freud", role: "Membro", initials: "EF" },
    { name: "Édipo Reis", role: "Membro", initials: "ÉR" },
];

const areas = ["Políticas culturais", "Biblioteconomia", "Informação e sociedade", "Mediação cultural"];

function PdfViewer({ src = "/Regimento.pdf" }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [pdf, setPdf] = useState<any>(null);
    const [pageNum, setPageNum] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const renderTaskRef = useRef<any>(null);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => {
            (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            (window as any).pdfjsLib.getDocument(src).promise.then((pdfDoc: any) => {
                setPdf(pdfDoc);
                setTotalPages(pdfDoc.numPages);
                setLoading(false);
            }).catch(() => setLoading(false));
        };
        document.head.appendChild(script);
        return () => { document.head.removeChild(script); };
    }, [src]);

    useEffect(() => {
        if (!pdf || !canvasRef.current) return;
        renderPage(pdf, pageNum);
    }, [pdf, pageNum]);

    function renderPage(pdfDoc: any, num: number) {
        pdfDoc.getPage(num).then((page: any) => {
            const container = containerRef.current as unknown as HTMLDivElement;
            if (!container) return;
            const containerWidth = container.clientWidth - 40;
            const viewport = page.getViewport({ scale: 1 });
            const scale = containerWidth / viewport.width;
            const scaled = page.getViewport({ scale });
            const canvas = canvasRef.current as unknown as HTMLCanvasElement;
            const ctx = canvas.getContext("2d");
            canvas.height = scaled.height;
            canvas.width = scaled.width;
            if (renderTaskRef.current) renderTaskRef.current.cancel();
            renderTaskRef.current = page.render({ canvasContext: ctx, viewport: scaled });
            renderTaskRef.current.promise.catch(() => { });
        });
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0f2b1e", borderRadius: "10px", overflow: "hidden", border: "1px solid #1c4632" }}>
            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "#0a1f15", borderBottom: "1px solid #1c4632", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>
                        Regimento LACIS
                    </span>
                    {totalPages > 0 && (
                        <span style={{ fontSize: 12, color: "#cfe8da", background: "#163828", padding: "2px 8px", borderRadius: "20px", border: "1px solid #2a5c41" }}>
                            {totalPages} {totalPages === 1 ? "página" : "páginas"}
                        </span>
                    )}
                </div>

                {totalPages > 1 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                            onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                            disabled={pageNum <= 1}
                            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #2a5c41", borderRadius: "6px", background: "#163828", color: "#eef5ee", cursor: "pointer", transition: "all 0.2s", opacity: pageNum <= 1 ? 0.4 : 1 }}
                        >
                            ←
                        </button>
                        <span style={{ fontSize: 13, color: "#ffffff", fontWeight: 600, minWidth: 45, textAlign: "center" }}>
                            {pageNum} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPageNum((p) => Math.min(totalPages, p + 1))}
                            disabled={pageNum >= totalPages}
                            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #2a5c41", borderRadius: "6px", background: "#163828", color: "#eef5ee", cursor: "pointer", transition: "all 0.2s", opacity: pageNum >= totalPages ? 0.4 : 1 }}
                        >
                            →
                        </button>
                    </div>
                )}
            </div>

            {/* Canvas area — fundo claro propositalmente, para o documento ficar legível */}
            <div ref={containerRef} style={{ flex: 1, minHeight: 0, overflowY: "auto", background: "#e7eee9", padding: 24, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
                {loading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                        <span style={{ fontSize: 14, color: "#475569" }}>Carregando documento...</span>
                    </div>
                ) : (
                    <canvas ref={canvasRef} style={{ boxShadow: "0 10px 25px -5px rgba(0,0,0,0.25), 0 8px 10px -6px rgba(0,0,0,0.15)", display: "block", maxWidth: "100%", background: "white", borderRadius: "4px" }} />
                )}
            </div>
        </div>
    );
}

export default function Sobre() {
    return (
        <>
            {/* Google Fonts: Inter para corpo/labels, Playfair Display só na citação histórica */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,500;1,400&display=swap');

                body {
                    margin: 0;
                    background-color: #07150f;
                }
                .lacis-card {
                    background: #0f2b1e;
                    border-radius: 10px;
                    padding: 1.75rem;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid #1c4632;
                }
                .lacis-label {
                    display: inline-flex;
                    align-items: center;
                    font-family: 'Inter', sans-serif;
                    font-size: 12px;
                    font-weight: 800;
                    color: #ffffff;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 1.25rem;
                    background: #060f0a;
                    padding: 6px 12px;
                    border-radius: 4px;
                    width: fit-content;
                }
                .lacis-area-tag {
                    display: inline-block;
                    padding: 6px 12px;
                    background: #163828;
                    border-radius: 6px;
                    font-size: 12px;
                    color: #cfe8da;
                    font-weight: 500;
                    margin-bottom: 8px;
                    border: 1px solid #1c4632;
                }
                .lacis-member-row {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 12px 0;
                    border-bottom: 1px solid #163828;
                }
                .lacis-member-row:last-child {
                    border-bottom: none;
                }
                .lacis-avatar {
                    width: 36px; height: 36px;
                    border-radius: 50%;
                    background: #163828;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Inter', sans-serif;
                    font-size: 12px;
                    font-weight: 700;
                    color: #e8b84b;
                    flex-shrink: 0;
                    border: 1px solid #2a5c41;
                }
                /* Custom scrollbar para o visualizador ficar limpo */
                ::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: #2a5c41;
                    border-radius: 3px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #3d7a59;
                }
            `}</style>

            <div style={{ fontFamily: "'Inter', sans-serif", background: "#07150f", height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", color: "#eef5ee" }}>

                {/* Header Institucional */}
                <header style={{ background: "#0a1f15", borderBottom: "1px solid #1c4632", padding: "0 2rem", flexShrink: 0 }}>
                    <div style={{ maxWidth: 1300, margin: "0 auto", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: 22, color: "#ffffff", letterSpacing: "-0.5px" }}>LACIS</div>
                            <div style={{ fontSize: 11, color: "#9fb8a8", marginTop: 2, fontWeight: 500 }}>
                                Laboratório de Cultura, Informação e Sociedade <span style={{ color: "#2a5c41", margin: "0 4px" }}>•</span> ECA-USP
                            </div>
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#cfe8da", background: "#163828", padding: "6px 12px", borderRadius: "6px", border: "1px solid #2a5c41" }}>
                            Fundado em 2017
                        </div>
                    </div>
                </header>

                {/* Grid Assimétrico Estilo Editorial */}
                <main style={{ maxWidth: 1300, width: "100%", margin: "0 auto", padding: "2rem", display: "grid", gridTemplateColumns: "300px 1fr 280px", gap: "2rem", flex: 1, minHeight: 0, boxSizing: "border-box" }}>

                    {/* COLUNA ESQUERDA — Histórico */}
                    <aside className="lacis-card">
                        <div className="lacis-label">Histórico</div>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, lineHeight: 1.7, color: "#cfe8da", margin: 0, fontStyle: "italic" }}>
                            O Laboratório de Cultura, Informação e Sociedade foi fundado com o objetivo de reunir especialistas para estudar
                            e desenvolver pesquisas sobre as relações entre cultura, informação,
                            bibliotecas e centros culturais, bem como organizar seminários e oferecer
                            cursos sobre políticas culturais.
                        </p>

                        <div style={{ marginTop: "2rem" }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: "#9fb8a8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>
                                Áreas Temáticas
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                {areas.map((t) => (
                                    <div key={t} className="lacis-area-tag">
                                        {t}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: "auto", paddingTop: "1.25rem", borderTop: "1px solid #163828", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e8b84b" }} />
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>ECA-USP</div>
                                <div style={{ fontSize: 11, color: "#9fb8a8" }}>Escola de Comunicações e Artes</div>
                            </div>
                        </div>
                    </aside>

                    {/* COLUNA CENTRAL — O Visualizador de PDF */}
                    <section style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
                        <PdfViewer />
                    </section>

                    {/* COLUNA DIREITA — Equipe */}
                    <aside className="lacis-card" style={{ minHeight: 0 }}>
                        <div className="lacis-label" style={{ flexShrink: 0 }}>Coordenação</div>
                        <div style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto", minHeight: 0 }}>
                            {members.map((m) => (
                                <div key={m.name} className="lacis-member-row">
                                    <div className="lacis-avatar">{m.initials}</div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff" }}>{m.name}</div>
                                        <div style={{ fontSize: 11, color: "#9fb8a8", marginTop: 2, fontWeight: 500 }}>{m.role}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>

                </main>
            </div>
        </>
    );
}