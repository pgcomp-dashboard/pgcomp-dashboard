import SessionsPanel from '../../components/SessionsPanel/SessionsPanel';
import styles from '../../App.module.css';
import React from 'react';
import { Outlet } from 'react-router-dom';


function AdminPanel() {

  return (
    <div className={styles['admin__panel']}>
      <h1> Painel de administração </h1>
      <div className={styles['admin__panel__board']}>
        <SessionsPanel />
        <Outlet />
      </div>
    </div>
  );
}

export default AdminPanel;