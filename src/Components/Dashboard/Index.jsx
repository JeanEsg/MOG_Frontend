import { useEffect, useState } from "react";
import { useUser } from "../../Context/userContext";
import Header from "../Header/Index";
import { getDashboardMetrics, getComedores, getEncargados, getFormularios } from "./Services";
import styles from "./Dashboard.module.css";
import Swal from "sweetalert2";

const Dashboard = () => {
    const { user } = useUser();
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState("general");
    const [selectedId, setSelectedId] = useState("");
    const [comedores, setComedores] = useState([]);
    const [encargados, setEncargados] = useState([]);
    const [formularios, setFormularios] = useState([]);

    useEffect(() => {
        loadComedores();
        loadEncargados();
        loadFormularios();
    }, []);

    useEffect(() => {
        loadMetrics();
    }, [filterType, selectedId]);

    const loadComedores = async () => {
        try {
            const data = await getComedores();
            setComedores(data || []);
        } catch (error) {
            console.error("Error cargando comedores:", error);
        }
    };

    const loadEncargados = async () => {
        try {
            const data = await getEncargados();
            console.log("Encargados cargados en Dashboard:", data); // Log para debug
            setEncargados(data || []);
        } catch (error) {
            console.error("Error cargando encargados:", error);
        }
    };

    const loadFormularios = async () => {
        try {
            const data = await getFormularios();
            setFormularios(data || []);
        } catch (error) {
            console.error("Error cargando formularios:", error);
        }
    };

    const loadMetrics = async () => {
        setLoading(true);
        try {
            const data = await getDashboardMetrics(filterType, selectedId);
            setMetrics(data);
        } catch (error) {
            console.error("Error cargando métricas:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilterType(e.target.value);
        setSelectedId("");
    };

    const handleComedorChange = (e) => {
        setSelectedId(e.target.value);
    };

    const handleEncargadoChange = (e) => {
        setSelectedId(e.target.value);
    };

    const handleFormularioChange = (e) => {
        setSelectedId(e.target.value);
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className={styles.dashboard}>
                    <div className={styles.loadingContainer}>
                        <p className={styles.loadingText}>Cargando métricas...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className={styles.dashboard}>
                <div className={styles.dashboardHeader}>
                    <h1 className={styles.title}>DASHBOARD</h1>
                    <div className={styles.filterContainer}>
                        <label htmlFor="filterType" className={styles.filterLabel}>
                            Filtrar por:
                        </label>
                        <select
                            id="filterType"
                            value={filterType}
                            onChange={handleFilterChange}
                            className={styles.filterSelect}
                        >
                            <option value="general">General</option>
                            <option value="comedor">Comedor</option>
                            <option value="encargado">Encargado</option>
                            <option value="encuestas">Encuestas</option>
                        </select>

                        {filterType === "comedor" && (
                            <select
                                value={selectedId}
                                onChange={handleComedorChange}
                                className={styles.filterSelect}
                            >
                                <option value="">Seleccione un comedor</option>
                                {comedores.map((comedor) => (
                                    <option key={comedor._id} value={comedor._id}>
                                        {comedor.nombre}
                                    </option>
                                ))}
                            </select>
                        )}

                        {filterType === "encargado" && (
                            <select
                                value={selectedId}
                                onChange={handleEncargadoChange}
                                className={styles.filterSelect}
                            >
                                <option value="">Seleccione un encargado</option>
                                {encargados.map((encargado) => (
                                    <option key={encargado.identificacion} value={encargado.identificacion}>
                                        {encargado.nombreCompleto || encargado.nombre}
                                    </option>
                                ))}
                            </select>
                        )}

                        {filterType === "encuestas" && (
                            <select
                                value={selectedId}
                                onChange={handleFormularioChange}
                                className={styles.filterSelect}
                            >
                                <option value="">Seleccione una encuesta</option>
                                {formularios.map((form) => (
                                    <option key={form.id_formulario} value={form.id_formulario}>
                                        {form.nombre}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                <div className={styles.metricsContainer}>
                    {/* Vista para Comedor */}
                    {filterType === "comedor" && selectedId && (
                        <>
                            {/* Cards de Totales para Comedor */}
                            <div className={styles.comedorHeader}>
                                <h2 className={styles.comedorTitle}>{metrics?.comedorNombre || "Comedor"}</h2>
                            </div>
                            
                            <div className={styles.cardsGrid}>
                                <div className={`${styles.metricCard} ${styles.cardComedores}`}>
                                    <div className={styles.cardIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={styles.icon}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                        </svg>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <p className={styles.cardLabel}>TOTAL REALIZACIONES</p>
                                        <p className={styles.cardValue}>{metrics?.totalRealizaciones || 0}</p>
                                    </div>
                                </div>

                                <div className={`${styles.metricCard} ${styles.cardBeneficiarios}`}>
                                    <div className={styles.cardIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={styles.icon}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                        </svg>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <p className={styles.cardLabel}>TOTAL BENEFICIARIOS</p>
                                        <p className={styles.cardValue}>{metrics?.totalBeneficiarios || 0}</p>
                                    </div>
                                </div>

                                <div className={`${styles.metricCard} ${styles.cardEncargados}`}>
                                    <div className={styles.cardIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={styles.icon}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <p className={styles.cardLabel}>PROMEDIO POR REALIZACIÓN</p>
                                        <p className={styles.cardValue}>{metrics?.promedioBeneficiariosPorRealizacion?.toFixed(1) || 0}</p>
                                    </div>
                                </div>

                                <div className={`${styles.metricCard} ${styles.cardEncuestas}`}>
                                    <div className={styles.cardIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={styles.icon}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z" />
                                        </svg>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <p className={styles.cardLabel}>EDAD PROMEDIO</p>
                                        <p className={styles.cardValue}>{metrics?.edadPromedio?.toFixed(1) || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Gráfica de Distribución por Estrato */}
                            <div className={styles.chartsGrid}>
                                <div className={`${styles.chartCard} ${styles.chartCardFull}`}>
                                    <h2 className={styles.chartTitle}>Distribución por Estrato</h2>
                                    <div className={styles.barChart}>
                                        {metrics?.distribucionEstrato && metrics.distribucionEstrato.length > 0 ? (
                                            metrics.distribucionEstrato.map((item, index) => {
                                                const maxValue = Math.max(...metrics.distribucionEstrato.map(i => i.total));
                                                const percentage = (item.total / maxValue) * 100;
                                                return (
                                                    <div key={index} className={styles.barItem}>
                                                        <div className={styles.barLabel}>Estrato {item.nivel}</div>
                                                        <div className={styles.barWrapper}>
                                                            <div
                                                                className={`${styles.barFill} ${styles.barFillPurple}`}
                                                                style={{ width: `${percentage}%` }}
                                                            >
                                                                <span className={styles.barValue}>{item.total}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className={styles.noData}>No hay datos disponibles</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Vista para Encargado */}
                    {filterType === "encargado" && selectedId && (
                        <>
                            {/* Header para Encargado */}
                            <div className={styles.comedorHeader}>
                                <h2 className={styles.comedorTitle}>{metrics?.encargadoNombre || "Encargado"}</h2>
                            </div>
                            
                            <div className={styles.cardsGrid}>
                                <div className={`${styles.metricCard} ${styles.cardEncargados}`}>
                                    <div className={styles.cardIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={styles.icon}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <p className={styles.cardLabel}>IDENTIFICACIÓN</p>
                                        <p className={styles.cardValue} style={{ fontSize: '1.5rem' }}>{metrics?.encargadoId || "N/A"}</p>
                                    </div>
                                </div>

                                <div className={`${styles.metricCard} ${styles.cardComedores}`}>
                                    <div className={styles.cardIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={styles.icon}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                        </svg>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <p className={styles.cardLabel}>TOTAL REALIZACIONES</p>
                                        <p className={styles.cardValue}>{metrics?.totalRealizaciones || 0}</p>
                                    </div>
                                </div>

                                <div className={`${styles.metricCard} ${styles.cardBeneficiarios}`}>
                                    <div className={styles.cardIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={styles.icon}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                        </svg>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <p className={styles.cardLabel}>TOTAL BENEFICIARIOS</p>
                                        <p className={styles.cardValue}>{metrics?.totalBeneficiarios || 0}</p>
                                    </div>
                                </div>

                                <div className={`${styles.metricCard} ${styles.cardEncuestas}`}>
                                    <div className={styles.cardIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={styles.icon}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                                        </svg>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <p className={styles.cardLabel}>COMEDORES A CARGO</p>
                                        <p className={styles.cardValue}>{metrics?.comedoresCargo || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Vista para Encuestas */}
                    {filterType === "encuestas" && selectedId && (
                        <>
                            {/* Header para Encuestas */}
                            <div className={styles.comedorHeader}>
                                <h2 className={styles.comedorTitle}>
                                    {metrics?.nombreEncuesta || "Encuesta"}
                                </h2>
                            </div>
                            
                            {/* Cards de Métricas */}
                            <div className={styles.cardsGrid}>
                                <div className={`${styles.metricCard} ${styles.cardComedores}`}>
                                    <div className={styles.cardIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={styles.icon}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                        </svg>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <p className={styles.cardLabel}>TOTAL REALIZACIONES</p>
                                        <p className={styles.cardValue}>{metrics?.totalRealizaciones || 0}</p>
                                    </div>
                                </div>

                                <div className={`${styles.metricCard} ${styles.cardBeneficiarios}`}>
                                    <div className={styles.cardIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={styles.icon}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <p className={styles.cardLabel}>TOTAL ENCUESTADOS</p>
                                        <p className={styles.cardValue}>{metrics?.totalEncuestados || 0}</p>
                                    </div>
                                </div>

                                <div className={`${styles.metricCard} ${styles.cardEncargados}`}>
                                    <div className={styles.cardIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={styles.icon}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <p className={styles.cardLabel}>EDAD PROMEDIO</p>
                                        <p className={styles.cardValue}>{metrics?.edadPromedio?.toFixed(1) || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Gráficas */}
                            <div className={styles.chartsGrid}>
                                {/* Distribución por Nacionalidad */}
                                <div className={styles.chartCard}>
                                    <h2 className={styles.chartTitle}>Distribución por Nacionalidad</h2>
                                    <div className={styles.barChart}>
                                        {metrics?.distribucionNacionalidad && metrics.distribucionNacionalidad.length > 0 ? (
                                            metrics.distribucionNacionalidad.map((item, index) => {
                                                const maxValue = Math.max(...metrics.distribucionNacionalidad.map(n => n.total));
                                                const percentage = (item.total / maxValue) * 100;
                                                return (
                                                    <div key={index} className={styles.barItem}>
                                                        <div className={styles.barLabel}>{item.nacionalidad}</div>
                                                        <div className={styles.barWrapper}>
                                                            <div
                                                                className={`${styles.barFill} ${styles.barFillGreen}`}
                                                                style={{ width: `${percentage}%` }}
                                                            >
                                                                <span className={styles.barValue}>{item.total}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className={styles.noData}>No hay datos disponibles</p>
                                        )}
                                    </div>
                                </div>

                                {/* Distribución por Estrato */}
                                <div className={styles.chartCard}>
                                    <h2 className={styles.chartTitle}>Distribución por Estrato</h2>
                                    <div className={styles.barChart}>
                                        {metrics?.distribucionEstrato && metrics.distribucionEstrato.length > 0 ? (
                                            metrics.distribucionEstrato.map((item, index) => {
                                                const maxValue = Math.max(...metrics.distribucionEstrato.map(e => e.total));
                                                const percentage = (item.total / maxValue) * 100;
                                                return (
                                                    <div key={index} className={styles.barItem}>
                                                        <div className={styles.barLabel}>Estrato {item.estrato}</div>
                                                        <div className={styles.barWrapper}>
                                                            <div
                                                                className={`${styles.barFill} ${styles.barFillBlue}`}
                                                                style={{ width: `${percentage}%` }}
                                                            >
                                                                <span className={styles.barValue}>{item.total}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className={styles.noData}>No hay datos disponibles</p>
                                        )}
                                    </div>
                                </div>

                                {/* Distribución por Ciudad */}
                                <div className={styles.chartCard}>
                                    <h2 className={styles.chartTitle}>Distribución por Ciudad</h2>
                                    <div className={styles.barChart}>
                                        {metrics?.distribucionCiudad && metrics.distribucionCiudad.length > 0 ? (
                                            metrics.distribucionCiudad.map((item, index) => {
                                                const maxValue = Math.max(...metrics.distribucionCiudad.map(c => c.total));
                                                const percentage = (item.total / maxValue) * 100;
                                                return (
                                                    <div key={index} className={styles.barItem}>
                                                        <div className={styles.barLabel}>{item.ciudad}</div>
                                                        <div className={styles.barWrapper}>
                                                            <div
                                                                className={`${styles.barFill} ${styles.barFillOrange}`}
                                                                style={{ width: `${percentage}%` }}
                                                            >
                                                                <span className={styles.barValue}>{item.total}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className={styles.noData}>No hay datos disponibles</p>
                                        )}
                                    </div>
                                </div>

                                {/* Top 5 Preguntas más respondidas */}
                                <div className={styles.chartCard}>
                                    <h2 className={styles.chartTitle}>Top 5 Preguntas Más Respondidas</h2>
                                    <div className={styles.barChart}>
                                        {metrics?.top5Preguntas && metrics.top5Preguntas.length > 0 ? (
                                            metrics.top5Preguntas.map((item, index) => {
                                                const maxValue = Math.max(...metrics.top5Preguntas.map(p => p.respuestas));
                                                const percentage = (item.respuestas / maxValue) * 100;
                                                return (
                                                    <div key={index} className={styles.barItem}>
                                                        <div className={styles.barLabel}>
                                                            {item.pregunta.length > 40 
                                                                ? item.pregunta.substring(0, 40) + "..." 
                                                                : item.pregunta}
                                                        </div>
                                                        <div className={styles.barWrapper}>
                                                            <div
                                                                className={`${styles.barFill} ${styles.barFillPurple}`}
                                                                style={{ width: `${percentage}%` }}
                                                            >
                                                                <span className={styles.barValue}>{item.respuestas}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className={styles.noData}>No hay datos disponibles</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Vista General (mantener código existente) */}
                    {filterType === "general" && (
                        <>
                    {/* Cards de Totales */}
                    <div className={styles.cardsGrid}>
                        <div className={`${styles.metricCard} ${styles.cardComedores}`}>
                            <div className={styles.cardIcon}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className={styles.icon}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                                    />
                                </svg>
                            </div>
                            <div className={styles.cardContent}>
                                <p className={styles.cardLabel}>TOTAL COMEDORES</p>
                                <p className={styles.cardValue}>{metrics?.totalComedores || 0}</p>
                            </div>
                        </div>

                        <div className={`${styles.metricCard} ${styles.cardEncargados}`}>
                            <div className={styles.cardIcon}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className={styles.icon}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                                    />
                                </svg>
                            </div>
                            <div className={styles.cardContent}>
                                <p className={styles.cardLabel}>TOTAL ENCARGADOS</p>
                                <p className={styles.cardValue}>{metrics?.totalEncargados || 0}</p>
                            </div>
                        </div>

                        <div className={`${styles.metricCard} ${styles.cardBeneficiarios}`}>
                            <div className={styles.cardIcon}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className={styles.icon}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                                    />
                                </svg>
                            </div>
                            <div className={styles.cardContent}>
                                <p className={styles.cardLabel}>TOTAL BENEFICIARIOS</p>
                                <p className={styles.cardValue}>{metrics?.totalBeneficiarios || 0}</p>
                            </div>
                        </div>

                        <div className={`${styles.metricCard} ${styles.cardEncuestas}`}>
                            <div className={styles.cardIcon}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className={styles.icon}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                                    />
                                </svg>
                            </div>
                            <div className={styles.cardContent}>
                                <p className={styles.cardLabel}>TOTAL ENCUESTAS</p>
                                <p className={styles.cardValue}>{metrics?.totalEncuestas || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Gráficas */}
                    <div className={styles.chartsGrid}>
                        {/* Gráfica de Comedores por País */}
                        <div className={styles.chartCard}>
                            <h2 className={styles.chartTitle}>Comedores por País</h2>
                            <div className={styles.barChart}>
                                {metrics?.comedoresPorPais && metrics.comedoresPorPais.length > 0 ? (
                                    metrics.comedoresPorPais.map((item, index) => {
                                        const maxValue = Math.max(...metrics.comedoresPorPais.map(i => i.total));
                                        const percentage = (item.total / maxValue) * 100;
                                        return (
                                            <div key={index} className={styles.barItem}>
                                                <div className={styles.barLabel}>{item.pais}</div>
                                                <div className={styles.barWrapper}>
                                                    <div
                                                        className={`${styles.barFill} ${styles.barFillGreen}`}
                                                        style={{ width: `${percentage}%` }}
                                                    >
                                                        <span className={styles.barValue}>{item.total}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className={styles.noData}>No hay datos disponibles</p>
                                )}
                            </div>
                        </div>

                        {/* Gráfica de Encargados por País */}
                        <div className={styles.chartCard}>
                            <h2 className={styles.chartTitle}>Encargados por País</h2>
                            <div className={styles.barChart}>
                                {metrics?.encargadosPorPais && metrics.encargadosPorPais.length > 0 ? (
                                    metrics.encargadosPorPais.map((item, index) => {
                                        const maxValue = Math.max(...metrics.encargadosPorPais.map(i => i.total));
                                        const percentage = (item.total / maxValue) * 100;
                                        return (
                                            <div key={index} className={styles.barItem}>
                                                <div className={styles.barLabel}>{item.pais}</div>
                                                <div className={styles.barWrapper}>
                                                    <div
                                                        className={`${styles.barFill} ${styles.barFillBlue}`}
                                                        style={{ width: `${percentage}%` }}
                                                    >
                                                        <span className={styles.barValue}>{item.total}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className={styles.noData}>No hay datos disponibles</p>
                                )}
                            </div>
                        </div>

                        {/* Nueva Gráfica - Formularios por País */}
                        {metrics?.formulariosPorPais && metrics.formulariosPorPais.length > 0 && (
                            <div className={styles.chartCard}>
                                <h2 className={styles.chartTitle}>Formularios por País</h2>
                                <div className={styles.barChart}>
                                    {metrics.formulariosPorPais.map((item, index) => {
                                        const maxValue = Math.max(...metrics.formulariosPorPais.map(i => i.total));
                                        const percentage = (item.total / maxValue) * 100;
                                        return (
                                            <div key={index} className={styles.barItem}>
                                                <div className={styles.barLabel}>{item.pais}</div>
                                                <div className={styles.barWrapper}>
                                                    <div
                                                        className={`${styles.barFill} ${styles.barFillPurple}`}
                                                        style={{ width: `${percentage}%` }}
                                                    >
                                                        <span className={styles.barValue}>{item.total}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Gráfica de Beneficiarios por País */}
                        <div className={`${styles.chartCard} ${styles.chartCardFull}`}>
                            <h2 className={styles.chartTitle}>Beneficiarios por País</h2>
                            {metrics?.beneficiariosPorPais && metrics.beneficiariosPorPais.length > 0 ? (
                            <div className={styles.beneficiariesContainer}>
                                {/* Gráfica de pastel */}
                                <div className={styles.pieChartContainer}>
                                    <svg viewBox="0 0 200 200" className={styles.pieChart}>
                                        {metrics.beneficiariosPorPais.map((item, index, arr) => {
                                            const total = arr.reduce((sum, i) => sum + i.total, 0);
                                            if (total === 0) return null;
                                            
                                            const percentage = (item.total / total) * 100;
                                            
                                            // Calcular el ángulo para cada segmento
                                            const prevSum = arr.slice(0, index).reduce((sum, i) => sum + i.total, 0);
                                            const startAngle = (prevSum / total) * 360;
                                            const endAngle = startAngle + (percentage / 100) * 360;
                                            
                                            // Convertir a radianes
                                            const startRad = (startAngle - 90) * Math.PI / 180;
                                            const endRad = (endAngle - 90) * Math.PI / 180;
                                            
                                            // Calcular puntos del arco
                                            const x1 = 100 + 90 * Math.cos(startRad);
                                            const y1 = 100 + 90 * Math.sin(startRad);
                                            const x2 = 100 + 90 * Math.cos(endRad);
                                            const y2 = 100 + 90 * Math.sin(endRad);
                                            
                                            const largeArc = percentage > 50 ? 1 : 0;
                                            
                                            const colors = ['#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'];
                                            
                                            return (
                                                <g key={index}>
                                                    <path
                                                        d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                                        fill={colors[index % colors.length]}
                                                        stroke="white"
                                                        strokeWidth="2"
                                                    />
                                                </g>
                                            );
                                        })}
                                        {/* Etiquetas de porcentaje */}
                                        {metrics.beneficiariosPorPais.map((item, index, arr) => {
                                            const total = arr.reduce((sum, i) => sum + i.total, 0);
                                            if (total === 0) return null;
                                            
                                            const percentage = (item.total / total) * 100;
                                            const prevSum = arr.slice(0, index).reduce((sum, i) => sum + i.total, 0);
                                            const middleAngle = ((prevSum + item.total / 2) / total) * 360 - 90;
                                            const midRad = middleAngle * Math.PI / 180;
                                            const labelX = 100 + 60 * Math.cos(midRad);
                                            const labelY = 100 + 60 * Math.sin(midRad);
                                            
                                            return (
                                                <text
                                                    key={`label-${index}`}
                                                    x={labelX}
                                                    y={labelY}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    fill="white"
                                                    fontSize="12"
                                                    fontWeight="bold"
                                                >
                                                    {item.pais}: {percentage.toFixed(0)}%
                                                </text>
                                            );
                                        })}
                                    </svg>
                                </div>
                                
                                {/* Detalle por país */}
                                <div className={styles.detailContainer}>
                                    <h3 className={styles.detailTitle}>Detalle por país</h3>
                                    <div className={styles.detailList}>
                                        {metrics.beneficiariosPorPais.map((item, index) => {
                                            const colors = ['#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'];
                                            return (
                                                <div key={index} className={styles.detailItem}>
                                                    <div className={styles.detailRow}>
                                                        <div
                                                            className={styles.detailColor}
                                                            style={{ backgroundColor: colors[index % colors.length] }}
                                                        />
                                                        <span className={styles.detailLabel}>{item.pais}</span>
                                                    </div>
                                                    <span className={styles.detailValue}>{item.total}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            ) : (
                                <p className={styles.noData}>No hay datos disponibles</p>
                            )}
                        </div>
                    </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Dashboard;
