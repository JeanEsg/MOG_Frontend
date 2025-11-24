import React, { createContext, useState, useContext, useEffect } from "react";

// Crear el contexto
const UserContext = createContext();

// Proveedor del contexto
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // objeto con info completa del encargado
  const [comedores, setComedores] = useState({ nombre: "", pais: "" });
  const [formulariosSeleccionados, setFormulariosSeleccionados] = useState([]);
  const [formulariosPorComedor, setFormulariosPorComedor] = useState({});

  // Cargar datos desde localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedComedor = localStorage.getItem("comedores");
    const savedFormularios = localStorage.getItem("formulariosSeleccionados");
    const savedFormulariosPorComedor = localStorage.getItem("formulariosPorComedor");

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedComedor) setComedores(JSON.parse(savedComedor));
    if (savedFormularios) setFormulariosSeleccionados(JSON.parse(savedFormularios));
    if (savedFormulariosPorComedor) setFormulariosPorComedor(JSON.parse(savedFormulariosPorComedor));
  }, []);

  // Guardar en localStorage cuando cambien
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    if (comedores && comedores.nombre && comedores.pais) {
      localStorage.setItem("comedores", JSON.stringify(comedores));
    }
    if (formulariosSeleccionados.length > 0) {
      localStorage.setItem("formulariosSeleccionados", JSON.stringify(formulariosSeleccionados));
    }
    if (Object.keys(formulariosPorComedor).length > 0) {
      localStorage.setItem("formulariosPorComedor", JSON.stringify(formulariosPorComedor));
    }
  }, [user, comedores, formulariosSeleccionados, formulariosPorComedor]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        comedores,
        setComedores,
        formulariosSeleccionados,
        setFormulariosSeleccionados,
        formulariosPorComedor,
        setFormulariosPorComedor,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
// Hook para usar el contexto
export const useUser = () => useContext(UserContext);
