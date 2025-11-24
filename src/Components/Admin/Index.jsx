import CrudEncargados from "./CrudEncargados/Index";
import CrudComedores from "./CrudComedores/Index";
import Header from "../Header/Index";
import styles from "./Admin.module.css";

const Admin = () => {
    return (
        <>
            <Header />
            <div className={styles.adminContainer}>
                <h2>Panel de Administración</h2>

                <section className={styles.adminSection}>
                    <h3>Gestión de Encargados</h3>
                    <CrudEncargados />
                </section>

                <section className={styles.adminSection}>
                    <h3>Gestión de Comedores</h3>
                    <CrudComedores />
                </section>
            </div>
        </>
    );
};

export default Admin;
