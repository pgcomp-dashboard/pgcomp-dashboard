import { List, ListItem, Pagination } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import React, { useEffect, useState } from "react";
import { useLocation, useMatch,  useSearchParams } from "react-router-dom";
import { api } from "../../services/api";
import styles from "./UserProductions.module.css"
import EditProductionDialog from "./EditProductionDialog";

export interface ProductionProps {
  id: number,
  title: string,
  year: number,
  publisher_id: number,
  publisher_type: string,
  publisher: {
    name: string
  }
  name: string,
  doi: string,
  last_qualis: string,
  handleOpen: (production: ProductionProps) => void
}



export default function UserProductions(){
  const [productions, setProductions] = useState<ProductionProps[]>([]);
  const [selectedProduction, setSelectedProduction] = useState<ProductionProps>({id: 0, title: "", year: 0, publisher_id: 0, publisher_type: "", publisher: {name: ""}, name: "", doi: "", last_qualis: "", handleOpen: () => {}})
  const [totalPages, setTotalPage] = useState(0)
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false)
  const {pathname} = useLocation()
  const match = useMatch(":userType/*")

  const handleOpenEdit = (production : ProductionProps) => {
    setSelectedProduction(production);
    setModalOpen(true);
  }

  const userType = {
    "professors" : "docente",
    "students" : "discente"
  }

  type UserKey = keyof typeof userType

  useEffect(() => {
    api.get(pathname, {params: { page: searchParams.get('page')}}).then(response => {
      setProductions(response.data.data)
      setTotalPage(response.data.last_page)
    });
  }, [pathname, searchParams])

  return (
    <div className={styles['session']}>
      <h4>Publicações do {userType[match?.params.userType as UserKey]}</h4>
      <List>
        {productions.map(item => (
            <ProductionDetails key={item.id} {...item} handleOpen={handleOpenEdit}/>
        ))}
      </List>
      <Pagination
        className={styles['pagination']}
        count={totalPages}
        defaultPage={1}
        page={Number(searchParams.get("page"))}
        onChange={(_,v) => setSearchParams({page: `${v}`})}
      />
      <EditProductionDialog
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
         production={selectedProduction}
        />
    </div>
  )
}

function ProductionDetails(props: ProductionProps){
  const iconsStyle = {
    height: '30px',
    width: '35px',
    cursor: 'pointer'
  }

  return (
    <ListItem className={styles['item']} >
      <div className={styles['details']}>
        <p>{props.title}</p>
        <p>Autores: {props.name} </p>
        <p>Doi:{props.doi}</p>
        <p>Nota Qualis: {props.last_qualis}</p>
        <p>Publicação: {props.publisher?.name}</p>
      </div>
      <EditIcon style={iconsStyle} onClick={() => props.handleOpen(props)}/>
    </ListItem>
  )
}

