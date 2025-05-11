/* Material UI Imports */


import { useState, useEffect } from 'react';
import styles from './ProfessorPanel.module.css';
import { AuthContext } from '../../providers/AuthProvider';
import { useNavigate } from 'react-router';
import { professorMock, Professor } from './ProfessorMock';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupIcon from '@mui/icons-material/Group';

const ProfessorPanel = () => {
  const [ professores, setProfessores ] = useState<Professor[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setProfessores(professorMock);
  }, []);

  const verProducoes = (id: number) => {
    navigate(`/admin/professors/${id}/productions`);
  };

  const verDetalhes = (id: number) => {
    navigate(`/admin/professors/${id}`);
  };

  return (
    <div className={styles.container}>
      <p className={styles.subtitulo}>Docentes</p>
      <div className={styles.lista}>
        {professores.map((professor) => (
          <div key={professor.id} className={styles.docente}>
            <span className={styles.nome}>{professor.nome}</span>
            <div className={styles.icones}>
              <DescriptionIcon
                className={styles.icone}
                titleAccess="Ver Produções"
                onClick={() => verProducoes(professor.id)}
              />
              <GroupIcon
                className={styles.icone}
                titleAccess="Detalhes do Docente"
                onClick={() => verDetalhes(professor.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfessorPanel;