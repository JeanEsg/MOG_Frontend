import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styles from "./Form.module.css";
import Header from "../Header/Index";
import { useUser } from "../../Context/userContext";
import { guardarRespuestasEnStorage } from "../Services/Services";
import { showCustomAlert } from "../../utils/customAlert";

const Form = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, comedores } = useUser();
    const [formDetails, setFormDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [responses, setResponses] = useState({
        "Nombre completo": "",
        "Nacionalidad": "",
        "Edad": "",
        "Ciudad": "",
        "Localidad": "",
        "Estrato": ""
    });


    const [comedor, setComedor] = useState(null);

    useEffect(() => {
        const loadComedor = () => {
            try {
                const stored = localStorage.getItem("formulariosSeleccionados");
                if (!stored) return;

                const seleccionados = JSON.parse(stored);
                const comedorNombre = location.state?.comedorNombre;

                const match = seleccionados.find((entry) =>
                    entry.comedor.nombre === comedorNombre &&
                    entry.formularios.some((f) => f.id === id)
                );

                if (match) {
                    setComedor(match.comedor);
                }
            } catch (err) {
                a
            }
        };

        loadComedor();
    }, [id, location.state]);


    useEffect(() => {
        const loadFormDetails = async () => {
            try {
                const response = await fetch("../../../Backend/Formularios.json");
                if (!response.ok) throw new Error("No se pudo cargar el archivo JSON.");

                const forms = await response.json();
                const foundForm = forms.find((form) => form.id === id);

                if (!foundForm) throw new Error(`Formulario con ID ${id} no encontrado.`);

                setFormDetails(foundForm);

                const initialResponses = foundForm.fields.reduce((acc, field) => {
                    acc[field.id] = field.type === "CHECKBOX" ? [] : "";
                    return acc;
                }, {});
                setResponses(initialResponses);
            } catch (err) {
                await showCustomAlert({
                    title: "Error al cargar el formulario",
                    text: "Por favor, verifica los datos ingresados.",
                    icon: "error",
                    confirmButtonText: "Aceptar"
                });
                setError(`Error al cargar el formulario: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        loadFormDetails();
    }, [id]);

    // Mejor manejo de cambios para campos dinámicos
    const handleResponseChange = (fieldKey, value, type = "") => {
        setResponses((prev) => {
            if (type === "CHECKBOX" || type === "MULTIPLE_CHOICE") {
                // Para checkbox múltiple y MULTIPLE_CHOICE
                const currentValues = prev[fieldKey] || [];
                return {
                    ...prev,
                    [fieldKey]: currentValues.includes(value)
                        ? currentValues.filter((val) => val !== value)
                        : [...currentValues, value],
                };
            }
            return { ...prev, [fieldKey]: value };
        });
    };

    const handleSaveAnswers = async (e) => {
        if (!user || !comedor) {
            await showCustomAlert({
                title: "Error de autenticación",
                text: "Por favor, verifica tus credenciales.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
            return;
        }

        // Generar preguntas con formato adecuado
        const preguntas = formDetails.fields.map((field, idx) => {
            const fieldKey = field.id || field.placeholder || `field-${idx}`;
            let respuesta = responses[fieldKey];
            // Si es array (checkboxes, MULTIPLE_CHOICE), unir con coma y espacio
            if (Array.isArray(respuesta)) {
                respuesta = respuesta.join(", ");
            }
            return {
                pregunta: field.title || fieldKey,
                respuesta
            };
        });

        const nuevoEncuestado = {
            fechaRealizacion: new Date().toISOString(),
            nombreCompleto: responses["Nombre completo"],
            nacionalidad: responses["Nacionalidad"],
            edad: responses["Edad"],
            ciudad: responses["Ciudad"],
            localidad: responses["Localidad"],
            estrato: responses["Estrato"],
            preguntas
        };

        const nuevoFormulario = {
            nombre: formDetails.title,
            Realizaciones: [
                {
                    id_encargado: user.nombreCompleto || colaborador,
                    id_comedor: comedor._id || comedor.nombre,
                    encuestados: [nuevoEncuestado]
                }
            ],
            id_formulario: id
        };

        try {
            guardarRespuestasEnStorage(nuevoFormulario);
            await showCustomAlert({
                title: "Respuestas guardadas",
                text: "Las respuestas se han guardado correctamente.",
                icon: "success",
                confirmButtonText: "Aceptar"
            });
            navigate("/home");
        } catch (error) {
            console.error("Error al guardar localmente:", error);
            await showCustomAlert({
                title: "Error al guardar",
                text: "Hubo un problema al guardar los datos localmente.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        }
    };
    if (loading) return <div className={styles.loading}>Cargando...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <>
            <Header />
            <div className={styles.container}>
                {loading && <div className={styles.alertInfo}>Cargando...</div>}
                {error && <div className={styles.alertError}>{error}</div>}

                {!loading && formDetails && formDetails.fields && (
                    <>
                        <h1 className={styles.title}>{formDetails.title}</h1>
                        <form onSubmit={(e) => e.preventDefault()} className={styles.formWrapper}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Colaborador:</label>
                                <p>{user?.nombreCompleto || "No seleccionado"}</p>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Comedor:</label>
                                <p>
                                    {comedor
                                        ? `${comedor.nombre} (${comedor.pais})`
                                        : "No seleccionado"}


                                </p>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Nombre completo:</label>
                                <input
                                    type="text"
                                    className={styles.textInput}
                                    value={responses["Nombre completo"]}
                                    onChange={(e) => handleResponseChange("Nombre completo", e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Nacionalidad:</label>
                                <input
                                    type="text"
                                    className={styles.textInput}
                                    value={responses["Nacionalidad"]}
                                    onChange={(e) => handleResponseChange("Nacionalidad", e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Edad:</label>
                                <input
                                    type="number"
                                    className={`${styles.textInput} noSpinner`}
                                    value={responses["Edad"]}
                                    onChange={(e) => handleResponseChange("Edad", e.target.value)}
                                    onWheel={(e) => e.target.blur()}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Ciudad:</label>
                                <input
                                    type="text"
                                    className={styles.textInput}
                                    value={responses["Ciudad"]}
                                    onChange={(e) => handleResponseChange("Ciudad", e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Localidad:</label>
                                <input
                                    type="text"
                                    className={styles.textInput}
                                    value={responses["Localidad"]}
                                    onChange={(e) => handleResponseChange("Localidad", e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Estrato:</label>
                                <input
                                    type="text"
                                    className={styles.textInput}
                                    value={responses["Estrato"]}
                                    onChange={(e) => handleResponseChange("Estrato", e.target.value)}
                                />
                            </div>


                            {formDetails.fields.map((field, index) => {
                                // Usar una key única para cada campo
                                const fieldKey = field.id || field.title || `field-${index}`;
                                return (
                                    <div key={fieldKey} className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            {index + 1}. {field.title}
                                        </label>

                                        {field.type === "CHECKBOX" ? (
                                            field.choices.map((choice, idx) => (
                                                <div key={idx} className={styles.checkboxGroup}>
                                                    <input
                                                        type="checkbox"
                                                        name={`${fieldKey}-checkbox`}
                                                        value={choice}
                                                        checked={Array.isArray(responses[fieldKey]) && responses[fieldKey].includes(choice)}
                                                        className={styles.radioInput}
                                                        onChange={(e) => handleResponseChange(fieldKey, choice, "CHECKBOX")}
                                                    />
                                                    <label>{choice}</label>
                                                </div>
                                            ))
                                        ) : field.type === "GRID" ? (
                                            <table className={styles.table}>
                                                <thead>
                                                    <tr>
                                                        <th></th>
                                                        {field.columns.map((col, idx) => (
                                                            <th key={idx}>{col}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {field.rows.map((row, rowIdx) => (
                                                        <tr key={rowIdx}>
                                                            <td>{row}</td>
                                                            {field.columns.map((col, colIdx) => (
                                                                <td key={colIdx}>
                                                                    <input
                                                                        type="radio"
                                                                        name={`${fieldKey}-${rowIdx}`}
                                                                        value={col}
                                                                        checked={responses[`${fieldKey}-${row}`] === col}
                                                                        className={styles.radioInput}
                                                                        onChange={(e) =>
                                                                            handleResponseChange(`${fieldKey}-${row}`, e.target.value)
                                                                        }
                                                                    />
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : field.type === "MULTIPLE_CHOICE" ? (
                                            field.choices.map((choice, idx) => (
                                                <div key={idx} className={styles.checkboxGroup}>
                                                    <input
                                                        type="checkbox"
                                                        name={`${fieldKey}-multiple-choice`}
                                                        value={choice}
                                                        checked={Array.isArray(responses[fieldKey]) && responses[fieldKey].includes(choice)}
                                                        className={styles.radioInput}
                                                        onChange={() => handleResponseChange(fieldKey, choice, "MULTIPLE_CHOICE")}
                                                    />
                                                    <label>{choice}</label>
                                                </div>
                                            ))
                                        ) : field.type === "LIST" ? (
                                            <select
                                                className={styles.textInput}
                                                value={responses[fieldKey]}
                                                onChange={(e) => handleResponseChange(fieldKey, e.target.value)}
                                            >
                                                <option value="">Seleccione una opción</option>
                                                {field.choices.map((choice, idx) => (
                                                    <option key={idx} value={choice}>
                                                        {choice}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                value={responses[fieldKey]}
                                                className={styles.textInput}
                                                onChange={(e) => handleResponseChange(fieldKey, e.target.value)}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                            <button
                                type="button"
                                className={styles.submitButton}
                                onClick={handleSaveAnswers}
                            >
                                Enviar respuestas
                            </button>
                        </form>
                    </>
                )}
            </div>
        </>
    );
};

export default Form;
