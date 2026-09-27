import { Link } from "react-router-dom";

const estados = [
    { nome: "Acre", uf: "AC", ativado: false },
    { nome: "Alagoas", uf: "AL", ativado: false },
    { nome: "Amapá", uf: "AP", ativado: false },
    { nome: "Amazonas", uf: "AM", ativado: false },
    { nome: "Bahia", uf: "BA", ativado: false },
    { nome: "Ceará", uf: "CE", ativado: false },
    { nome: "Distrito Federal", uf: "DF", ativado: false },
    { nome: "Espírito Santo", uf: "ES", ativado: false },
    { nome: "Goiás", uf: "GO", ativado: false },
    { nome: "Maranhão", uf: "MA", ativado: false },
    { nome: "Mato Grosso", uf: "MT", ativado: false },
    { nome: "Mato Grosso do Sul", uf: "MS", ativado: false },
    { nome: "Minas Gerais", uf: "MG", ativado: false },
    { nome: "Pará", uf: "PA", ativado: false },
    { nome: "Paraíba", uf: "PB", ativado: false },
    { nome: "Paraná", uf: "PR", ativado: false },
    { nome: "Pernambuco", uf: "PE", ativado: false },
    { nome: "Piauí", uf: "PI", ativado: false },
    { nome: "Rio Grande do Norte", uf: "RN", ativado: false },
    { nome: "Rio Grande do Sul", uf: "RS", ativado: false },
    { nome: "Rio de Janeiro", uf: "RJ", ativado: false },
    { nome: "Rondônia", uf: "RO", ativado: false },
    { nome: "Roraima", uf: "RR", ativado: false },
    { nome: "Santa Catarina", uf: "SC", ativado: false },
    { nome: "São Paulo", uf: "SP", ativado: true },
    { nome: "Sergipe", uf: "SE", ativado: false },
    { nome: "Tocantins", uf: "TO", ativado: false },
];

export default function Estados() {
    return (
        <div className="min-h-screen bg-teal-300 flex items-center justify-center p-10 flex-col gap-10">
            <h1 className="text-4xl font-bold mb-8 text-center">Selecione um Estado</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-32 gap-y-2">
                {estados.map((estado) => {
                    if (!estado.ativado) {
                        return (
                            <span
                                key={estado.uf}
                                title="Ainda não disponível"
                                className="text-gray-500 font-bold text-2xl cursor-not-allowed"
                            >
                                {estado.nome} ({estado.uf})
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={estado.uf}
                            to={`/dirigentes-de-cultura/${estado.uf}`}
                            className="text-blue-700 font-bold text-2xl hover:underline"
                        >
                            {estado.nome} ({estado.uf})
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}