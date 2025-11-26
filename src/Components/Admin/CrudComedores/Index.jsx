import { useState } from "react";
import {
    crearComedor,
    listarComedores,
    listarComedoresPorIds,
    listarComedoresPorNombres
} from "../Services";
import Header from "../../Header/Index";
import SeleccionarPais from "../../SelectPaisCiudad/Index";
import styles from "./CrudComedores.module.css";
import { useNavigate } from "react-router-dom";

const CrudComedores = () => {
    const [nombre, setNombre] = useState("");
    const [pais, setPais] = useState("");
    const [resultado, setResultado] = useState(null);
    const navigate = useNavigate();

    const manejarCrearComedor = async () => {
        if (!nombre || !pais) {
            await Swal.fire({
                icon: "warning",
                title: "Complete los campos",
                text: "Por favor, completa todos los campos requeridos.",
                confirmButtonColor: "#1d4ed8"
            });
            return;
        }
        console.log("Creando comedor con nombre:", nombre, "y país:", pais);
        const res = await crearComedor(nombre, pais);
        setResultado(res);
    };

    const manejarListarComedores = async () => {
        const res = await listarComedores();
        setResultado(res);
    };

    const manejarListarPorIds = async () => {
        const res = await listarComedoresPorNombres(nombre);
        setResultado(res);
    };

    const renderResultado = (data) => {
        if (!data) return <p>No hay datos para mostrar.</p>;

        const datos = Array.isArray(data)
            ? data
            : data.comedor
                ? [data.comedor]
                : [data];

        const renderFila = (item) => (
            <tr key={item._id}>
                <td className={styles.valueCell}>{item._id || "N/A"}</td>
                <td className={styles.valueCell}>{item.nombre || "N/A"}</td>
                <td className={styles.valueCell}>{item.pais || "N/A"}</td>
            </tr>
        );

        return (
            <table className={styles.resultTable}>
                <thead>
                    <tr>
                        <th className={styles.keyCell}>ID</th>
                        <th className={styles.keyCell}>Nombre</th>
                        <th className={styles.keyCell}>País</th>
                    </tr>
                </thead>
                <tbody>
                    {datos.map(renderFila)}
                </tbody>
            </table>
        );
    };


    return (
        <>
            <Header />
            <div className={styles.container}>
                <h2 className={styles.title}>Gestor de Comedores</h2>

                {/* Selector modular de país y ciudad */}
                <div className={styles.formGroup}>
                    <SeleccionarPais pais={pais} setPais={setPais} />

                </div>

                {/* Buscar por IDs */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Buscar Comedores:
                    </label>
                    <input
                        className={styles.input}
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Nombre del comedor"
                    />
                </div>

                {/* Botones */}
                <div className={styles.buttonGroup}>
                    <button className={styles.button} onClick={manejarCrearComedor}>
                        Crear Comedor
                    </button>
                    <button className={styles.button} onClick={manejarListarComedores}>
                        Listar Todos
                    </button>
                    <button className={styles.button} onClick={manejarListarPorIds}>
                        Buscar por Nombre
                    </button>
                    <button
                        className={styles.button}
                        onClick={() => navigate("/crud-paises")}
                    >
                        Gestionar Países
                    </button>
                </div>

                {/* Resultado */}
                {resultado && (
                    <div className={styles.resultContainer}>
                        <h3>Resultado:</h3>
                        {renderResultado(resultado)}
                    </div>
                )}
            </div>
        </>
    );
};

export default CrudComedores;
