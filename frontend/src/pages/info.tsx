import { useParams } from "react-router-dom";

interface DirigenteCultura {
    estado: string;
    uf: string;
    secretaria: string;
    cargo: string;
    nome: string;
    urlOficial: string;
    foto?: string;
    cidade: string;
    imagensCidade?: string[];
}

// TODO: dado placeholder — trocar por fetch de API ou import de JSON
// (ex.: secretarios-cultura-completo.json) quando a fonte de dados for definida.

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
    // params.estado e params.cidade ainda não são usados enquanto os dados
    // são placeholder — serão usados para buscar o dirigente correto
    // (via API ou JSON) quando a fonte de dados estiver definida.
    const params = useParams<{ uf: string; cidade: string }>();

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

    const PLACEHOLDER: DirigenteCultura = {
        estado: Estados[params.uf],
        uf: params.uf,
        cidade: params.cidade,
        secretaria: "SECRETARIA DE TURISMO, ESPORTE E CULTURA",
        cargo: "TITULAR",
        nome: "Nome do Dirigente",
        urlOficial:
            "https://www.vilavelha.es.gov.br/secretaria/turismo-esporte-e-cultura",
        foto: "/rostoHolder.avif",
        imagensCidade: ["/cristoHolder.jpg", "/praiaHolder.jpg"],
    };

    const dirigente = PLACEHOLDER;
    const imagens = dirigente.imagensCidade?.slice(0, 2) ?? [];

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

                    {dirigente.urlOficial && (
                        <a
                            href={dirigente.urlOficial}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block break-words text-sm text-blue-800 underline underline-offset-2 hover:text-blue-900 sm:text-right sm:text-base"
                        >
                            {dirigente.urlOficial}
                        </a>
                    )}
                </header>


                <div className="mt-6 w-full grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
                    {/* Imagens do município (até duas) */}
                    {imagens.length > 0 && (
                        <section
                            className={`mt-10  "
                                }`}
                        >
                            <div
                                className="relative aspect-[4/3] w-full overflow-hidden rounded-md shadow-sm ring-1 ring-black/10"
                            >
                                <img
                                    src={imagens[0]}
                                    alt={`imagem2`}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </section>
                    )}

                    {/* Foto do titular */}
                    <section className="mt-6 flex flex-col items-center">
                        <div className="relative h-40 w-40 overflow-hidden rounded-md bg-neutral-200 ring-1 ring-black/10 sm:h-48 sm:w-48">
                            {dirigente.foto ? (
                                <img
                                    src={dirigente.foto}
                                    alt={dirigente.nome}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
                                    Sem foto
                                </div>
                            )}
                        </div>

                        <p className="mt-5 text-2xl font-semibold text-neutral-950 sm:text-3xl">
                            {dirigente.nome}
                        </p>
                    </section>

                    {/* Imagens do município (até duas) */}
                    {imagens.length > 1 && (
                        <section
                            className={`mt-10  `}
                        >
                            <div
                                className="relative aspect-[4/3] w-full overflow-hidden rounded-md shadow-sm ring-1 ring-black/10"
                            >
                                <img
                                    src={imagens[1]}
                                    alt={`imagem2`}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </section>
                    )}
                </div>
            </div>

        </main >
    );
}