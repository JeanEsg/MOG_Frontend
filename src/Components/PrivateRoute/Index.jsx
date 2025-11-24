import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../../Context/userContext";


const ProtectedRoute = () => {
    const { user } = useUser();

    if (!user) return <Navigate to="/login" />;

    // Ruta de administrador
    if (window.location.pathname.startsWith("/admin") && !user.isAdmin) {
        return <Navigate to="/settings" />;
    }

    // Ruta normal protegida
    return <Outlet />;
};

export default ProtectedRoute;
