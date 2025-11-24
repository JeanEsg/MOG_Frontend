import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./HistoryForms.module.css";
import Header from "../Header/Index";

const HistoryForms = () => {
    const { formIndex, realizacionIndex, encuestadoIndex } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [realizacion, setRealizacion] = useState(null);
    const [encuestado, setEncuestado] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
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

                const selectedForm = data[parseInt(formIndex)];
                if (selectedForm) {
                    setForm(selectedForm);
                    const selectedRealizacion = selectedForm.Realizaciones?.[parseInt(realizacionIndex)];
                    if (selectedRealizacion) {
                        setRealizacion(selectedRealizacion);
                        const selectedEncuestado = selectedRealizacion.encuestados?.[parseInt(encuestadoIndex)];
                        if (selectedEncuestado) {
                            setEncuestado(selectedEncuestado);
                        }
                    }
                }
            } catch (error) {
                console.error("Error al cargar datos desde localStorage:", error);
                await showCustomAlert({
                    title: "Error",
                    text: "❌ No se pudo cargar la colección de respuestas.",
                    icon: "error",
                    confirmButtonText: "Aceptar"
                });
            }
        };

        fetchData();
    }, [formIndex, realizacionIndex, encuestadoIndex]);

    if (!form || !realizacion || !encuestado) {
        return (
            <>
                <Header />
                <div className={styles.container}>
                    <p>No se encontró el formulario, la realización o el encuestado.</p>
                    <button onClick={() => navigate("/history")}>Volver</button>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className={styles.bg}>
                <div className={styles.container}>
                    <h1 className={styles.title}>Formulario: {form.nombre}</h1>
                    <div className={styles.infoBox}>
                        <p><strong>COLABORADOR:</strong> {realizacion.id_encargado}</p>
                        <p><strong>COMEDOR:</strong> {realizacion.id_comedor}</p>
                    </div>

                    <div className={styles.responseSection}>
                        <p><strong>Fecha:</strong> {new Date(encuestado.fechaRealizacion).toLocaleString()}</p>
                        <ul className={styles.responseList}>
                            <li><strong>Nombre:</strong> {encuestado.nombreCompleto}</li>
                            <li><strong>Nacionalidad:</strong> {encuestado.nacionalidad}</li>
                            <li><strong>Edad:</strong> {encuestado.edad}</li>
                            <li><strong>Ciudad:</strong> {encuestado.ciudad}</li>
                            <li><strong>Localidad:</strong> {encuestado.localidad}</li>
                            <li><strong>Estrato:</strong> {encuestado.estrato}</li>
                            {encuestado.preguntas.map((p, j) => (
                                <li key={j}>
                                    <strong>{p.pregunta}:</strong> {p.respuesta}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button className={styles.backButton} onClick={() => navigate("/history")}>
                        Volver
                    </button>
                </div>
            </div>
        </>
    );
};

export default HistoryForms;
