import type { Insight } from '@/lib/bot-dashboard/bot-api';
import styles from './bot.module.css';

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

function cell(value: string) {
  if (ISO.test(value)) {
    const date = new Date(value);
    return <time dateTime={value}>{date.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam' })}</time>;
  }
  return value;
}

/** Live, read-only data from Cloudy for modules that are run from Discord. */
export function InsightView({ insight }: { insight: Insight }) {
  const stats = insight.stats.filter(stat => stat.value !== '');
  return (
    <div className={styles.stack}>
      {stats.length ? (
        <div className={styles.insightStats}>
          {stats.map(stat => (
            <div key={stat.label} className={`${styles.panel} ${styles.tile}`}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      ) : null}
      {insight.tables.map(table => (
        <section key={table.title} className={`${styles.panel} ${styles.card}`} aria-label={table.title}>
          <header className={styles.cardHead}><h2>{table.title}</h2></header>
          {table.rows.length ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr>{table.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
                <tbody>
                  {table.rows.map((row, index) => (
                    <tr key={index}>{row.map((value, column) => <td key={column}>{cell(value)}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className={styles.emptyRow}>{table.empty}</p>}
        </section>
      ))}
    </div>
  );
}
