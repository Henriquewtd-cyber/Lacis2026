import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import culturaEstados from "../assets/cultura-estados.json";


type Cidade = {
    id: number;
    nome: string;
};

type EstadoInfo = {
    nomeEstado: string;
    sigla: string;
    secretaria: string;
    secretario: string;
    fotoUrl: string;
    bandeiraUrl: string;
    linkOficial: string;
};

function gerarEstado(sigla: string) {
    const informacoes = culturaEstados[sigla as keyof typeof culturaEstados];

    if (!informacoes) return null;

    return {
        nomeEstado: informacoes.nomeEstado,
        sigla: informacoes.sigla,
        secretaria: informacoes.secretaria,
        secretario: informacoes.secretario,
        fotoUrl: informacoes.fotoUrl || "/estados/placeholder-foto.jpg",
        bandeiraUrl: "/bandeiras-br/" + sigla.toUpperCase() + ".webp",
        linkOficial: informacoes.linkOficial || "#",
    };
}

const ESTADO_PADRAO: EstadoInfo = {
    nomeEstado: "Estado",
    sigla: "--",
    secretaria: "SECRETARIA DA CULTURA",
    secretario: "A DEFINIR",
    fotoUrl: "/estados/placeholder-foto.jpg",
    bandeiraUrl: "/estados/placeholder-bandeira.png",
    linkOficial: "#",
};

export default function Cidades() {
    const { uf } = useParams();

    const [cidades, setCidades] = useState<Cidade[]>([]);
    const [loading, setLoading] = useState(true);

    const ufKey = uf?.toUpperCase() ?? "";
    const estado = gerarEstado(ufKey) || ESTADO_PADRAO;

    useEffect(() => {
        async function buscarCidades() {
            try {
                setLoading(true);
                const response = await fetch(
                    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufKey}/municipios`
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
    }, [ufKey]);

    return (
        <div
            style={{
                minHeight: "100vh",
                fontFamily: "'Calibri', 'Segoe UI', Arial, sans-serif",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* ── Cabeçalho institucional ── */}
            <header
                style={{
                    background: "#4F74C4",
                    padding: "28px 40px",
                    display: "flex",
                    alignItems: "center",
                    gap: 0,
                    flexWrap: "wrap",
                }}
            >
                {/* Bandeira do estado */}
                <img
                    src={estado.bandeiraUrl}
                    alt={`Bandeira de ${estado.nomeEstado}`}
                    style={{
                        width: 170,
                        height: 140,
                        objectFit: "fill",
                        flexShrink: 0,
                    }}
                />

                {/* Bloco escuro com nome do estado / secretaria / secretário */}
                <div
                    style={{
                        background: "#15155C",
                        padding: "18px 32px",
                        minHeight: 140,
                        flex: 1,
                        minWidth: 280,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: 4,
                    }}
                >
                    <h1
                        style={{
                            color: "#FFD23F",
                            fontSize: 30,
                            fontWeight: 700,
                            margin: 0,
                            lineHeight: 1.2,
                        }}
                    >
                        {estado.nomeEstado.toUpperCase()} ({estado.sigla})
                    </h1>
                    <p style={{ color: "white", fontSize: 20, margin: 0, fontWeight: 600 }}>
                        {estado.secretaria}
                    </p>
                    <p style={{ color: "white", fontSize: 17, margin: 0 }}>
                        SECRETÁRIO(A): {estado.secretario}
                    </p>
                </div>

                {/* Foto do secretário */}
                <img
                    src={estado.fotoUrl}
                    alt={`Foto do(a) secretário(a) de ${estado.nomeEstado}`}
                    style={{
                        width: 130,
                        height: 140,
                        objectFit: "cover",
                        flexShrink: 0,
                    }}
                />

                {/* Link oficial */}
                <a
                    href={estado.linkOficial}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        background: "#29ABE2",
                        color: "#15155C",
                        fontWeight: 700,
                        fontSize: 16,
                        textDecoration: "underline",
                        padding: "12px 22px",
                        marginLeft: 24,
                        flexShrink: 0,
                    }}
                >
                    {estado.linkOficial}
                </a>

            </header>

            {/* ── Lista de municípios ── */}
            <main
                style={{
                    background: "#15155C",
                    flex: 1,
                    padding: "32px 48px 64px",
                }}
            >
                <h2
                    style={{
                        color: "#FFA640",
                        fontSize: 30,
                        fontWeight: 700,
                        margin: "0 0 20px",
                    }}
                >
                    MUNICÍPIOS
                </h2>

                {loading && (
                    <p style={{ color: "white", fontSize: 14 }}>Carregando cidades...</p>
                )}

                {!loading && cidades.length === 0 && (
                    <p style={{ color: "white", fontSize: 14 }}>Nenhuma cidade encontrada.</p>
                )}

                {!loading && cidades.length > 0 && (
                    <div
                        style={{
                            columnWidth: 230,
                            columnGap: 32,
                        }}
                    >
                        {cidades.map((cidade) => (
                            <div
                                key={cidade.id}
                                style={{
                                    color: "#FFFF66",
                                    fontSize: 22,
                                    padding: "3px 0",
                                    breakInside: "avoid",
                                }}
                            >
                                <Link
                                    to={`/dirigentes-de-cultura/${uf}/${cidade.nome}`}
                                    style={{ color: "inherit", textDecoration: "none" }}
                                >
                                    {cidade.nome}
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}