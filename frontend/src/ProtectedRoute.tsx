import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { tokenValido } from "./auth";
import { useEffect } from "react";

export default function ProtectedRoute() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!tokenValido()) {
            navigate("/admin/login");
        }
    }, [navigate]);


    return <Outlet />;
}