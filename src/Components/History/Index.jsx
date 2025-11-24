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

            const uploadResponse = await fetch('http://localhost:5000/migrate_surveys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await uploadResponse.json();

            if (uploadResponse.ok) {
                // Construir URL absoluta de descarga si backend devuelve downloadUrl
                let fullUrl = null;
                if (result && result.downloadUrl) {
                    const backendOrigin = 'http://localhost:5000';
                    fullUrl = backendOrigin + result.downloadUrl;
                    setDownloadUrl(fullUrl);
                    setShowDownload(true);
                }
                // Mostrar alerta con opción de descargar
                await showCustomAlert({
                    title: "Datos migrados",
                    text: `✅ ${result.message}\nTotal migradas: ${result.cantidad}`,
                    icon: "success",
                    confirmButtonText: fullUrl ? "Descargar Excel" : "Aceptar",
                    showCancelButton: false,
                    preConfirm: async () => {
                        if (fullUrl) {
                            try {
                                const resp = await fetch(fullUrl);
                                if (!resp.ok) throw new Error('Respuesta no OK al descargar');
                                const blob = await resp.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                // Intentar obtener filename desde headers o usar el último segmento
                                const disposition = resp.headers.get('content-disposition');
                                let filename = '';
                                if (disposition && disposition.indexOf('filename=') !== -1) {
                                    filename = disposition.split('filename=')[1].split(';')[0].replace(/\"/g, '').trim();
                                } else {
                                    // Intentar obtener el nombre desde el query param 'file'
                                    try {
                                        const urlObj = new URL(fullUrl);
                                        const qp = urlObj.searchParams.get('file');
                                        filename = qp || fullUrl.split('/').pop().split('?')[0];
                                    } catch (e) {
                                        filename = fullUrl.split('/').pop().split('?')[0];
                                    }
                                }
                                a.download = filename;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                window.URL.revokeObjectURL(url);
                                // Mostrar alerta de confirmación que inició la descarga
                                await showCustomAlert({ title: 'Descarga iniciada', text: `El archivo ${filename} se está descargando.`, icon: 'success', confirmButtonText: 'Aceptar' });
                                navigate(`/home`);
                            } catch (downloadErr) {
                                console.error('Error en descarga:', downloadErr);
                                await showCustomAlert({ title: 'Error', text: 'No se pudo descargar el archivo. Comprueba el backend o CORS.', icon: 'error', confirmButtonText: 'Aceptar' });
                            }
                        }
                    }
                });
                // Limpiar localStorage (las respuestas ya están en BD)
                localStorage.removeItem("respuestas");

            } else {
                await showCustomAlert({
                    title: "Error",
                    text: `❌ Error: ${result.error}`,
                    icon: "error",
                    confirmButtonText: "Aceptar"
                });
            }
            // No navegamos inmediatamente: dejamos que el usuario descargue el archivo
            // navigate(`/home`);
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
                                            <p><strong>Colaborador:</strong> {realizacion?.id_encargado || "No disponible"}</p>
                                            <p><strong>Comedor:</strong> {realizacion?.id_comedor}</p>
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
