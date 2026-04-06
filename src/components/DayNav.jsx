import styles from './DayNav.module.css';

export default function DayNav({ days, activeDay, checkedMap, onSelect }) {
  return (
    <nav className={styles.nav}>
      {days.map((d, i) => {
        const done = d.meals.every((_, mi) => checkedMap[`${i}-${mi}`]);
        const any = d.meals.some((_, mi) => checkedMap[`${i}-${mi}`]);
        return (
          <button
            key={i}
            className={[
              styles.btn,
              i === activeDay ? styles.active : '',
              d.type === 'training' ? styles.training : styles.rest,
              done ? styles.done : any ? styles.partial : '',
            ].join(' ')}
            onClick={() => onSelect(i)}
          >
            <span className={styles.short}>{d.short}</span>
            <span className={styles.num}>{i + 1}</span>
            <span className={styles.dot} />
          </button>
        );
      })}
    </nav>
  );
}
