import { useState } from 'react';
import { DAYS, TOTAL_MEALS } from './data/days';
import { useStorage } from './hooks/useStorage';
import DayNav from './components/DayNav';
import MealCard from './components/MealCard';
import './index.css';
import styles from './App.module.css';

export default function App() {
  const today = new Date().getDay(); // 0=Sun
  const dayMap = [6, 0, 1, 2, 3, 4, 5]; // map JS day to our index
  const [activeDay, setActiveDay] = useState(dayMap[today]);
  const [checked, setChecked] = useStorage('mealChecked', {});

  const toggleMeal = (dayIdx, mealIdx) => {
    const key = `${dayIdx}-${mealIdx}`;
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetAll = () => {
    if (window.confirm('Reset all meal checks for the week?')) setChecked({});
  };

  const totalDone = Object.values(checked).filter(Boolean).length;
  const weekPct = Math.round((totalDone / TOTAL_MEALS) * 100);

  const day = DAYS[activeDay];
  const dayDone = day.meals.filter((_, i) => checked[`${activeDay}-${i}`]).length;
  const dayPct = Math.round((dayDone / day.meals.length) * 100);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <p className={styles.appLabel}>Meal Tracker</p>
            <h1 className={styles.title}>Your plan<br />82 kg · recomp</h1>
          </div>
          <button className={styles.resetBtn} onClick={resetAll}>Reset week</button>
        </div>
        <div className={styles.progressRow}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${weekPct}%` }} />
          </div>
          <span className={styles.progressText}>{totalDone} / {TOTAL_MEALS} meals</span>
        </div>
      </header>

      <DayNav days={DAYS} activeDay={activeDay} checkedMap={checked} onSelect={setActiveDay} />

      <section>
        <div className={styles.dayHeader}>
          <h2 className={styles.dayName}>{day.name}</h2>
          <span className={[styles.badge, day.type === 'training' ? styles.badgeTrain : styles.badgeRest].join(' ')}>
            {day.type === 'training' ? 'TRAINING' : 'REST'}
          </span>
        </div>

        <div className={styles.macroStrip}>
          {[
            { val: day.cal, lbl: 'Calories' },
            { val: `${day.protein}g`, lbl: 'Protein' },
            { val: `${day.carbs}g`, lbl: 'Carbs' },
          ].map(({ val, lbl }) => (
            <div key={lbl} className={styles.macroBox}>
              <div className={styles.macroVal}>{val}</div>
              <div className={styles.macroLbl}>{lbl}</div>
            </div>
          ))}
        </div>

        <div className={styles.mealsList}>
          {day.meals
            .map((meal, i) => ({ meal, i }))
            .filter(({ i }) => !checked[`${activeDay}-${i}`])
            .map(({ meal, i }) => (
              <MealCard
                key={i}
                meal={meal}
                checked={false}
                onToggle={() => toggleMeal(activeDay, i)}
              />
            ))}
        </div>

        <div className={styles.daySummary}>
          <p className={styles.summaryLabel}>Day progress</p>
          <div className={styles.summaryBar}>
            <div className={styles.summaryFill} style={{ width: `${dayPct}%` }} />
          </div>
          <p className={styles.summaryCount}>
            <strong>{dayDone}</strong> of <strong>{day.meals.length}</strong> meals eaten
          </p>
        </div>

        {day.note && <div className={styles.noteBox}>{day.note}</div>}
      </section>
    </div>
  );
}
