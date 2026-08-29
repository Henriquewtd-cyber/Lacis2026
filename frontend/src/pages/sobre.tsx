import { useEffect, useRef, useState } from "react";

const members = [
    { name: "Eugênio Bussi", role: "Professor Titular USP/ECA", photo: "/responsaveis/EugenioBussi.webp" },
    { name: "Francisco Paletta", role: "Professor Titular USP/ECA/CBD", photo: "/responsaveis/Prof.Paletta.webp" },
    { name: "Leonardo de Assis", role: "Pesquisador e Colaborador", photo: "/responsaveis/LeonardodeAssis.webp" },
    { name: "Luiz Augusto Milanesi", role: "Professor Sênior USP/ECA/CBD", photo: "/responsaveis/LuizMilanesi.webp" },
];


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
            const containerWidth = container.clientWidth - 48;
            const viewport = page.getViewport({ scale: 1 });
            const zoom = 1.15;
            const scale = (containerWidth / viewport.width) * zoom;
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
        <div className="flex h-full flex-col overflow-hidden bg-[#0a1622]">
            {/* Toolbar interna (não é uma topbar da página, pertence só ao visualizador) */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-[#1f3a4d] bg-[#0a1622] px-8 py-5">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold uppercase tracking-wider text-white">
                        Regimento LACIS
                    </span>
                    {totalPages > 0 && (
                        <span className="rounded-full border border-[#2a4a63] bg-[#16293b] px-3 py-1 text-xs font-semibold text-[#a9c2d1]">
                            {totalPages} {totalPages === 1 ? "página" : "páginas"}
                        </span>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                            disabled={pageNum <= 1}
                            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#2a4a63] bg-[#16293b] text-white transition-opacity disabled:opacity-40"
                        >
                            ←
                        </button>
                        <span className="min-w-[52px] text-center text-sm font-bold text-white">
                            {pageNum} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPageNum((p) => Math.min(totalPages, p + 1))}
                            disabled={pageNum >= totalPages}
                            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#2a4a63] bg-[#16293b] text-white transition-opacity disabled:opacity-40"
                        >
                            →
                        </button>
                    </div>
                )}
            </div>

            {/* Área do PDF — fundo azul claro, própria rolagem */}
            <div
                ref={containerRef}
                className="lacis-scroll-blue flex flex-1 min-h-0 items-start justify-center overflow-auto bg-[#dbe9f5] p-8"
            >
                {loading ? (
                    <div className="flex h-full w-full items-center justify-center">
                        <span className="text-sm font-medium text-[#3a5876]">Carregando documento...</span>
                    </div>
                ) : (
                    <canvas
                        ref={canvasRef}
                        className="block bg-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3),0_8px_10px_-6px_rgba(0,0,0,0.2)]"
                    />
                )}
            </div>
        </div>
    );
}

export default function Sobre() {
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

                .lacis-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
                .lacis-scroll::-webkit-scrollbar-track { background: transparent; }
                .lacis-scroll::-webkit-scrollbar-thumb { background: #2a5c41; border-radius: 3px; }
                .lacis-scroll::-webkit-scrollbar-thumb:hover { background: #3d7a59; }
                .lacis-scroll-blue::-webkit-scrollbar { width: 6px; height: 6px; }
                .lacis-scroll-blue::-webkit-scrollbar-track { background: transparent; }
                .lacis-scroll-blue::-webkit-scrollbar-thumb { background: #2a4a63; border-radius: 3px; }
                .lacis-scroll-blue::-webkit-scrollbar-thumb:hover { background: #3c637f; }
            `}</style>

            {/* 3 colunas grudadas, sem topbar, ocupando a tela inteira de cima a baixo */}
            <div className="flex h-screen w-screen overflow-hidden [font-family:'Inter',sans-serif] text-[#eef5ee]">

                {/* COLUNA ESQUERDA — Histórico (verde) */}
                <aside className="lacis-scroll flex h-full w-[32%] min-w-[360px] flex-shrink-0 flex-col overflow-y-auto bg-[#001800] pb-10 pl-10 pt-16">
                    <div className="mb-6 w-fit rounded bg-black px-4 py-2 text-sm font-extrabold uppercase tracking-widest text-white">
                        Histórico
                    </div>
                    <p className="m-0 text-[17px] leading-[1.8] text-[#deebe4] pr-10">
                        Nos fins de 2010 foi discutida na USP/Escola de Comunicação e Artes a
                        necessidade de reunir pessoas em torno de um campo temático senão inédito, pelo
                        menos pouco explorado, o corte intersecional entre Cultura e Informação. Essas duas
                        áreas já estão consolidadas por especialistas do mundo todo e por bibliografia ampla
                        como campos autônomos. Os especialistas atuais se identificam com um ou outro desses
                        campos temáticos, e poucos trabalham na conexão entre eles, ainda que ambos tenham
                        proximidade e, às vezes, se integram como no caso da progressiva integração de
                        biblioteca e centro de cultura. Os estudos de "ação cultural", enquanto atividade de
                        bibliotecas públicas, traz contribuições tanto da Cultura quanto da Informação,
                        tornando-se a expressão mais clara do inter-relacionamento de ambas. Dessa síntese
                        resulta a ideia a ser escrita da biblioteca pós-Gutenberg, uma pesquisa de interesse
                        social de amplas proporções e relevância no ambiente dominado pelas redes sociais.
                        Além da interdisciplinariedade que as instituições contemporâneas de pesquisa
                        valorizam, ela se expande para o meio social como práticas conectadas a bibliotecas,
                        museus e outras entidades afins.
                        Desde o seu início, o LACIS teve a preocupação de localizar pesquisadores que,
                        de alguma forma, explícita ou implicitamente, tenham afinidades por esse campo
                        temático que se forma. Com isso procurou-se reuni-los, visando a troca de informações,
                        debates de ideias, bem como gerar novos aportes de conteúdo, visando alcançar a
                        densidade necessária para consolidá-lo como área de estudos prioritária para todos que
                        atuam entre cultura/conhecimento/informação. Esse objetivo, não por coincidência,
                        remeteu ao Departamento de Informação e Cultura da ECA, onde a ideia inicial foi
                        gerada e se formalizou como graduação e pós-graduação.
                        Grupos de pesquisa na USP, como o LACIS, são conjuntos de indivíduos
                        (pesquisadores, docentes, estudantes e técnicos) organizados para investigar temas
                        específicos de forma colaborativa. Esses grupos, registrados no Diretório do CNPq,
                        desenvolvem pesquisas temáticas em linhas comuns, que podem ser interdisciplinares
                        ou não, e que resultam em produção científica e tecnológica. Reúnem integrantes
                        organizados para desenvolver projetos por prazo determinado. Esses projetos podem ser
                        propostos por docentes da USP, de outras instituições.
                        O LACIS, além das pesquisas, busca criar atividades culturais de larga
                        amplitude, trazendo para o Laboratório as ações culturais que abrangem todas as
                        linguagens artísticas, particularmente aquelas associadas à ideia da liberdade de
                        informação e transformação social. Também busca oferecer como extensão cursos que
                        possam contribuir para aprimorar o desempenho de dirigentes e promotores de cultura
                        em seus territórios. Nesse sentido, o LACIS busca, a médio prazo, instituir um conjunto
                        multifacetado que será a base para a formação de especialistas em gestão cultural.
                    </p>



                    <div className="mt-8 flex items-center gap-3 border-t border-[#163828] pr-10 pt-5">
                        <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#e8b84b]" />
                        <div>
                            <div className="text-base font-bold text-white">USP-ECA</div>
                            <div className="text-sm text-[#9fb8a8]">Escola de Comunicações e Artes</div>
                        </div>
                    </div>
                </aside>

                {/* COLUNA CENTRAL — Visualizador de PDF (azul) */}
                <section className="h-full flex-1 min-w-0">
                    <PdfViewer />
                </section>

                {/* COLUNA DIREITA — Equipe (verde) */}
                <aside className="flex h-screen w-[30%] min-w-[340px] flex-shrink-0 flex-col bg-[#0c3b2e] pb-12 pl-10 pt-16">
                    <div className="mb-8 w-fit flex-shrink-0 rounded bg-black px-4 py-2 text-sm font-extrabold uppercase tracking-widest text-white">
                        Coordenação
                    </div>
                    <div className="flex max-h-[100%] flex-col pr-10">
                        {members.map((m) => (
                            <div
                                key={m.name}
                                className="flex items-center gap-2 border-b border-[#163828] py-5 last:border-b-0"
                            >
                                <img
                                    src={m.photo}
                                    alt={m.name}
                                    className="h-24 w-24 flex-shrink-0 border border-[#2a5c41] bg-[#163828] object-cover"
                                />
                                <div>
                                    <div className="text-xl font-bold text-white">{m.name}</div>
                                    <div className="mt-1.5 text-base font-medium text-[#9fb8a8]">{m.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

            </div>
        </>
    );
}