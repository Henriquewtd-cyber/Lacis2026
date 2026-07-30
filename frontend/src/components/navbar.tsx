import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const isLogged = !!token;

    const links = isLogged
        ? [
            { to: "/admin", label: "Início" },
            { to: "/admin/importar-arquivo", label: "Importar Dados" },
            { to: "/admin/adicionar-manualmente", label: "Adicionar Manualmente" },
        ]
        : [{ to: "/admin/login", label: "Login" }];

    async function logout() {
        try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}api/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
        } finally {
            localStorage.removeItem("token");
            navigate("/admin/login", { replace: true });
        }
    }

    return (
        <nav className="bg-slate-900 text-white shadow">
            <div className="max-w-5xl mx-auto h-14 px-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        to="/"
                        className="text-slate-300 hover:text-white transition-colors"
                        aria-label="Voltar para a página inicial"
                    >
                        <ArrowLeft size={20} />
                    </Link>

                    <span className="font-semibold text-lg">LACIS Admin</span>
                </div>

                <div className="flex items-center gap-6">
                    {links.map((link) => {
                        const active = location.pathname === link.to;

                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`text-sm border-b-2 py-1 transition-colors ${active
                                        ? "border-white text-white"
                                        : "border-transparent text-slate-300 hover:text-white"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}

                    {isLogged && (
                        <button
                            onClick={logout}
                            className="text-sm text-red-300 hover:text-red-200 transition-colors"
                        >
                            Sair
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}