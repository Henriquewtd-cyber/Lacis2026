import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";
import { tokenValido } from "../../auth";

export default function AdminHome() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!tokenValido()) {
            navigate("/login");
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 py-10">
                <h1 className="text-xl font-semibold text-slate-900">Painel administrativo</h1>
                <p className="text-slate-600 mt-2 text-sm">
                    Use o menu acima para importar dados ou adicionar registros manualmente.
                </p>
            </main>
        </div>
    );
}