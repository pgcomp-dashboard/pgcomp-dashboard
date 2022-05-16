import styles from "./Footer.module.css";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import React from 'react';

function Footer() {
  return (
    <div className={styles.footer__ufba}>
      <div className={styles.footer__left}>
        <h2>Universidade Federal da Bahia</h2>
        <h5>
          Avenida Milton Santos, s\n - Campus de Ondina, PAF 2 <br /> CEP:
          40.170-110 Salvador-Bahia{" "}
        </h5>

        <h3>Site Oficial | Contato | Sobre a UFBA</h3>
      </div>

      <div className={styles.footer__right}>
        <h2>
          <LinkedInIcon color="primary" fontSize="large" />{" "}
          <FacebookIcon color="primary" fontSize="large" />{" "}
          <TwitterIcon color="primary" fontSize="large" />
        </h2>
      </div>
    </div>
  );
}

export default Footer;
