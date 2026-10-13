'use client';

import { useRef, useState, type ReactNode } from 'react';
import styles from './game-carousel.module.css';

export function GameCarousel({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [active, setActive] = useState(0);
  function select(index: number) {
    const element = track.current;
    if (!element) return;
    element.scrollTo({ left: (element.children[index] as HTMLElement).offsetLeft - (element.children[0] as HTMLElement).offsetLeft, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  return (
    <div className={styles.carousel}>
      <div ref={track} className={`cloudy-classic-game-grid ${styles.track}`} aria-label="Cloudy games" role="region"
        onScroll={() => {
          const element = track.current;
          if (!element) return;
          const step = (element.children[1] as HTMLElement).offsetLeft - (element.children[0] as HTMLElement).offsetLeft;
          setActive(Math.round(element.scrollLeft / step));
        }}
        onDragStart={event => event.preventDefault()}
        onPointerDown={event => {
          suppressClick.current = false;
          if (event.pointerType === 'mouse' && event.button === 0) drag.current = { x: event.clientX, left: event.currentTarget.scrollLeft, moved: false };
        }}
        onPointerMove={event => {
          const start = drag.current;
          if (!start) return;
          const distance = event.clientX - start.x;
          if (Math.abs(distance) > 6) {
            start.moved = true;
            suppressClick.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            event.currentTarget.style.scrollSnapType = 'none';
            event.currentTarget.scrollLeft = start.left - distance;
          }
        }}
        onPointerUp={event => {
          const start = drag.current;
          drag.current = null;
          event.currentTarget.style.scrollSnapType = '';
          if (start?.moved) select(Math.round(event.currentTarget.scrollLeft / (event.currentTarget.clientWidth + 18)));
        }}
        onPointerCancel={event => { drag.current = null; event.currentTarget.style.scrollSnapType = ''; }}
        onClickCapture={event => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}>
        {children}
      </div>
      <div className={styles.dots} aria-label="Choose a game slide">
        {['Rust', 'Coming soon'].map((label, index) => <button key={label} type="button" aria-label={`Show ${label}`} aria-pressed={active === index} onClick={() => select(index)} />)}
      </div>
    </div>
  );
}
