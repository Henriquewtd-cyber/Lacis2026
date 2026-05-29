




import { Link } from "react-router-dom";

const estados = [
    { nome: "Acre", uf: "AC" },
    { nome: "Alagoas", uf: "AL" },
    { nome: "Amapá", uf: "AP" },
    { nome: "Amazonas", uf: "AM" },
    { nome: "Bahia", uf: "BA" },
    { nome: "Ceará", uf: "CE" },
    { nome: "Distrito Federal", uf: "DF" },
    { nome: "Espírito Santo", uf: "ES" },
    { nome: "Goiás", uf: "GO" },
    { nome: "Maranhão", uf: "MA" },
    { nome: "Mato Grosso", uf: "MT" },
    { nome: "Mato Grosso do Sul", uf: "MS" },
    { nome: "Minas Gerais", uf: "MG" },
    { nome: "Pará", uf: "PA" },
    { nome: "Paraíba", uf: "PB" },
    { nome: "Paraná", uf: "PR" },
    { nome: "Pernambuco", uf: "PE" },
    { nome: "Piauí", uf: "PI" },
    { nome: "Rio Grande do Norte", uf: "RN" },
    { nome: "Rio Grande do Sul", uf: "RS" },
    { nome: "Rio de Janeiro", uf: "RJ" },
    { nome: "Rondônia", uf: "RO" },
    { nome: "Roraima", uf: "RR" },
    { nome: "Santa Catarina", uf: "SC" },
    { nome: "São Paulo", uf: "SP" },
    { nome: "Sergipe", uf: "SE" },
    { nome: "Tocantins", uf: "TO" },
];

export default function Estados() {
    return (
        <div className="min-h-screen bg-teal-300 flex items-center justify-center p-10 flex-col gap-10">
            <h1 className="text-4xl font-bold mb-8 text-center">Selecione um Estado</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-32 gap-y-2">
                {estados.map((estado) => (
                    <Link
                        key={estado.uf}
                        to={`/dirigentes-de-cultura/${estado.uf}`}
                        className="text-blue-700 font-bold text-2xl hover:underline"
                    >
                        {estado.nome} ({estado.uf})
                    </Link>
                ))}
            </div>
        </div>
    );
}