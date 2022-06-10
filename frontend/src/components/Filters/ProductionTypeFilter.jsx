import { useState } from 'react';
import styles from './ProductionTypeFilter.module.css';
import { Tooltip } from '@mui/material';


//Pega o botao do filtro de publicações clicado e altera para selecionado, retornando o setPublisherType com a opção selecionada e estilizando na cor verde
function ProductionTypeFilter({ setPublisherType }) {
    const [allClass, setAllClass] = useState(styles['selected']);
    const [journalClass, setJournalClass] = useState('');
    const [conferenceClass, setConferenceClass] = useState('');


    const addSelectedClass = (button) => {
        switch (button) {
            case 'all':
                if (allClass) {
                    setAllClass('');
                } else {
                    setAllClass(styles['selected']);
                    setJournalClass('');
                    setConferenceClass('');
                }
                break;

            case 'journal':
                if (journalClass) {
                    setJournalClass('');
                } else {
                    setJournalClass(styles['selected']);
                    setAllClass('');
                    setConferenceClass('');
                }
                break;

            case 'conference':
                if (conferenceClass) {
                    setConferenceClass('');
                } else {
                    setConferenceClass(styles['selected']);
                    setJournalClass('');
                    setAllClass('');
                }
        }
    }

    return (
        <div className={styles['ProductionTypeFilter']}>

            <div className={styles['filter__title']}>Produções publicadas em:</div>
            <div className={styles['production__types']}>
                <Tooltip title="Clique sobre o item para filtrar"><span className={styles['production__type'] + ' ' + allClass} onClick={() => { setPublisherType(null); addSelectedClass('all'); }}>Tudo</span></Tooltip>
                <Tooltip title="Clique sobre o item para filtrar"><span className={styles['production__type'] + ' ' + journalClass} onClick={() => { setPublisherType('journal'); addSelectedClass('journal'); }}>Revista</span></Tooltip>
                <Tooltip title="Clique sobre o item para filtrar"><span className={styles['production__type'] + ' ' + conferenceClass} onClick={() => { setPublisherType('conference'); addSelectedClass('conference'); }}>Conferências</span></Tooltip>
            </div>

        </div>
    )
}

export default ProductionTypeFilter;