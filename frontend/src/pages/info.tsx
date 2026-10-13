import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_BASE_URL + "/api/cidades";
const API_BASE = import.meta.env.VITE_STORAGE_URL;

// Verde do modelo
const BG = "bg-[#00FF9D]";

interface DirigenteCultura {
    estado: string;
    uf: string;
    secretaria: string;
    cargo: string;
    nome: string;
    url: string;
    foto?: string;
    cidade: string;
    imagensCidade?: string[];
}

const Estados: Record<string, string> = {
    'AC': "Acre", 'AL': "Alagoas", 'AP': "Amapá", 'AM': "Amazonas",
    'BA': "Bahia", 'CE': "Ceará", 'DF': "Distrito Federal", 'ES': "Espírito Santo",
    'GO': "Goiás", 'MA': "Maranhão", 'MT': "Mato Grosso", 'MS': "Mato Grosso do Sul",
    'MG': "Minas Gerais", 'PA': "Pará", 'PB': "Paraíba", 'PR': "Paraná",
    'PE': "Pernambuco", 'PI': "Piauí", 'RJ': "Rio de Janeiro", 'RN': "Rio Grande do Norte",
    'RS': "Rio Grande do Sul", 'RO': "Rondônia", 'RR': "Roraima", 'SC': "Santa Catarina",
    'SP': "São Paulo", 'SE': "Sergipe", 'TO': "Tocantins",
};

export default function DirigenteCulturaPage() {
    const params = useParams<{ uf: string; cidade: string }>();

    const [dirigente, setDirigente] = useState<DirigenteCultura | null>(null);
    const [loading, setLoading] = useState(true);

    const getDirigente = async () => {
        try {
            setLoading(true);

            if (!params.uf || !params.cidade) {
                throw new Error("Parâmetros de UF ou cidade não fornecidos");
            }

            const new_params = new URLSearchParams({
                estado: params.uf.toUpperCase(),
                nome_cidade: params.cidade,
            });
            const res = await fetch(`${API_URL}?${new_params.toString()}`, {
                method: "GET",
                headers: { Accept: "application/json" },
            });
            if (!res.ok) throw new Error(`Cidade não encontrada (HTTP ${res.status})`);
            const data = await res.json();

            setDirigente({
                estado: Estados[data.estado] ?? data.estado,
                uf: data.estado,
                cidade: data.nome_cidade,
                secretaria: data.nome_orgao,
                cargo: data.cargo ?? "Titular",
                nome: data.nome_secretario,
                url: data.url,
                foto: data.foto_perfil
                    ? `${API_BASE}/storage/${data.foto_perfil}`
                    : undefined,
                imagensCidade: [data.foto_1, data.foto_2]
                    .filter(Boolean)
                    .map((f: string) => `${API_BASE}/storage/${f}`),
            });
        } catch (error) {
            console.error(error);
            setDirigente(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!params.uf || !params.cidade) return;
        getDirigente();
    }, [params.uf, params.cidade]);

    if (!params.uf || !params.cidade) {
        return (
            <main className={`min-h-screen w-full ${BG} px-6 py-10 sm:px-12 sm:py-14`}>
                <div className="mx-auto max-w-5xl">
                    <h1 className="text-3xl font-bold text-neutral-950 sm:text-4xl">
                        Estado ou Cidade não especificados
                    </h1>
                    <p className="mt-4 text-lg text-neutral-700">
                        Por favor, selecione um estado e uma cidade para visualizar as informações do dirigente da cultura.
                    </p>
                </div>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                Carregando...
            </main>
        );
    }

    if (!dirigente) {
        return (
            <main className={`min-h-screen w-full ${BG} px-6 py-10 sm:px-12 sm:py-14`}>
                <div className="mx-auto max-w-5xl">
                    <h1 className="text-3xl font-bold text-neutral-950 sm:text-4xl">
                        Informações não encontradas
                    </h1>
                    <p className="mt-4 text-lg text-neutral-700">
                        Não foi possível encontrar informações para o estado {params.uf} e cidade {params.cidade}. Caso você acredite que essas informações deveriam estar disponíveis, por favor, entre em contato com a equipe responsável.
                    </p>
                    <p className="mt-4 text-lg text-neutral-700">
                        Estamos trabalhando para disponibilizar as informações mais atualizadas. Agradecemos a sua compreensão.
                    </p>
                    <p className="mt-4 text-lg text-neutral-700">
                        Contato: lacis@usp.br
                    </p>
                </div>
            </main>
        );
    }

    const imagens = dirigente.imagensCidade ?? [];

    /*
     * Layout baseado no slide 1600x900 do modelo.
     * No desktop (md+) as medidas usam vw para manter as proporções do modelo;
     * no mobile os blocos empilham.
     */
    return (
        <main className={`h-screen w-full ${BG} text-neutral-950 overflow-hidden`}>
            <div className="flex h-full w-full flex-col px-6 py-6 md:flex-row md:px-[7.3vw] md:pt-[3vw] md:pb-[2.5vw]">

                {/* ===== Coluna esquerda ===== */}
                <section className="md:w-[30vw] md:shrink-0">
                    <p className="text-lg uppercase leading-none md:text-[1.5vw]">
                        {dirigente.estado}
                    </p>

                    <h1 className="mt-1 text-4xl font-extrabold uppercase leading-none md:text-[3.5vw]">
                        {dirigente.cidade}
                    </h1>

                    <h2 className="mt-3 max-w-[30vw] text-base font-bold uppercase leading-snug max-md:max-w-none md:mt-[1vw] md:text-[1.25vw]">
                        {dirigente.secretaria}
                    </h2>

                    {/* Foto do dirigente */}
                    <div className="mt-4 h-32 w-32 overflow-hidden bg-neutral-200 md:mt-[1.2vw] md:h-[11vw] md:w-[11vw]">
                        {dirigente.foto ? (
                            <img
                                src={dirigente.foto}
                                alt={dirigente.nome}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs">
                                Sem foto
                            </div>
                        )}
                    </div>

                    <p className="mt-4 text-xl font-bold leading-tight md:mt-[1.2vw] md:text-[1.55vw]">
                        {dirigente.nome}
                    </p>

                    <p className="mt-1 text-base font-bold leading-tight md:mt-[0.5vw] md:text-[1.2vw]">
                        {dirigente.cargo}
                    </p>

                    {dirigente.url && (
                        <a
                            href={dirigente.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 block break-all text-sm leading-snug underline md:mt-[1.8vw] md:text-[1.25vw]"
                        >
                            {dirigente.url}
                        </a>
                    )}
                </section>

                {/* ===== Coluna direita ===== */}
                <section className="flex flex-col md:ml-[5.6vw] md:mt-[4.5vw] md:w-[22vw]">
                    {imagens.length > 0 && (
                        <div className="flex flex-col gap-3 md:gap-[1.2vw]">
                            {imagens.slice(0, 2).map((src, i) => (
                                <img
                                    key={i}
                                    src={src}
                                    alt={`${dirigente.cidade} ${i + 1}`}
                                    className="block w-full object-cover md:aspect-[1.45/1]"
                                />
                            ))}
                        </div>
                    )}

                    {/* Nota de rodapé */}
                    <p className="mt-5 text-xs leading-snug md:mt-[3.5vw] md:ml-[0.3vw] md:text-[0.95vw]">
                        Informações enviadas pela Prefeitura Municipal. Para alterações,
                        entrar em contato com lacis@usp.br
                    </p>
                </section>
            </div>
        </main>
    );
}