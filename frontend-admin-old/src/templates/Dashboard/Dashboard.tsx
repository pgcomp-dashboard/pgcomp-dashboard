import { Toolbar, Footer } from "../../components";

import styles from "./Dashboard.module.css";

interface Props {
  children: any
}

function DashboardTemplate(props: Props) {
  const { children } = props;

  return (
    <div className={styles.dashboard_template_container}>
      <Toolbar />

      <main className={styles.dashboard_template__main}>
        <div className={styles.dashboard_template__main__box}>{children}</div>
      </main>

      <Footer />
    </div>
  );
}

export default DashboardTemplate;
