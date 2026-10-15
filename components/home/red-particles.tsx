import type { CSSProperties } from 'react';
import styles from './red-particles.module.css';

// Stable positions keep server rendering and hydration identical.
export function RedParticles() {
  return <div className={styles.field} aria-hidden="true">
    {Array.from({ length: 64 }, (_, i) => <span key={i} style={{
      '--x': `${(i * 47.31) % 100}%`,
      '--y': `${(i * 31.73) % 100}%`,
      '--size': `${2 + i % 4}px`,
      '--duration': `${18 + i % 13}s`,
      '--delay': `${-i * 1.7}s`,
      '--drift': `${i % 2 ? 30 : -30}px`,
    } as CSSProperties} />)}
  </div>;
}
