const API_URL = "http://localhost:5000";

export const getEncargado = async (identificacion) => {
  const response = await fetch(
    `${API_URL}/find_by_identification?identificacion=${identificacion}`,
  );
  return response.json();
};

export const crearEncargado = async (datos) => {
  const response = await fetch(`${API_URL}/create_manager`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return response.json();
};

export const agregarCampos = async (datos) => {
  const response = await fetch(`${API_URL}/add_fields`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return response.json();
};

export const crearComedor = async (datos) => {
  try {
    const response = await fetch("http://localhost:5000/post_comedor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    return response.json();
  } catch (error) {
    return { error: error.message };
  }
};

export const listarComedores = async () => {
  try {
    const response = await fetch("http://localhost:5000/find_comedores");
    return response.json();
  } catch (error) {
    return { error: error.message };
  }
};

export const listarComedoresPorIds = async (ids) => {
  try {
    const response = await fetch(
      "http://localhost:5000/find_comedores_by_ids",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      },
    );
    return response.json();
  } catch (error) {
    return { error: error.message };
  }
};

export const listarComedoresPorNombres = async (nombre) => {
  try {
    const response = await fetch(
      "http://localhost:5000/find_comedores_by_name",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      },
    );
    return response.json();
  } catch (error) {
    return { error: error.message };
  }
};
