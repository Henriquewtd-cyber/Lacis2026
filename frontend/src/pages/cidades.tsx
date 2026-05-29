import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

type Cidade = {
    id: number;
    nome: string;
};

const ALPHABET = "ABCDEFGHIJLMNOPQRSTUVWXYZ".split("");

export default function Cidades() {
    const { uf } = useParams();

    const [cidades, setCidades] = useState<Cidade[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeLetra, setActiveLetra] = useState("");

    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

    useEffect(() => {
        async function buscarCidades() {
            try {
                setLoading(true);
                const response = await fetch(
                    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf?.toUpperCase()}/municipios`
                );
                const data = await response.json();
                setCidades(data.sort((a: Cidade, b: Cidade) => a.nome.localeCompare(b.nome, "pt-BR")));
            } catch (error) {
                console.error("Erro ao buscar cidades:", error);
            } finally {
                setLoading(false);
            }
        }
        buscarCidades();
    }, [uf]);

    const cidadesFiltradas = useMemo(() => {
        if (!search.trim()) return cidades;
        return cidades.filter((c) =>
            c.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .includes(search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
        );
    }, [cidades, search]);

    const agrupadas = useMemo(() => {
        const grupos: Record<string, Cidade[]> = {};
        for (const cidade of cidadesFiltradas) {
            const letra = cidade.nome[0].toUpperCase();
            if (!grupos[letra]) grupos[letra] = [];
            grupos[letra].push(cidade);
        }
        return grupos;
    }, [cidadesFiltradas]);

    const letrasComCidades = useMemo(() => Object.keys(agrupadas).sort(), [agrupadas]);

    function scrollToLetra(letra: string) {
        setActiveLetra(letra);
        sectionRefs.current[letra]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#F5F0E8",
                fontFamily: "'Georgia', serif",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* ── Header ── */}
            <header
                style={{
                    background: "#1A1A2E",
                    padding: "0 32px",
                    height: 72,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "sticky",
                    top: 0,
                    zIndex: 50,
                    boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
                }}
            >
                <div>
                    <p
                        style={{
                            color: "#C9A84C",
                            fontSize: 10,
                            letterSpacing: 4,
                            fontFamily: "monospace",
                            marginBottom: 2,
                            textTransform: "uppercase",
                        }}
                    >
                        Brasil
                    </p>
                    <h1 style={{ color: "white", fontSize: 22, fontWeight: "bold", margin: 0 }}>
                        Cidades de{" "}
                        <span style={{ color: "#C9A84C" }}>{uf?.toUpperCase()}</span>
                    </h1>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    {!loading && (
                        <span style={{ color: "#8888aa", fontSize: 12, fontFamily: "monospace" }}>
                            {cidadesFiltradas.length} resultado{cidadesFiltradas.length !== 1 ? "s" : ""}
                        </span>
                    )}
                    <Link
                        to="/dirigentes-de-cultura"
                        style={{
                            background: "#C9A84C",
                            color: "#1A1A2E",
                            padding: "8px 20px",
                            borderRadius: 6,
                            fontWeight: "bold",
                            fontSize: 13,
                            textDecoration: "none",
                            fontFamily: "monospace",
                            letterSpacing: 1,
                            transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                        ← Voltar
                    </Link>
                </div>
            </header>

            {/* ── Search bar ── */}
            <div
                style={{
                    background: "#EDEAE0",
                    borderBottom: "1px solid #D4C5A0",
                    padding: "12px 32px",
                    position: "sticky",
                    top: 72,
                    zIndex: 40,
                }}
            >
                <input
                    type="text"
                    placeholder="Buscar cidade..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        width: "100%",
                        maxWidth: 480,
                        padding: "10px 16px",
                        border: "1.5px solid #C9A84C",
                        borderRadius: 6,
                        fontSize: 14,
                        background: "white",
                        fontFamily: "monospace",
                        outline: "none",
                        color: "#1A1A2E",
                        boxSizing: "border-box",
                    }}
                />
            </div>

            {/* ── Layout com índice lateral ── */}
            <div style={{ display: "flex", flex: 1 }}>
                {/* Índice Alfabético */}
                {!loading && (
                    <aside
                        style={{
                            width: 44,
                            background: "#1A1A2E",
                            position: "sticky",
                            top: 120,
                            alignSelf: "flex-start",
                            height: "calc(100vh - 120px)",
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            paddingTop: 12,
                            paddingBottom: 12,
                            gap: 2,
                            scrollbarWidth: "none",
                        }}
                    >
                        {ALPHABET.map((letra) => {
                            const hasItems = !!agrupadas[letra];
                            const isActive = activeLetra === letra;
                            return (
                                <button
                                    key={letra}
                                    onClick={() => hasItems && scrollToLetra(letra)}
                                    disabled={!hasItems}
                                    style={{
                                        width: 28,
                                        height: 22,
                                        border: "none",
                                        borderRadius: 3,
                                        background: isActive ? "#C9A84C" : "transparent",
                                        color: isActive ? "#1A1A2E" : hasItems ? "white" : "#3A3A5E",
                                        fontSize: 10,
                                        fontWeight: "bold",
                                        fontFamily: "monospace",
                                        cursor: hasItems ? "pointer" : "default",
                                        transition: "all 0.15s",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (hasItems && !isActive)
                                            (e.currentTarget as HTMLButtonElement).style.background = "#2A2A4E";
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive)
                                            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                    }}
                                >
                                    {letra}
                                </button>
                            );
                        })}
                    </aside>
                )}

                {/* Conteúdo principal */}
                <main style={{ flex: 1, padding: "24px 32px 64px" }}>
                    {loading && (
                        <div
                            style={{
                                textAlign: "center",
                                paddingTop: 80,
                                color: "#8888aa",
                                fontFamily: "monospace",
                                fontSize: 14,
                                letterSpacing: 2,
                            }}
                        >
                            Carregando cidades...
                        </div>
                    )}

                    {!loading && cidadesFiltradas.length === 0 && (
                        <div
                            style={{
                                textAlign: "center",
                                paddingTop: 80,
                                color: "#8888aa",
                                fontFamily: "monospace",
                                fontSize: 14,
                            }}
                        >
                            Nenhuma cidade encontrada para "{search}".
                        </div>
                    )}

                    {!loading &&
                        letrasComCidades.map((letra) => (
                            <section
                                key={letra}
                                ref={(el) => { sectionRefs.current[letra] = el; }}
                                style={{ marginBottom: 32 }}
                            >
                                {/* Cabeçalho da letra */}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        marginBottom: 12,
                                        position: "sticky",
                                        top: 120,
                                        zIndex: 10,
                                        background: "#E8DFC8",
                                        padding: "6px 0",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 22,
                                            fontWeight: "bold",
                                            color: "#1A1A2E",
                                            width: 28,
                                            textAlign: "center",
                                            lineHeight: 1,
                                        }}
                                    >
                                        {letra}
                                    </span>
                                    <div
                                        style={{ flex: 1, height: 1, background: "#C9A84C", opacity: 0.6 }}
                                    />
                                    <span
                                        style={{
                                            fontSize: 10,
                                            color: "#9A8A6A",
                                            fontFamily: "monospace",
                                        }}
                                    >
                                        {agrupadas[letra].length}
                                    </span>
                                </div>

                                {/* Grid de cidades */}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(auto-fill, minmax(150px, 1fr))",
                                        gap: 8,
                                    }}
                                >
                                    {agrupadas[letra].map((cidade) => (
                                        <Link
                                            key={cidade.id}
                                            to={`/dirigentes-de-cultura/${uf}/${cidade.nome}`}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                padding: "10px 8px",
                                                background: "white",
                                                border: "1.5px solid #E0D5BE",
                                                borderRadius: 6,
                                                textDecoration: "none",
                                                color: "#1A1A2E",
                                                fontSize: 12,
                                                fontFamily: "monospace",
                                                textAlign: "center",
                                                lineHeight: 1.3,
                                                transition: "all 0.15s",
                                                cursor: "pointer",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "#1A1A2E";
                                                e.currentTarget.style.color = "#C9A84C";
                                                e.currentTarget.style.borderColor = "#1A1A2E";
                                                e.currentTarget.style.transform = "translateY(-1px)";
                                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(26,26,46,0.15)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "white";
                                                e.currentTarget.style.color = "#1A1A2E";
                                                e.currentTarget.style.borderColor = "#E0D5BE";
                                                e.currentTarget.style.transform = "translateY(0)";
                                                e.currentTarget.style.boxShadow = "none";
                                            }}
                                        >
                                            {cidade.nome}
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        ))}
                </main>
            </div>
        </div>
    );
}