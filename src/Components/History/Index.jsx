import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "./History.module.css";
import Header from "../Header/Index";
import { showCustomAlert } from "../../utils/customAlert";

const History = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [showDownload, setShowDownload] = useState(false);

    useEffect(() => {
        const fetchAnswers = async () => {
            try {
                const storedData = localStorage.getItem("respuestas");

                if (!storedData) {
                    await showCustomAlert({
                        title: "No hay respuestas",
                        text: "No hay respuestas guardadas en localStorage.",
                        icon: "error",
                        confirmButtonText: "Aceptar"
                    });
                    return;
                }

                const data = JSON.parse(storedData);

                if (!Array.isArray(data) || data.length === 0) {
                    await showCustomAlert({
                        title: "No hay respuestas",
                        text: "No hay respuestas que mostrar en localStorage.",
                        icon: "error",
                        confirmButtonText: "Aceptar"
                    });
                    return;
                }

                setHistory(data);
            } catch (error) {
                console.error("Error al cargar respuestas desde localStorage:", error);
                await showCustomAlert({
                    title: "Error al cargar",
                    text: "No se pudo cargar la colección de respuestas.",
                    icon: "error",
                    confirmButtonText: "Aceptar"
                });
            }
        };

        fetchAnswers();
    }, []);


    const handleFormClick = (formIndex, realizacionIndex, encuestadoIndex) => {
        navigate(`/form-history/${formIndex}/${realizacionIndex}/${encuestadoIndex}`);
    };


    const handleUpload = async () => {
        try {
            const storedData = localStorage.getItem("respuestas");

            if (!storedData || !storedData.trim()) {
                await showCustomAlert({
                    title: "No hay datos",
                    text: "No hay datos válidos guardados en localStorage.",
                    icon: "error",
                    confirmButtonText: "Aceptar"
                });
                return;
            }

            const data = JSON.parse(storedData);

            if (!Array.isArray(data) || data.length === 0) {
                await showCustomAlert({
                    title: "No hay datos",
                    text: "La colección de respuestas no tiene formularios válidos.",
                    icon: "error",
                    confirmButtonText: "Aceptar"
                });
                return;
            }

            const backendOrigin = 'https://mog-sqj7.onrender.com'; // ajusta si tu backend corre en otro puerto
            const uploadResponse = await fetch(`${backendOrigin}/migrate_and_export_individual`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await uploadResponse.json();

            if (!uploadResponse.ok) {
                await showCustomAlert({
                    title: "Error",
                    text: `❌ Error: ${result.error || 'Error en el servidor'}`,
                    icon: "error",
                    confirmButtonText: "Aceptar"
                });
                return;
            }

            const files = result.files || []; // [{ nombre, file, url }, ...]
            if (files.length === 0) {
                await showCustomAlert({
                    title: "Listo",
                    text: `✅ ${result.message || 'Migración completada'} (0 archivos generados)`,
                    icon: "success",
                    confirmButtonText: "Aceptar"
                });
                localStorage.removeItem("respuestas");
                return;
            }

            // Construir URLs absolutas
            const filesWithUrl = files.map(f => ({
                nombre: f.nombre,
                file: f.file,
                url: f.url.startsWith('http') ? f.url : (backendOrigin + f.url)
            }));

            // Preguntar al usuario si quiere descargar los archivos ahora
            await showCustomAlert({
                title: "Datos migrados",
                text: `✅ Migradas: ${filesWithUrl.length} encuestas. ¿Deseas descargar los archivos ahora?`,
                icon: "success",
                confirmButtonText: "Descargar todos",
                showCancelButton: true,
                cancelButtonText: "Cerrar",
                preConfirm: async () => {
                    // Descargar secuencialmente cada archivo
                    for (const f of filesWithUrl) {
                        try {
                            const resp = await fetch(f.url);
                            if (!resp.ok) throw new Error(`Respuesta no OK: ${resp.status}`);
                            const blob = await resp.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;

                            // intentar obtener filename desde content-disposition, si existe
                            const disposition = resp.headers.get('content-disposition');
                            let filename = f.file || `${f.nombre || 'survey'}.xlsx`;
                            if (disposition && disposition.indexOf('filename=') !== -1) {
                                filename = disposition.split('filename=')[1].split(';')[0].replace(/\"/g, '').trim();
                            } else {
                                // fallback: usar el query param 'file' o el nombre devuelto por el backend
                                try {
                                    const urlObj = new URL(f.url);
                                    const qp = urlObj.searchParams.get('file');
                                    filename = qp || filename;
                                } catch (e) { /* ignore */ }
                            }

                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);
                            // pequeña pausa opcional para evitar sobrecarga
                            await new Promise(r => setTimeout(r, 300));
                        } catch (downloadErr) {
                            console.error('Error descargando', f, downloadErr);
                            await showCustomAlert({
                                title: "Error en descarga",
                                text: `No se pudo descargar ${f.file || f.nombre}. Comprueba el backend y CORS.`,
                                icon: "error",
                                confirmButtonText: "Aceptar"
                            });
                        }
                    }
                }
            });

            // Limpiar localStorage (ya migrado)
            localStorage.removeItem("respuestas");

        } catch (error) {
            console.error('Error al cargar o enviar los datos:', error);
            await showCustomAlert({
                title: "Error",
                text: "❌ Error al conectar con el servidor o al leer los datos del localStorage.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        }
    };

    const totalRealizaciones = history.reduce((acc, form) => {
        return acc + (form.Realizaciones?.reduce((sum, realizacion) => {
            return sum + (realizacion.encuestados?.length || 0);
        }, 0) || 0);
    }, 0);

    return (
        <>
            <Header />
            <div className={styles.tittleAndCounter}>
                <h1 className={styles.mainTitle}>Formularios</h1>
                <h2 className={styles.counter}>Total de realizaciones: {totalRealizaciones}</h2>
            </div>
            <div className={styles.container}>
                {history.length === 0 ? (
                    <p className={styles.emptyMessage}>No hay formularios llenados aún.</p>
                ) : (
                    <ul className={styles.formList}>
                        {history.map((form, formIndex) =>
                            form.Realizaciones?.map((realizacion, realizacionIndex) =>
                                realizacion.encuestados?.map((encuestado, encuestadoIndex) => (
                                    <li key={`${formIndex}-${realizacionIndex}-${encuestadoIndex}`} className={styles.formItem}>
                                        <div>
                                            <h3>{form.nombre}</h3>
                                            <p><strong>Fecha:</strong> {new Date(encuestado.fechaRealizacion).toLocaleString()}</p>
                                            <p><strong>Colaborador:</strong> {realizacion?.nombre_encargado || "No disponible"}</p>
                                            <p><strong>Comedor:</strong> {realizacion?.nombre_comedor || realizacion?.id_comedor || "No disponible"}</p>
                                        </div>
                                        <button
                                            className={styles.viewButton}
                                            onClick={() => handleFormClick(formIndex, realizacionIndex, encuestadoIndex)}
                                        >
                                            Ver detalles
                                        </button>
                                    </li>
                                ))
                            )
                        )}
                    </ul>
                )}
            </div>
            <div className={styles.uploadContainer}>
                <button className={styles.historyButton} onClick={handleUpload}>
                    Subir Formularios
                </button>
            </div>
        </>
    );
};

export default History;
