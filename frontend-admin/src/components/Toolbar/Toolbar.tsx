import styles from "./Toolbar.module.css";
import icLogo from "../../assets/ic_logo.png";

function Toolbar() {
  return (
    <div className={styles.nav__toolbar}>
      <div>
        <img alt="Logo" src={icLogo} height={70} />
      </div>
    </div>
  );
}

export default Toolbar;
