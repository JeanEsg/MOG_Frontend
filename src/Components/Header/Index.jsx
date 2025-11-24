import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../Context/userContext";
import Button from "../Button/Index";
import styles from "./Header.module.css";
import Swal from "sweetalert2";

function Header() {
    const {
        user,
        setUser,
        setComedores,
        setFormulariosSeleccionados,
        formulariosPorComedor,
        setFormulariosPorComedor
    } = useUser();

    const [isAdmin, setIsAdmin] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === "/home";
    const isntHome = !isHome;
    const isComedoresCrud = location.pathname === "/crud-comedores";
    const isEncargadosCrud = location.pathname === "/crud-encargados";
    const isntComedoresCrud = !isComedoresCrud;
    const isntEncargadosCrud = !isEncargadosCrud;

    useEffect(() => {
        const adminFlag = localStorage.getItem("user");
        const user = adminFlag ? JSON.parse(adminFlag) : {};
        setIsAdmin(user.isAdmin === true);
    }, []);

    const handleBack = () => navigate(-1);
    const handleHome = () => navigate("/home");
    const handleHistory = () => navigate("/history");
    const handleSettings = () => navigate("/settings");

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: "¿Cerrar sesión?",
            html: `
            <div style="text-align: left; font-size: 15px; color: #374151;">
                <p>¿Quieres borrar también los datos guardados en este dispositivo?</p>
                <label style="
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    margin-top: 1rem;
                    padding: 0.75rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    background-color: #f9fafb;
                    color: #111827;
                    font-weight: 500;
                ">
                    <input type="checkbox" id="borrarDatos" style="transform: scale(1.2);" />
                    <span>Borrar datos locales</span>
                </label>
            </div>
        `,
            icon: "question",
            iconColor: "#1d4ed8",
            showCancelButton: true,
            confirmButtonText: "Cerrar sesión",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#1d4ed8",
            cancelButtonColor: "#6b7280",
            background: "#ffffff",
            customClass: {
                popup: 'swal2-rounded',
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom',
            },
            preConfirm: () => {
                const borrarDatos = document.getElementById("borrarDatos").checked;
                return { borrarDatos };
            }
        });

        if (result.isConfirmed) {
            if (result.value.borrarDatos) {
                localStorage.clear();
                sessionStorage.clear();
                setFormulariosPorComedor([]);
                setUser(null);
                setComedores([]);
                setFormulariosSeleccionados([]);
                await Swal.fire({
                    icon: "success",
                    title: "Sesión cerrada",
                    text: "Tus datos han sido borrados correctamente",
                    confirmButtonColor: "#1d4ed8",
                });
            }
            navigate("/login");
        }
    };

    return (
        <header className={styles.header}>
            <h1 className={styles.title}>Sopas de amor</h1>

            <nav className={styles.navbar}>
                {isHome && (
                    <>
                        <Button onClick={handleHistory}>Historial</Button>
                    </>
                )}
                {isntHome && (
                    <>
                        <Button onClick={handleHome}>Home</Button>
                    </>
                )}
                {isAdmin && <Button onClick={handleSettings}>Preferencias</Button>}
                {isAdmin && (
                    <>
                        {isntComedoresCrud && <Button onClick={() => navigate("/crud-comedores")}>Comedores</Button>}
                        {isntEncargadosCrud && <Button onClick={() => navigate("/crud-encargados")}>Encargados</Button>}
                    </>
                )}
                <Button onClick={handleLogout}>Cerrar Sesión</Button>
            </nav>
        </header>
    );
}

export default Header;

