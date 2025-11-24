import React, { useEffect, useState } from "react";
import styles from "./SelectPaisCiudad.module.css";

const SelectPaisCiudad = ({ datos = { nombre: "", pais: "" }, setDatos }) => {
    const [paises, setPaises] = useState([]);
    const [codigoPais, setCodigoPais] = useState("");
    const [ciudades, setCiudades] = useState([]);

    // Cargar países
    useEffect(() => {
        const fetchPaises = async () => {
            try {
                const res = await fetch("https://countriesnow.space/api/v0.1/countries/iso");
                const json = await res.json();

                if (json.error || !Array.isArray(json.data)) {
                    throw new Error("Error en formato de países");
                }

                const ordenados = json.data
                    .map((pais) => ({
                        nombre: pais.name,
                        codigo: pais.Iso2,
                    }))
                    .sort((a, b) => a.nombre.localeCompare(b.nombre));

                setPaises(ordenados);
            } catch (err) {
                console.error("Error al cargar países:", err);
            }
        };

        fetchPaises();
    }, []);

    // Cargar ciudades al cambiar país
    useEffect(() => {
        const fetchCiudades = async () => {
            if (!datos.pais) return;

            try {
                const res = await fetch("https://countriesnow.space/api/v0.1/countries/cities", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ country: datos.pais }),
                });

                const json = await res.json();
                if (json.error || !Array.isArray(json.data)) {
                    throw new Error("Error en formato de ciudades");
                }

                const ciudadesOrdenadas = json.data.sort((a, b) => a.localeCompare(b));

                setCiudades(ciudadesOrdenadas);
            } catch (err) {
                console.error("Error al cargar ciudades:", err);
                setCiudades([]);
            }
        };

        fetchCiudades();
    }, [datos.pais]);

    return (
        <>
            <div className={styles.formGroup}>
                <label className={styles.label}>País:</label>
                <select
                    className={styles.input}
                    value={codigoPais}
                    onChange={(e) => {
                        const nuevoPais = e.target.value;
                        const nombre = paises.find(p => p.codigo === nuevoPais)?.nombre || "";
                        setCodigoPais(nuevoPais);
                        setDatos({ ...datos, pais: nombre, nombre: "" });
                        setCiudades([]);
                    }}
                >
                    <option value="">Selecciona un país</option>
                    {paises.map((pais, i) => (
                        <option key={pais.codigo || `pais-${i}`} value={pais.codigo}>
                            {pais.nombre}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Ciudad:</label>
                <select
                    className={styles.input}
                    value={datos.nombre}
                    onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                    disabled={!ciudades.length}
                >
                    <option value="">Selecciona una ciudad</option>
                    {ciudades.map((ciudad, index) => (
                        <option key={`${ciudad}-${index}`} value={ciudad}>
                            {ciudad}
                        </option>
                    ))}
                </select>
            </div>
        </>
    );
};

export default SelectPaisCiudad;
