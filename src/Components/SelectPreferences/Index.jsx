import { useEffect, useState, useRef } from "react";
import styles from "./SelectPreferences.module.css";
import { useUser } from "../../Context/userContext";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Index";
import { showCustomAlert } from "../../utils/customAlert";
import { Backdrop, CircularProgress } from "@mui/material";
import Swal from "sweetalert2";

const SelectPreferences = () => {
    const navigate = useNavigate();
    const {
        user,
        setUser,
        setComedores,
        setFormulariosSeleccionados,
        formulariosPorComedor,
        setFormulariosPorComedor
    } = useUser();

    const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

    const [comedoresDisponibles, setComedoresDisponibles] = useState([]);
    const [comedorIdSeleccionado, setComedorIdSeleccionado] = useState("");
    const [comedorPais, setComedorPais] = useState("");

    const comedorSeleccionadoRef = useRef("");

    const tokenClient = useRef(null);
    const accessToken = useRef(null);

    const [isAdmin, setIsAdmin] = useState("");
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const adminFlag = localStorage.getItem("user");
        const user = adminFlag ? JSON.parse(adminFlag) : {};
        setIsAdmin(user.isAdmin === true);
    }, []);

    useEffect(() => {
        const initializeGapi = async () => {
            await new Promise((resolve) => window.gapi.load("client:picker", resolve));
            await window.gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
            });
            tokenClient.current = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: "https://www.googleapis.com/auth/drive.readonly",
                callback: (tokenResponse) => {
                    if (tokenResponse.access_token) {
                        accessToken.current = tokenResponse.access_token;
                        openPicker();
                    }
                }
            });
        };
        initializeGapi();
    }, []);

    const openPicker = () => {
        if (!window.google.picker) {
            showCustomAlert({
                title: "Error",
                text: "Google Picker API no está disponible.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
            return;
        }

        const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
        view.setMimeTypes("application/vnd.google-apps.form");

        const picker = new window.google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(accessToken.current)
            .setDeveloperKey(API_KEY)
            .setCallback(pickerCallback)
            .setTitle("Selecciona formularios de Google Drive")
            .build();

        picker.setVisible(true);
    };

    const pickerCallback = (data) => {
        if (data.action === window.google.picker.Action.PICKED) {
            const comedorId = comedorSeleccionadoRef.current;

            if (!comedorId) {
                showCustomAlert({
                    title: "Error",
                    text: "No se ha seleccionado un comedor.",
                    icon: "error",
                    confirmButtonText: "Aceptar"
                });
                return;
            }

            const selected = data.docs.map((doc) => ({
                id: doc.id,
                name: doc.name,
            }));

            setFormulariosPorComedor((prev) => ({
                ...prev,
                [comedorId]: [
                    ...(prev[comedorId] || []),
                    ...selected.filter(
                        (form) =>
                            !(prev[comedorId] || []).some((f) => f.id === form.id)
                    ),
                ],
            }));
        }
    };

    const handleOpenDrivePicker = () => {
        if (tokenClient.current) {
            tokenClient.current.requestAccessToken();
        }
    };

    useEffect(() => {
        const cargarComedores = async () => {
            if (user?.comedores?.length > 0) {
                try {
                    const response = await fetch("http://localhost:5000/find_comedores_by_ids", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ids: user.comedores }),
                    });
                    const data = await response.json();
                    setComedoresDisponibles(data);
                } catch (error) {
                    console.error("Error cargando comedores:", error);
                }
            }
        };

        cargarComedores();
    }, [user]);

    useEffect(() => {
        const comedorSeleccionado = comedoresDisponibles.find(c => c._id === comedorIdSeleccionado);
        if (comedorSeleccionado) {
            setComedorPais(comedorSeleccionado.pais);
        } else {
            setComedorPais("");
        }
    }, [comedorIdSeleccionado, comedoresDisponibles]);

    const handleSave = async () => {
        if (!user?.nombreCompleto || Object.keys(formulariosPorComedor).length === 0) {
            await showCustomAlert({
                title: "Error",
                text: "Por favor completa todos los campos y selecciona al menos un formulario.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
            return;
        }

        setLoading(true);

        // Construir array de comedores y formularios en el formato esperado por `Form.jsx`
        const seleccionadosArr = Object.entries(formulariosPorComedor).map(([comedorId, formularios]) => {
            const comedor = comedoresDisponibles.find(c => c._id === comedorId);
            return {
                comedor: {
                    id: comedorId,
                    nombre: comedor?.nombre || "",
                    pais: comedor?.pais || ""
                },
                // Guardamos solo la información mínima que `Form.jsx` necesita (id y name)
                formularios: formularios.map(f => ({ id: f.id, name: f.name }))
            };
        });

        // Actualizar estado y localStorage con la estructura esperada
        setFormulariosSeleccionados(seleccionadosArr);
        try {
            localStorage.setItem('formulariosSeleccionados', JSON.stringify(seleccionadosArr));
        } catch (e) {
            console.error('Error saving formulariosSeleccionados to localStorage:', e);
        }

        try {
            // Obtener todos los formularios únicos de todos los comedores
            const todosLosFormularios = Object.values(formulariosPorComedor).flat();

            // Crear un array de promesas, una por cada formulario individual
            const fetchPromises = todosLosFormularios.map((form) => {
                console.log(`Obteniendo formulario con id: ${form.id}`);
                return fetch(`http://localhost:5000/get_Form?id=${encodeURIComponent(form.id)}`)
                    .then(res => {
                        if (!res.ok) {
                            throw new Error(`Error al obtener formulario ${form.id}: ${res.status}`);
                        }
                        return res.json();
                    })
                    .then(data => {
                        console.log(`Datos recibidos para ${form.id}:`, data);
                        return {
                            data: data
                        };
                    })
                    .catch(error => {
                        console.error(`Error al obtener formulario ${form.id}:`, error);
                        return {
                            formId: form.id,
                            formName: form.name,
                            data: null,
                            error: error.message
                        };
                    });
            });

            // Ejecutar todas las promesas
            const results = await Promise.all(fetchPromises);

            console.log("Todos los datos obtenidos:", results);

            // Verificar si hubo errores
            const errores = results.filter(result => result.error);
            if (errores.length > 0) {
                console.warn("Algunos formularios no se pudieron obtener:", errores);
            }

            // Mostrar resultados exitosos
            const exitosos = results.filter(result => !result.error);
            console.log(`Se obtuvieron exitosamente ${exitosos.length} de ${results.length} formularios`);

            // Construir array de forms para almacenar en localStorage
            try {
                // Mapear solo los formularios que se obtuvieron correctamente y tienen data
                const formsToStore = exitosos
                    .filter(r => r.data != null)
                    .map(r => ({ id: r.formId, name: r.formName, data: r.data }));

                // Eliminar duplicados por id (por si acaso)
                const uniqueForms = Array.from(new Map(formsToStore.map(f => [f.id, f])).values());

                // Guardar en localStorage con la clave 'forms'
                try {
                    localStorage.setItem('forms', JSON.stringify(uniqueForms));
                    // Mantener `formulariosSeleccionados` con la estructura por comedor (no sobreescribir)
                    setFormulariosSeleccionados(seleccionadosArr);
                    console.log(`Saved ${uniqueForms.length} form(s) to localStorage key 'forms'`);
                } catch (e) {
                    console.error('Error saving forms to localStorage:', e);
                }
            } catch (e) {
                console.error('Error procesando formularios para guardar en localStorage:', e);
            }

            // ✅ Limpiar todos los formularios seleccionados
            setFormulariosPorComedor({});

            navigate("/home");

        } catch (error) {
            console.error("Error al obtener formularios desde el backend:", error);
            await showCustomAlert({
                title: "Error",
                text: "Error al obtener los formularios. Inténtalo de nuevo.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        } finally {
            setLoading(false);
        }
    };
    const handleRemoveForm = (formId) => {
        setFormulariosPorComedor((prev) => ({
            ...prev,
            [comedorIdSeleccionado]: (prev[comedorIdSeleccionado] || []).filter(
                (form) => form.id !== formId
            ),
        }));
    };

    useEffect(() => {
        comedorSeleccionadoRef.current = comedorIdSeleccionado;
    }, [comedorIdSeleccionado]);

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
        <div className={styles.selectPreferencesContainer}>
            {isAdmin && <Header />}
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>

            <div className={styles.pageContainer}>
                <h2>Seleccionar Preferencias</h2>

                <div className={styles.inputGroup}>
                    <label>Colaborador:</label>
                    <input type="text" value={user?.nombreCompleto || ""} disabled />

                    <label>Comedor:</label>
                    <select
                        value={comedorIdSeleccionado}
                        onChange={(e) => setComedorIdSeleccionado(e.target.value)}
                    >
                        <option value="">Selecciona un comedor</option>
                        {comedoresDisponibles.map((comedor) => (
                            <option key={comedor._id} value={comedor._id}>
                                {comedor.nombre}
                            </option>
                        ))}
                    </select>

                    <label>País:</label>
                    <input type="text" value={comedorPais} disabled />

                    <label>Seleccionar formulario:</label>
                    <button onClick={handleOpenDrivePicker}>
                        Seleccionar formularios desde Drive
                    </button>
                </div>

                <div className={styles.inputGroup}>
                    {Object.entries(formulariosPorComedor).map(([comedorId, formularios]) => {
                        const comedorNombre = comedoresDisponibles.find(c => c._id === comedorId)?.nombre || "Comedor desconocido";
                        return formularios.map((form) => (
                            <li key={form.id}>
                                {form.name} - {comedorNombre}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormulariosPorComedor((prev) => ({
                                            ...prev,
                                            [comedorId]: (prev[comedorId] || []).filter(f => f.id !== form.id),
                                        }));
                                    }}
                                    style={{ marginLeft: "10px", color: "red" }}
                                >
                                    Quitar
                                </button>
                            </li>
                        ));
                    })}
                </div>

                <div className={styles.buttonGroup}>
                    <button onClick={handleSave}>Guardar</button>
                    <button onClick={handleLogout}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};

export default SelectPreferences;