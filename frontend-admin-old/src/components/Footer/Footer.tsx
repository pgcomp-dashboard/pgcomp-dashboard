import styles from "./Footer.module.css";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import React from 'react';
import { grey } from "@mui/material/colors";

function Footer() {
  return (
    <footer className={styles.footer__ufba}>
      <div className={styles.footer__left}>
        <h2>Universidade Federal da Bahia</h2>
        <h5>Avenida Milton Santos, s\n - Campus de Ondina, PAF 2 <br /> CEP: 40.170-110 Salvador-Bahia </h5>
        <h3><a href="https://www.ufba.br" target="__blank">Site Oficial</a>  |  <a href="https://www.ufba.br/contatos" target="__blank">Contato</a> |  <a href="https://www.ufba.br/historico" target="__blank">Sobre a UFBA </a></h3>
      </div>

      <div className={styles.footer__right}>
        <h2>
          <a href='https://www.linkedin.com/school/ufba/?originalSubdomain=br' target="__blanck"><LinkedInIcon sx={{ color: grey[50] }} fontSize="large" /></a>{" "}
          <a href='https://pt-br.facebook.com/pages/category/Specialty-School/Universidade-Federal-da-Bahia-UFBA-231509166876211/' target="__blanck"><FacebookIcon sx={{ color: grey[50] }} fontSize="large" /></a>{" "}
          <a href='https://twitter.com/ufba?lang=en' target="__blanck"><TwitterIcon sx={{ color: grey[50] }}  fontSize="large" /></a>
        </h2>
      </div>
    </footer>
  );
}

export default Footer;
