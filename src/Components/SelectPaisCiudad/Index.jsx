import { useEffect, useState } from "react";
import styles from "./SelectPaisCiudad.module.css";

const API_URL = "https://mog-sqj7.onrender.com/pais";

const SeleccionarPais = ({ pais = "", setPais }) => {
    const [paises, setPaises] = useState([]);
    const [paisSeleccionado, setPaisSeleccionado] = useState("");
    const [nuevoPais, setNuevoPais] = useState("");
    const [cargando, setCargando] = useState(false);

    // ============================
    // 1. Cargar países (GET)
    // ============================
    const cargarPaises = async () => {
        try {
            const res = await fetch(API_URL);

            if (!res.ok) {
                const text = await res.text();
                console.error("Error cargando países, respuesta del servidor:", res.status, text);
                throw new Error(`Error ${res.status} al obtener países`);
            }

            const json = await res.json();

            if (!Array.isArray(json)) throw new Error("Formato incorrecto");

            const ordenados = json.sort((a, b) => a.nombre.localeCompare(b.nombre));
            setPaises(ordenados);
        } catch (err) {
            console.error("Error al cargar países:", err);
        }
    };



    useEffect(() => {
        cargarPaises();
    }, []);

    // ============================
    // 2. Seleccionar país
    // ============================
    const handleChange = (e) => {
        const idPais = e.target.value;
        const seleccionado = paises.find(p => String(p.id) === String(idPais));

        setPaisSeleccionado(idPais);
        setPais(seleccionado?.nombre || "");
    };

    // ============================
    // 3. Crear nuevo país (POST)
    // ============================
    const agregarPais = async () => {
        if (nuevoPais.trim() === "") return alert("Ingrese un nombre de país");

        setCargando(true);

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ nombre: nuevoPais })
            });

            // Read text first to allow logging non-JSON responses (HTML error pages)
            const text = await res.text();

            let creado = {};
            try {
                creado = text ? JSON.parse(text) : {};
            } catch (parseErr) {
                console.error("Respuesta no JSON al crear país:", text);
                alert("Error del servidor: respuesta inválida (no JSON). Revisa la consola para más detalles.");
                return;
            }

            if (!res.ok) {
                const message = creado?.error || creado?.message || `Error ${res.status}`;
                alert("Error: " + message);
                return;
            }

            // Limpiar campo
            setNuevoPais("");

            // Recargar lista
            await cargarPaises();

            // Seleccionar el recién creado
            setPaisSeleccionado(creado.id);
            setPais(creado.nombre);

        } catch (err) {
            console.error("Error al agregar país:", err);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className={styles.formGroup}>

            {/* Select de países */}
            <label className={styles.label}>País:</label>
            <select
                className={styles.input}
                value={paisSeleccionado}
                onChange={handleChange}
            >
                <option value="">Selecciona un país</option>
                {paises.map(p => (
                    <option key={p.id} value={p.id}>
                        {p.nombre}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SeleccionarPais;
