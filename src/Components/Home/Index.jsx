import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../Context/userContext";
import styles from "./Home.module.css";
import Header from "../Header/Index";

const Home = () => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { formulariosSeleccionados } = useUser();

    useEffect(() => {
        const loadForms = () => {
            try {
                // Intentar leer formularios guardados en localStorage (clave 'forms')
                const raw = localStorage.getItem('forms');
                const storedForms = raw ? JSON.parse(raw) : [];

                // Si el contexto tiene formularios agrupados por comedor (estructura antigua), usarlo
                const isGrouped = Array.isArray(formulariosSeleccionados) && formulariosSeleccionados.length > 0 && formulariosSeleccionados[0].comedor;

                let formTitles = [];

                if (isGrouped) {
                    formTitles = formulariosSeleccionados.flatMap(entry =>
                        (entry.formularios || []).map(formSel => {
                            const fullForm = storedForms.find(f => f.id === formSel.id) || {};
                            const title = fullForm.name || fullForm.data?.title || fullForm.data?.name || formSel.name || 'Sin título';
                            return {
                                id: formSel.id,
                                title,
                                comedorNombre: entry.comedor?.nombre || 'Comedor desconocido',
                                comedorId: entry.comedor?.id || ''
                            };
                        })
                    );
                } else if (Array.isArray(storedForms) && storedForms.length > 0) {
                    // Si hay formularios en localStorage, mostrarlos directamente
                    formTitles = storedForms.map(f => ({
                        id: f.id,
                        title: f.name || f.data?.title || f.data?.name || 'Sin título',
                        comedorNombre: 'Comedor desconocido',
                        comedorId: ''
                    }));
                } else if (Array.isArray(formulariosSeleccionados) && formulariosSeleccionados.length > 0) {
                    // Caso: el contexto contiene una lista plana de formularios
                    formTitles = formulariosSeleccionados.map(f => ({
                        id: f.id,
                        title: f.name || f.data?.title || f.data?.name || 'Sin título',
                        comedorNombre: 'Comedor desconocido',
                        comedorId: ''
                    }));
                }

                setForms(formTitles);
            } catch (err) {
                console.error('Error cargando formularios desde localStorage:', err);
                setError('Error al cargar los formularios desde localStorage');
            } finally {
                setLoading(false);
            }
        };

        loadForms();
    }, [formulariosSeleccionados]);


    const handleFormClick = (formId, comedorNombre) => {
        navigate(`/form/${formId}`, { state: { comedorNombre } });
    };


    return (
        <>
            <Header />
            <div className={styles.home}>
                <h1 className={styles.title}>FORMULARIOS</h1>
                <div className={styles.pageContainer}>
                    <div className={styles.formContainer}>
                        {loading && <p className={styles.formMessage}>Cargando...</p>}
                        {error && <p className={styles.formError}>{error}</p>}
                        {!loading && forms.length === 0 && (
                            <p className={styles.formMessage}>No tienes formularios seleccionados.</p>
                        )}
                        <ul className={styles.formList}>
                            {forms.map((form) => (
                                <li
                                    key={`${form.id}-${form.comedorId}`}
                                    className={styles.formItem}
                                    onClick={() => handleFormClick(form.id, form.comedorNombre)}
                                >
                                    {form.title} – {form.comedorNombre}
                                </li>
                            ))}
                        </ul>

                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;
