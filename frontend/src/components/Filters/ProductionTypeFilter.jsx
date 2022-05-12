import styles from './ProductionTypeFilter.module.css'

function ProductionTypeFilter({ setPublisherType }) {
    return (
        <div className={styles['ProductionTypeFilter']}>

            <div className={styles['filter__title']}>Produções publicadas em:</div>
            <div className={styles['production__types']}>
                <span className={styles['production__type']} onClick={() => setPublisherType(null)}>Tudo</span>
                <span className={styles['production__type']} onClick={() => setPublisherType('journal')}>Revista</span>
                <span className={styles['production__type']} onClick={() => setPublisherType('conference')}>Conferências</span>
            </div>

        </div>
    )
}

export default ProductionTypeFilter;