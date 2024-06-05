import styles from './Title.module.css'
//TODO: Adicionar um get na url 'dashboard/program'
//{
//  "sigla": "PGCOMP/IC",
//  "nome": "Programa de pós-graduação em ciência da computação"
//}
function Title(props){
    return (
        <div className={styles.title__app}>
            {/* <h1>Programa de pós-graduação em ciência da computação</h1> */}
        </div>
    )
}

export default Title