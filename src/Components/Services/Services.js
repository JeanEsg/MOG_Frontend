import axios from "axios";

const backend = "https://mog-sqj7.onrender.com";

// Obtener todos los formularios
export const getAll = async () => {
  try {
    const response = await axios.get(`${backend}/getAll`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener formularios:", error);
    throw error;
  }
};

// Obtener un formulario por ID
export const getFormById = async (id) => {
  try {
    const response = await axios.get(`${backend}/getById/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el formulario ${id}:`, error);
    throw error;
  }
};

// Guardar una nueva respuesta
export const createAnswer = async (formData) => {
  try {
    const response = await axios.post(`${backend}/createForm`, formData);
    return response.data;
  } catch (error) {
    console.error("Error al crear formulario:", error);
    throw error;
  }
};

export function guardarRespuestasEnStorage(nuevoFormulario) {
  let json = JSON.parse(localStorage.getItem("respuestas")) || [];

  const encuestaExistente = json.find(
    (encuesta) =>
      encuesta.nombre === nuevoFormulario.nombre &&
      encuesta.id_formulario === nuevoFormulario.id_formulario,
  );

  if (encuestaExistente) {
    for (const nuevaRealizacion of nuevoFormulario.Realizaciones) {
      const realizacionExistente = encuestaExistente.Realizaciones.find(
        (r) =>
          r.id_encargado === nuevaRealizacion.id_encargado &&
          r.id_comedor === nuevaRealizacion.id_comedor,
      );

      if (realizacionExistente) {
        for (const encuestado of nuevaRealizacion.encuestados) {
          const yaExiste = realizacionExistente.encuestados.some(
            (e) =>
              e.nombreCompleto === encuestado.nombreCompleto &&
              e.fechaRealizacion === encuestado.fechaRealizacion,
          );
          if (!yaExiste) {
            realizacionExistente.encuestados.push(encuestado);
          }
        }
      } else {
        encuestaExistente.Realizaciones.push(nuevaRealizacion);
      }
    }
  } else {
    json.push(nuevoFormulario);
  }

  localStorage.setItem("respuestas", JSON.stringify(json));
  console.log("✅ Formulario guardado en localStorage");
}
