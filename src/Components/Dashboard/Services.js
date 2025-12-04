import axios from "axios";

const backend = "https://mog-analytics.onrender.com";
const mainBackend = "https://mog-sqj7.onrender.com";

// Obtener lista de comedores
export const getComedores = async () => {
  try {
    const response = await fetch(`${mainBackend}/find_comedores`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener comedores:", error);
    return [];
  }
};

// Obtener lista de encargados
export const getEncargados = async () => {
  try {
    const response = await fetch(`${mainBackend}/all_manager`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Datos de encargados recibidos:", data);
    return data;
  } catch (error) {
    console.error("Error al obtener encargados:", error);
    return [];
  }
};

// Obtener lista de formularios
export const getFormularios = async () => {
  try {
    const response = await fetch(`${mainBackend}/get_forms_list`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Datos de formularios recibidos:", data);
    return data;
  } catch (error) {
    console.error("Error al obtener formularios:", error);
    return [];
  }
};

// Obtener respuestas por pregunta
export const getRespuestasPorPregunta = async (formId, pregunta) => {
  try {
    const response = await axios.get(`${backend}/api/v1/dashboard/preguntas/${formId}`, {
      params: { pregunta },
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener respuestas por pregunta:", error);
    // Datos de ejemplo
    return [
      { respuesta: "Opción 1", count: 120 },
      { respuesta: "Opción 2", count: 85 },
      { respuesta: "Opción 3", count: 45 },
      { respuesta: "Opción 4", count: 15 }
    ];
  }
};

// Obtener métricas del dashboard
export const getDashboardMetrics = async (filterType = "general", selectedId = null) => {
  try {
    let endpoint = "";
    
    switch (filterType) {
      case "general":
        endpoint = "/api/v1/dashboard/general";
        break;
      case "comedor":
        if (!selectedId) {
          throw new Error("Se requiere seleccionar un comedor");
        }
        endpoint = `/api/v1/dashboard/comedor/${selectedId}`;
        break;
      case "encargado":
        if (!selectedId) {
          throw new Error("Se requiere seleccionar un encargado");
        }
        endpoint = `/api/v1/dashboard/encargado/${selectedId}`;
        break;
      case "encuestas":
        if (!selectedId) {
          throw new Error("Se requiere seleccionar una encuesta");
        }
        endpoint = `/api/v1/dashboard/formulario/${selectedId}`;
        break;
      default:
        endpoint = "/api/v1/dashboard/general";
    }

    const response = await axios.get(`${backend}${endpoint}`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = response.data;
    
    // Si es tipo comedor, transformar la respuesta
    if (filterType === "comedor") {
      const estratoPorNivel = Object.entries(data.distribucion_estrato || {}).map(([nivel, total]) => ({
        nivel,
        total
      }));

      return {
        comedorId: data.comedor_id,
        comedorNombre: data.comedor_nombre,
        totalRealizaciones: data.total_realizaciones || 0,
        totalBeneficiarios: data.total_beneficiarios || 0,
        promedioBeneficiariosPorRealizacion: data.promedio_beneficiarios_por_realizacion || 0,
        edadPromedio: data.edades_promedio || 0,
        distribucionEstrato: estratoPorNivel
      };
    }

    // Si es tipo encargado, transformar la respuesta
    if (filterType === "encargado") {
      return {
        encargadoId: data.encargado_id,
        encargadoNombre: data.nombre,
        totalRealizaciones: data.total_realizaciones || 0,
        totalBeneficiarios: data.total_beneficiarios || 0,
        comedoresCargo: data.comedores_cargo || 0
      };
    }

    // Si es tipo encuestas, transformar la respuesta
    if (filterType === "encuestas") {
      const distribucionNacionalidad = Object.entries(data.distribucion_nacionalidad || {}).map(([nacionalidad, total]) => ({
        nacionalidad,
        total
      }));

      const distribucionEstrato = Object.entries(data.distribucion_estrato || {}).map(([estrato, total]) => ({
        estrato,
        total
      }));

      const distribucionCiudad = Object.entries(data.distribucion_ciudad || {}).map(([ciudad, total]) => ({
        ciudad,
        total
      }));

      return {
        idFormulario: data.id_formulario,
        nombreEncuesta: data.nombre_encuesta,
        totalRealizaciones: data.total_realizaciones || 0,
        totalEncuestados: data.total_encuestados || 0,
        edadPromedio: data.edad_promedio || 0,
        distribucionNacionalidad,
        distribucionEstrato,
        distribucionCiudad,
        top5Preguntas: data.top_5_preguntas || []
      };
    }
    
    // Para tipo general (mantener código existente)
    const comedoresPorPais = Object.entries(data.comedores_por_pais || {}).map(([pais, total]) => ({
      pais,
      total
    }));
    
    const encargadosPorPais = Object.entries(data.encargados_por_pais || {}).map(([pais, total]) => ({
      pais,
      total
    }));
    
    const beneficiariosPorPais = Object.entries(data.beneficiarios_por_pais || {}).map(([pais, total]) => ({
      pais,
      total
    }));

    const totalEncuestas = data.total_encuestas || 0;
    
    const formulariosPorPais = data.formularios_por_pais 
      ? Object.entries(data.formularios_por_pais).map(([pais, total]) => ({
          pais,
          total
        }))
      : [];

    return {
      totalComedores: data.total_comedores || 0,
      totalEncargados: data.total_encargados || 0,
      totalBeneficiarios: data.total_beneficiarios || 0,
      totalEncuestas: totalEncuestas,
      comedoresPorPais,
      encargadosPorPais,
      beneficiariosPorPais,
      formulariosPorPais
    };
  } catch (error) {
    console.error("Error al obtener métricas del dashboard:", error);
    
    // Si es tipo comedor, devolver datos de ejemplo específicos
    if (filterType === "comedor") {
      console.warn("Usando datos de ejemplo para comedor");
      return {
        comedorId: "ejemplo123",
        comedorNombre: "Comedor Ejemplo",
        totalRealizaciones: 15,
        totalBeneficiarios: 245,
        promedioBeneficiariosPorRealizacion: 16.3,
        edadPromedio: 42.5,
        distribucionEstrato: [
          { nivel: "1", total: 80 },
          { nivel: "2", total: 95 },
          { nivel: "3", total: 50 },
          { nivel: "4", total: 15 },
          { nivel: "5", total: 5 }
        ]
      };
    }

    // Si es tipo encargado, devolver datos de ejemplo específicos
    if (filterType === "encargado") {
      console.warn("Usando datos de ejemplo para encargado");
      return {
        encargadoId: "12345678",
        encargadoNombre: "Encargado Ejemplo",
        totalRealizaciones: 8,
        totalBeneficiarios: 156,
        comedoresCargo: 3
      };
    }
    
    // Datos de ejemplo para vista general
    console.warn("Usando datos de ejemplo debido a error de conexión");
    return {
      totalComedores: 45,
      totalEncargados: 128,
      totalBeneficiarios: 3542,
      totalEncuestas: 892,
      comedoresPorPais: [
        { pais: "Guatemala", total: 15 },
        { pais: "Honduras", total: 12 },
        { pais: "El Salvador", total: 8 },
        { pais: "Nicaragua", total: 6 },
        { pais: "Costa Rica", total: 4 }
      ],
      encargadosPorPais: [
        { pais: "Guatemala", total: 42 },
        { pais: "Honduras", total: 35 },
        { pais: "El Salvador", total: 25 },
        { pais: "Nicaragua", total: 16 },
        { pais: "Costa Rica", total: 10 }
      ],
      beneficiariosPorPais: [
        { pais: "Guatemala", total: 1250 },
        { pais: "Honduras", total: 980 },
        { pais: "El Salvador", total: 620 },
        { pais: "Nicaragua", total: 412 },
        { pais: "Costa Rica", total: 280 }
      ],
      formulariosPorPais: [
        { pais: "Guatemala", total: 320 },
        { pais: "Honduras", total: 245 },
        { pais: "El Salvador", total: 175 },
        { pais: "Nicaragua", total: 102 },
        { pais: "Costa Rica", total: 50 }
      ]
    };
  }
};
