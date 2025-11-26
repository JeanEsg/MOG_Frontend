import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './AñadirCampos.module.css';
import Swal from 'sweetalert2';

const AñadirCampos = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [usuario, setUsuario] = useState(null);
    const [formData, setFormData] = useState({
        // nombreCompleto: '',
        identificacion: id,
        telefono: '',
        pais: '',
        contraseña: ''
    });

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                const response = await fetch(`https://mog-sqj7.onrender.com/find_by_identification?identificacion=${id}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Usuario no encontrado',
                            text: `No existe un usuario con identificación ${id}`
                        });
                        navigate('/'); // Redirige a donde tú prefieras
                    } else {
                        throw new Error(`Error al obtener el usuario: ${response.status}`);
                    }
                    return;
                }

                const data = await response.json();

                if (data.contraseña) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Usuario ya registrado',
                        text: 'Este usuario ya tiene contraseña y datos completos.'
                    });
                    navigate('/login'); // redirige al login
                    return;
                }

                setUsuario(data);
            } catch (error) {
                console.error('Error al obtener el usuario:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error de conexión',
                    text: 'No se pudo obtener la información del usuario.'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUsuario();
    }, [id, navigate]);

    if (loading) return <p>Cargando...</p>;

    if (!usuario) return null;

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGuardar = async () => {
        // Validaciones front-end
        if (!formData.contraseña || !formData.telefono || !formData.pais) {
            Swal.fire('Campos requeridos', 'Por favor llena todos los campos.', 'warning');
            return;
        }

        // La API espera una contraseña de más de 4 caracteres (service valida length <= 4)
        if (typeof formData.contraseña === 'string' && formData.contraseña.length <= 4) {
            Swal.fire('Contraseña inválida', 'La contraseña debe tener al menos 5 caracteres.', 'warning');
            return;
        }

        const payload = {
            identificacion: Number(formData.identificacion ?? usuario.identificacion),
            telefono: formData.telefono ? Number(formData.telefono) : undefined,
            pais: formData.pais,
            password: formData.contraseña
        };

        try {
            const res = await fetch('https://mog-sqj7.onrender.com/add_fields', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                Swal.fire('Éxito', 'Información actualizada correctamente', 'success').then(() => {
                    navigate('/login');
                });
            } else {
                // intentar leer mensaje de error del backend
                const errText = await res.text();
                console.error('Error response body:', errText);
                Swal.fire('Error', 'No se pudo guardar la información', 'error');
            }
        } catch (error) {
            console.error('Error al guardar:', error);
            Swal.fire('Error', 'Error en el servidor', 'error');
        }
    };

    if (!usuario) return null;

    return (
        <div className={styles.selectPreferencesContainer}>
            <div className={styles.pageContainer}>
                <h2>Completar Registro</h2>

                <div className={styles.inputGroup}>
                    {/* <label>Nombre completo:</label>
                    <input
                        type="text"
                        name="nombreCompleto"
                        value={formData.nombreCompleto}
                        disabled
                    /> */}

                    <label>Teléfono:</label>
                    <input
                        type="text"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                    />

                    <label>País:</label>
                    <input
                        type="text"
                        name="pais"
                        value={formData.pais}
                        onChange={handleChange}
                    />

                    <label>Contraseña:</label>
                    <input
                        type="password"
                        name="contraseña"
                        value={formData.contraseña}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.buttonGroup}>
                    <button onClick={handleGuardar}>Guardar</button>
                    <button onClick={() => navigate('/login')}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};

export default AñadirCampos;
