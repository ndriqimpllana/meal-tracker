import styles from './MealCard.module.css';

export default function MealCard({ meal, checked, onToggle }) {
  return (
    <div
      className={[styles.card, checked ? styles.checked : ''].join(' ')}
      onClick={onToggle}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={e => e.key === ' ' && onToggle()}
    >
      <div className={styles.circle}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
            stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1.5,5 4,7.5 8.5,2.5" />
          </svg>
        )}
      </div>
      <div className={styles.info}>
        <div className={styles.slot}>{meal.slot}</div>
        <div className={styles.name}>{meal.name}</div>
        <div className={styles.macros}>{meal.macros}</div>
      </div>
    </div>
  );
}
