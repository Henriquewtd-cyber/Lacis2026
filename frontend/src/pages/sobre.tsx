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
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#ffffff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)", border: "1px solid #eef0f2" }}>
            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "#f8f9fa", borderBottom: "1px solid #eef0f2", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                        Regimento LACIS
                    </span>
                    {totalPages > 0 && (
                        <span style={{ fontSize: 12, color: "#64748b", background: "#e2e8f0", padding: "2px 8px", borderRadius: "20px" }}>
                            {totalPages} {totalPages === 1 ? "página" : "páginas"}
                        </span>
                    )}
                </div>

                {totalPages > 1 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                            onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                            disabled={pageNum <= 1}
                            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#ffffff", color: "#475569", cursor: "pointer", transition: "all 0.2s", opacity: pageNum <= 1 ? 0.4 : 1 }}
                        >
                            ←
                        </button>
                        <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 500, minWidth: 45, textAlign: "center" }}>
                            {pageNum} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPageNum((p) => Math.min(totalPages, p + 1))}
                            disabled={pageNum >= totalPages}
                            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#ffffff", color: "#475569", cursor: "pointer", transition: "all 0.2s", opacity: pageNum >= totalPages ? 0.4 : 1 }}
                        >
                            →
                        </button>
                    </div>
                )}
            </div>

            {/* Canvas area */}
            <div ref={containerRef} style={{ flex: 1, minHeight: 0, overflowY: "auto", background: "#f1f5f9", padding: 24, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
                {loading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                        <span style={{ fontSize: 14, color: "#64748b" }}>Carregando documento...</span>
                    </div>
                ) : (
                    <canvas ref={canvasRef} style={{ boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)", display: "block", maxWidth: "100%", background: "white", borderRadius: "4px" }} />
                )}
            </div>
        </div>
    );
}

export default function Sobre() {
    return (
        <>
            {/* Google Fonts baseadas em design editorial limpo */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;1,400&display=swap');

                body {
                    margin: 0;
                    background-color: #f8fafc;
                }
                .lacis-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 1.75rem;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04);
                    border: 1px solid #eef0f2;
                }
                .lacis-label {
                    font-family: 'Inter', sans-serif;
                    font-size: 12px;
                    font-weight: 700;
                    color: #0f172a;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .lacis-label::before {
                    content: '';
                    width: 4px;
                    height: 12px;
                    background: #0284c7;
                    border-radius: 2px;
                }
                .lacis-area-tag {
                    display: inline-block;
                    padding: 6px 12px;
                    background: #f1f5f9;
                    border-radius: 8px;
                    font-size: 12px;
                    color: #334155;
                    font-weight: 500;
                    margin-bottom: 8px;
                    border: 1px solid #e2e8f0;
                }
                .lacis-member-row {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 12px 0;
                    border-bottom: 1px solid #f1f5f9;
                }
                .lacis-member-row:last-child {
                    border-bottom: none;
                }
                .lacis-avatar {
                    width: 36px; height: 36px;
                    border-radius: 50%;
                    background: #e0f2fe;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Inter', sans-serif;
                    font-size: 12px;
                    font-weight: 600;
                    color: #0369a1;
                    flex-shrink: 0;
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
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>

            <div style={{ fontFamily: "'Inter', sans-serif", background: "#f8fafc", height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", color: "#1e293b" }}>

                {/* Header Institucional Limpo */}
                <header style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "0 2rem", flexShrink: 0 }}>
                    <div style={{ maxWidth: 1300, margin: "0 auto", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a", letterSpacing: "-0.5px" }}>LACIS</div>
                            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, fontWeight: 500 }}>
                                Laboratório de Cultura, Informação e Sociedade <span style={{ color: "#cbd5e1", margin: "0 4px" }}>•</span> ECA-USP
                            </div>
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", background: "#f1f5f9", padding: "6px 12px", borderRadius: "6px" }}>
                            Fundado em 2017
                        </div>
                    </div>
                </header>

                {/* Grid Assimétrico Estilo Editorial */}
                <main style={{ maxWidth: 1300, width: "100%", margin: "0 auto", padding: "2rem", display: "grid", gridTemplateColumns: "300px 1fr 280px", gap: "2rem", flex: 1, minHeight: 0, boxSizing: "border-box" }}>

                    {/* COLUNA ESQUERDA — Histórico */}
                    <aside className="lacis-card">
                        <div className="lacis-label">Histórico</div>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, lineHeight: 1.7, color: "#334155", margin: 0, fontStyle: "italic" }}>
                            O Laboratório de Cultura, Informação e Sociedade foi fundado com o objetivo de reunir especialistas para estudar
                            e desenvolver pesquisas sobre as relações entre cultura, informação,
                            bibliotecas e centros culturais, bem como organizar seminários e oferecer
                            cursos sobre políticas culturais.
                        </p>

                        <div style={{ marginTop: "2rem" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
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

                        <div style={{ marginTop: "auto", paddingTop: "1.25rem", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0284c7" }} />
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>ECA-USP</div>
                                <div style={{ fontSize: 11, color: "#64748b" }}>Escola de Comunicações e Artes</div>
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
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{m.name}</div>
                                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, fontWeight: 500 }}>{m.role}</div>
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