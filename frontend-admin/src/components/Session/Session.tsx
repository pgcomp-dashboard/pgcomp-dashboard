/* Material UI Imports */

import Backdrop from '@mui/material/Backdrop';
import List from '@mui/material/List';
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';

import { useState, useEffect, useContext } from 'react';
import AddSessionItemButton from '../AddSessionItemButton/AddSessionItemButton';
import SessionItemDialog from '../SessionItemDialog/SessionItemDialog';
import SessionItem from '../SessionItem/SessionItem';
import styles from './Session.module.css';
import Utils from '../../Utils.js';
import { AuthContext } from '../../providers/AuthProvider';
import React from 'react';
import { api } from '../../services/api';
import { useMatch, useSearchParams, useNavigate } from 'react-router-dom';
import SearchInput from '../SearchInput/SearchInput';

// interface SessionProps {
//     type?: string;
// }

function Session() {
  const [ modalOpened, setModalOpened ] = useState(false);
  const { change } = useContext(AuthContext);
  const [ totalPages, setTotalPage ] = useState(0);
  const [ searchParams, setSearchParams ] = useSearchParams();
  const [ loading, setLoading ] = useState(false);

  const [ sessionItems, setSessionItems ] = useState([]);

  const match = useMatch('/admin/:sessionType/*');
  const sessionType = match?.params.sessionType || 'areas';

  const showAdd = sessionType === 'areas';

  //Verifica se a sessão é uma lista de docentes/discentes para mostrar o campo de busca e alterar os parâmetros da requisição
  const isUsersListSession = sessionType === 'students' || sessionType === 'professors'; 
  const usersListParams = isUsersListSession ? {
    'filters[0][field]': searchParams.get('name') && 'name',
    'filters[0][value]': searchParams.get('name'), 
    order_by: 'name',  
  } : null;

  const history = useNavigate();
  const handleModalOpen = () => {
    setModalOpened(true);
  };

  const handleModalClose = () => {
    setModalOpened(false);
  };

  const getData = () => {
    api.get(
      (sessionType === 'areas' ? 'all_subareas_per_area' : sessionType),
      { params: {
        page: searchParams.get('page'),
        ...usersListParams,
      } },
    ).then((response: any) => {
      if (response && response.status === 200) {
        setSessionItems(response.data.data ? response.data.data : response.data);
        setTotalPage(response.data.last_page);
        setLoading(false);
      }
    })

      .catch((error) => {

        if(error.response.status === 500){
          history('/erro');
          console.log(error);
        } else if(error.response.status === 404){
          history('/erro');
          console.log(error);
        } else{
          console.log(error);
        }
            
      });
  };

  function handlePagination(_ : React.ChangeEvent<unknown>, value : number){
    //Primeiro eta o parâmetro de página para não sobrepor outros parâmetros de busca e depois atualiza
    searchParams.set('page', String(value));
    setSearchParams(searchParams);
  }

  useEffect(() => {
    setLoading(true);
    setSessionItems([]);
    getData();
  }, [ sessionType, searchParams ]);


  useEffect(() => {
    setTimeout(() => {
      getData();
    }, 1000);
  }, [ change ]);
    
  return (
    <div className={styles['Session']}>
      {showAdd ? <AddSessionItemButton type={Utils.nameTypes[sessionType]} handleOpen={handleModalOpen} /> : null}
      {isUsersListSession ? <SearchInput /> : null}
      {loading ? <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop> : null}
      <List disablePadding>
        {sessionItems && sessionItems.length ?
          sessionItems.map((sessionItem: any) => {
            return <SessionItem {...sessionItem} 
              type={sessionType} 
              children={sessionType === 'areas' ? sessionItem.subarea : []} 
              key={sessionItem.id} />;
          }) : null}
      </List>
      <Pagination
        className={styles['pagination']}
        count={totalPages}
        defaultPage={1}
        page={Number(searchParams.get('page')) || 1}
        onChange={handlePagination}
      />



      <SessionItemDialog type={Utils.nameTypes[sessionType]} typeAttr={sessionType} open={modalOpened} handleClose={handleModalClose} />
    </div>
  );
}

export default Session;
