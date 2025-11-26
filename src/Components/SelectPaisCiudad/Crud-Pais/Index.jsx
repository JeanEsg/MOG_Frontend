import { useEffect, useState } from "react";
import styles from "./Crud-Pais.module.css";
import Header from "../../Header/Index";
import Swal from "sweetalert2";

const API_URL = "https://mog-sqj7.onrender.com/pais";

const CrudPais = () => {
    const [paises, setPaises] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    // Form nuevo
    const [nuevoNombre, setNuevoNombre] = useState("");

    // Edición
    const [editId, setEditId] = useState(null);
    const [editNombre, setEditNombre] = useState("");

    const parseResponse = async (res) => {
        const text = await res.text();
        if (!text) return {};
        try {
            return JSON.parse(text);
        } catch (err) {
            // No JSON (HTML error page?), return raw text under `_text`
            return { _text: text };
        }
    };

    const cargarPaises = async () => {
        setCargando(true);
        setError("");
        try {
            const res = await fetch(API_URL);
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(`Error ${res.status}: ${txt}`);
            }
            const json = await res.json();
            if (!Array.isArray(json)) throw new Error("Respuesta inválida del servidor");
            setPaises(json);
        } catch (err) {
            console.error("cargarPaises:", err);
            setError(String(err.message || err));
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarPaises();
    }, []);

    const crearPais = async () => {
        if (!nuevoNombre.trim()) return setError("Ingrese un nombre de país");
        setCargando(true);
        setError("");
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre: nuevoNombre })
            });

            const creado = await parseResponse(res);
            if (!res.ok) {
                const msg = creado?.error || creado?.message || creado?._text || `Error ${res.status}`;
                throw new Error(msg);
            }

            setNuevoNombre("");
            await cargarPaises();
        } catch (err) {
            console.error("crearPais:", err);
            setError(String(err.message || err));
        } finally {
            setCargando(false);
        }
    };

    const iniciarEdicion = (pais) => {
        setEditId(pais.id);
        setEditNombre(pais.nombre);
    };

    const cancelarEdicion = () => {
        setEditId(null);
        setEditNombre("");
        setError("");
    };

    const guardarEdicion = async () => {
        if (!editNombre.trim()) return setError("Ingrese un nombre de país");
        setCargando(true);
        setError("");
        try {
            const res = await fetch(`${API_URL}/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre: editNombre })
            });

            const resp = await parseResponse(res);
            if (!res.ok) {
                const msg = resp?.error || resp?.message || resp?._text || `Error ${res.status}`;
                throw new Error(msg);
            }

            setEditId(null);
            setEditNombre("");
            await cargarPaises();
        } catch (err) {
            console.error("guardarEdicion:", err);
            setError(String(err.message || err));
        } finally {
            setCargando(false);
        }
    };

    const eliminarPais = async (id) => {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            const resp = await parseResponse(res);
            if (!res.ok) {
                const msg = resp?.error || resp?.message || resp?._text || `Error ${res.status}`;
                throw new Error(msg);
            }
            await cargarPaises();
        } catch (err) {
            console.error("eliminarPais:", err);
            setError(String(err.message || err));
        } finally {
            setCargando(false);
        }
    };

    const confirmarEliminarPais = (id) => {
        Swal.fire({
            title: "¿Eliminar este país?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                eliminarPais(id);
            }
        });
    };

    return (
        <>
            <Header />
            <div className={styles.container}>
                <h3 className={styles.title}>Gestionar Países</h3>

                {error && <div className={styles.error}>{error}</div>}
                {cargando && <div className={styles.loading}>Cargando...</div>}

                <div className={styles.formGroup}>
                    <input
                        className={styles.input}
                        placeholder="Nuevo país (Ej: Colombia)"
                        value={nuevoNombre}
                        onChange={(e) => setNuevoNombre(e.target.value)}
                    />
                    <div className={styles.buttonGroup}>
                        <button className={styles.button} onClick={crearPais} disabled={cargando}>
                            Agregar
                        </button>
                    </div>
                </div>

                <div className={styles.resultContainer}>
                    <table className={styles.resultTable}>
                        <thead>
                            <tr>
                                <th className={styles.keyCell}>ID</th>
                                <th className={styles.keyCell}>Nombre</th>
                                <th className={styles.keyCell}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paises.map((p) => (
                                <tr key={p.id}>
                                    <td className={styles.valueCell}>{p.id}</td>
                                    <td className={styles.valueCell}>
                                        {editId === p.id ? (
                                            <input
                                                className={styles.input}
                                                value={editNombre}
                                                onChange={(e) => setEditNombre(e.target.value)}
                                            />
                                        ) : (
                                            p.nombre
                                        )}
                                    </td>
                                    <td className={styles.valueCell}>
                                        <div className={styles.actions}>
                                            {editId === p.id ? (
                                                <>
                                                    <button className={styles.button} onClick={guardarEdicion} disabled={cargando}>Guardar</button>
                                                    <button className={styles.secondary} onClick={cancelarEdicion}>Cancelar</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className={styles.button} onClick={() => iniciarEdicion(p)}>Editar</button>
                                                    <button className={styles.danger} onClick={() => confirmarEliminarPais(p.id)}>Eliminar</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default CrudPais;

