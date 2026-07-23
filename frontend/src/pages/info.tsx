import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";


const API_URL = import.meta.env.VITE_API_URL + "/cidades";
const API_BASE = import.meta.env.VITE_STORAGE_URL;


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
    'AC': "Acre",
    'AL': "Alagoas",
    'AP': "Amapá",
    'AM': "Amazonas",
    'BA': "Bahia",
    'CE': "Ceará",
    'DF': "Distrito Federal",
    'ES': "Espírito Santo",
    'GO': "Goiás",
    'MA': "Maranhão",
    'MT': "Mato Grosso",
    'MS': "Mato Grosso do Sul",
    'MG': "Minas Gerais",
    'PA': "Pará",
    'PB': "Paraíba",
    'PR': "Paraná",
    'PE': "Pernambuco",
    'PI': "Piauí",
    'RJ': "Rio de Janeiro",
    'RN': "Rio Grande do Norte",
    'RS': "Rio Grande do Sul",
    'RO': "Rondônia",
    'RR': "Roraima",
    'SC': "Santa Catarina",
    'SP': "São Paulo",
    'SE': "Sergipe",
    'TO': "Tocantins",
};

export default function DirigenteCulturaPage() {
    const params = useParams<{ uf: string; cidade: string }>();

    const [dirigente, setDirigente] = useState<DirigenteCultura | null>(null);
    const [num_imagens, setNumImagens] = useState<number>(0);
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

                imagensCidade: [
                    data.foto_1
                        ? `${API_BASE}/storage/${data.foto_1}`
                        : null,
                    data.foto_2
                        ? `${API_BASE}/storage/${data.foto_2}`
                        : null,
                ].filter(Boolean) as string[],
            });

            setNumImagens(
                [data.foto_1, data.foto_2].filter((foto) => foto !== null).length
            );
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
            <main className="min-h-screen w-full bg-[#7CEFC4] px-6 py-10 sm:px-12 sm:py-14">
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
            <main className="min-h-screen w-full bg-[#7CEFC4] px-6 py-10 sm:px-12 sm:py-14">
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



    return (
        <main className="min-h-screen w-full bg-[#7CEFC4] px-6 py-10 sm:px-12 sm:py-14 max-h-screen">
            <div className="mx-auto max-w-5xl">
                {/* Cabeçalho: estado/município | secretaria/cargo | link oficial */}
                <header className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:items-start sm:gap-8">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-wide text-neutral-900 sm:text-base">
                            {dirigente.estado}
                        </p>
                        <h1 className="text-3xl font-extrabold uppercase leading-tight text-neutral-950 sm:text-4xl">
                            {dirigente.cidade}
                        </h1>
                    </div>

                    <div className="text-center">
                        <h2 className="text-xl font-bold uppercase text-neutral-950 sm:text-2xl">
                            {dirigente.secretaria}
                        </h2>
                        <p className="mt-1 text-base text-neutral-900 sm:text-lg">
                            {dirigente.cargo}
                        </p>
                    </div>

                    {dirigente.url && (
                        <a
                            href={dirigente.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block break-words text-sm text-blue-800 underline underline-offset-2 hover:text-blue-900 sm:text-right sm:text-base"
                        >
                            {dirigente.url}
                        </a>
                    )}
                </header>

                <div className="mt-6 w-full grid grid-cols-3 gap-6 sm:gap-8 items-center">

                    {/* Esquerda */}
                    {num_imagens > 0 ? (
                        <section>
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md shadow-sm ring-1 ring-black/10">
                                <img
                                    src={dirigente.imagensCidade?.[0] ?? ""}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </section>
                    ) : (
                        <div />
                    )}

                    {/* Centro */}
                    <section className="flex flex-col items-center">
                        <div className="relative h-40 w-40 overflow-hidden rounded-md bg-neutral-200 ring-1 ring-black/10 sm:h-48 sm:w-48">
                            {dirigente.foto ? (
                                <img
                                    src={dirigente.foto}
                                    alt={dirigente.nome}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    Sem foto
                                </div>
                            )}
                        </div>

                        <p className="mt-5 text-2xl font-semibold">
                            {dirigente.nome}
                        </p>
                    </section>

                    {/* Direita */}
                    {num_imagens > 1 ? (
                        <section>
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md shadow-sm ring-1 ring-black/10">
                                <img
                                    src={dirigente.imagensCidade?.[1] ?? ""}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </section>
                    ) : (
                        <div />
                    )}

                </div>
            </div>

        </main >
    );
}