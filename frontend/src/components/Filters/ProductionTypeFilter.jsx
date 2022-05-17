import { useState } from 'react';
import styles from './ProductionTypeFilter.module.css'

function ProductionTypeFilter({ setPublisherType }) {
    const [allClass, setAllClass] = useState('');
    const [journalClass, setJournalClass] = useState('');
    const [conferenceClass, setConferenceClass] = useState('');

    const addSelectedClass = (button) => {
        switch (button) {
            case 'all':
                if (allClass){
                    setAllClass('');
                } else {
                    setAllClass('selected');
                    setJournalClass('');
                    setConferenceClass('');
                }
                break;

            case 'journal':
                if (journalClass){
                    setJournalClass('');
                } else {
                    setJournalClass('selected');
                    setAllClass('');
                    setConferenceClass('');
                }
                break;

            case 'conference':
                if (conferenceClass){
                    setConferenceClass('');
                } else {
                    setConferenceClass('selected');
                    setJournalClass('');
                    setAllClass('');
                }
        }
    }

    return (
        <div className={styles['ProductionTypeFilter']}>

            <div className={styles['filter__title']}>Produções publicadas em:</div>
            <div className={styles['production__types']}>
                <span className={styles['production__type']} onClick={() => { setPublisherType(null); addSelectedClass('all'); }}>Tudo</span>
                <span className={styles['production__type']} onClick={() => { setPublisherType('journal'); addSelectedClass('journal'); }}>Revista</span>
                <span className={styles['production__type']} onClick={() => { setPublisherType('conference'); addSelectedClass('conference'); }}>Conferências</span>
            </div>

        </div>
    )
}

export default ProductionTypeFilter;