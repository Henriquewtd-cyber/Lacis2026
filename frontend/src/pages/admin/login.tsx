import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";

interface LoginProps {
    onSubmit?: (nome: string, senha: string) => void;
}

export default function Login({ onSubmit }: LoginProps) {
    const [nome, setNome] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setErro("");
        setCarregando(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: nome, password: senha }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErro(data.message ?? "Nome ou senha incorretos.");
                return;
            }

            localStorage.setItem("token", data.token);
            onSubmit?.(nome, senha);
            navigate("/admin");
        } catch (error: any) {
            setErro(error.message || "Ocorreu um erro ao tentar fazer login.");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-sm bg-white border border-slate-200 rounded-lg p-8"
                >
                    <h1 className="text-xl font-semibold text-slate-900 mb-6">Login</h1>

                    <div className="mb-4">
                        <label htmlFor="nome" className="block text-sm text-slate-700 mb-1">
                            Nome
                        </label>
                        <input
                            id="nome"
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="senha" className="block text-sm text-slate-700 mb-1">
                            Senha
                        </label>
                        <input
                            id="senha"
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                    </div>

                    {erro && (
                        <p className="text-sm text-red-600 mb-4" role="alert">
                            {erro}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={carregando}
                        className="w-full bg-slate-900 text-white rounded-md py-2 font-medium hover:bg-slate-800 transition-colors disabled:opacity-60"
                    >
                        {carregando ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </>
    );
}