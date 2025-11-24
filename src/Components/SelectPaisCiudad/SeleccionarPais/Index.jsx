import React, { useEffect, useState } from "react";
import styles from "../SelectPaisCiudad.module.css";

const SeleccionarPais = ({ pais = "", setPais }) => {
    const [paises, setPaises] = useState([]);
    const [codigoPais, setCodigoPais] = useState("");

    useEffect(() => {
        const fetchPaises = async () => {
            try {
                const res = await fetch("https://countriesnow.space/api/v0.1/countries/iso");
                const json = await res.json();

                if (!Array.isArray(json.data)) throw new Error("Error en formato");

                const ordenados = json.data
                    .map(p => ({ nombre: p.name, codigo: p.Iso2 }))
                    .sort((a, b) => a.nombre.localeCompare(b.nombre));

                setPaises(ordenados);
            } catch (err) {
                console.error("Error al cargar países:", err);
            }
        };

        fetchPaises();
    }, []);

    const handleChange = (e) => {
        const codigo = e.target.value;
        const nombre = paises.find(p => p.codigo === codigo)?.nombre || "";
        setCodigoPais(codigo);
        setPais(nombre);
    };

    return (
        <div className={styles.formGroup}>
            <label className={styles.label}>País:</label>
            <select className={styles.input} value={codigoPais} onChange={handleChange}>
                <option value="">Selecciona un país</option>
                {paises.map((pais, i) => (
                    <option key={pais.codigo || `pais-${i}`} value={pais.codigo}>
                        {pais.nombre}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SeleccionarPais;
