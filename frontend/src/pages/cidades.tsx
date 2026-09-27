import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import culturaEstados from "../assets/cultura-estados.json";

const API_URL = import.meta.env.VITE_API_BASE_URL + "/api/cidades/all";

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

// Normaliza para comparar nomes sem depender de acento/caixa
function normalizarNome(nome: string) {
    return nome
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
}

export default function Cidades() {
    const { uf } = useParams();

    const [cidades, setCidades] = useState<Cidade[]>([]);
    const [municipiosComDados, setMunicipiosComDados] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    const ufKey = uf?.toUpperCase() ?? "";
    const estado = gerarEstado(ufKey) || ESTADO_PADRAO;

    useEffect(() => {
        async function buscarCidades() {
            try {
                setLoading(true);

                const [resIbge, resDados] = await Promise.all([
                    fetch(
                        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufKey}/municipios`
                    ),
                    buscarMunicipiosComDados(ufKey),
                ]);

                const data = await resIbge.json();
                setCidades(
                    data.sort((a: Cidade, b: Cidade) => a.nome.localeCompare(b.nome, "pt-BR"))
                );
                setMunicipiosComDados(resDados);
            } catch (error) {
                console.error("Erro ao buscar cidades:", error);
            } finally {
                setLoading(false);
            }
        }
        buscarCidades();
    }, [ufKey]);

    async function buscarMunicipiosComDados(estado: string): Promise<Set<string>> {
        try {

            if (!estado) {
                throw new Error("Parâmetro de estado não fornecido");
            }

            const new_params = new URLSearchParams({ estado });
            const res = await fetch(`${API_URL}?${new_params.toString()}`, {
                method: "GET",
                headers: { Accept: "application/json" },
            });

            if (!res.ok) return new Set();

            const json = await res.json();
            // ajuste "nome" para o campo correto retornado pela sua API
            const nomes: string[] = json.map((item: any) => item.cidade);
            return new Set(nomes.map(normalizarNome));
        } catch (error) {
            console.error("Erro ao buscar municípios com dados:", error);
            return new Set();
        }
    }

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
                        {cidades.map((cidade) => {
                            const temDados = municipiosComDados.has(normalizarNome(cidade.nome));

                            if (!temDados) {
                                return (
                                    <div
                                        key={cidade.id}
                                        title="Sem informações cadastradas"
                                        style={{
                                            color: "#8A8AA0",
                                            fontSize: 22,
                                            padding: "3px 0",
                                            breakInside: "avoid",
                                            cursor: "not-allowed",
                                        }}
                                    >
                                        {cidade.nome}
                                    </div>
                                );
                            }

                            return (
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
                            );
                        })}
                    </div>
                )}
                <div
                    style={{
                        marginTop: 48,
                        paddingTop: 20,
                        borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                        color: "#C8C8D8",
                        fontSize: 15,
                        lineHeight: 1.6,
                    }}
                >
                    <p style={{ margin: "0 0 8px" }}>
                        <strong>Aviso:</strong> A coleta e atualização dos dados dos
                        municípios ainda está em andamento. Por isso, algumas
                        informações podem não estar disponíveis no momento.
                    </p>

                    <p style={{ margin: 0 }}>
                        Se você acredita que determinado município deveria estar
                        presente ou possui informações que possam contribuir para
                        este levantamento, entre em contato pelo e-mail{" "}
                        <a
                            href="mailto:lacis@usp.br"
                            style={{
                                color: "#FFD23F",
                                fontWeight: 700,
                                textDecoration: "underline",
                            }}
                        >
                            lacis@usp.br
                        </a>
                        .
                    </p>
                </div>
            </main>
        </div >
    );
}