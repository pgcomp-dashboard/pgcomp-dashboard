import styles from './Title.module.css'

function Title(props){
    return (
        <div className={styles.title__app}>
            <h1>Programa de pós-graduação em ciência da computação</h1>
        </div>
    )
}

export default Title