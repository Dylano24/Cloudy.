'use client';

import { Children, useRef, useState, type ReactNode } from 'react';
import styles from './game-carousel.module.css';

export function GameCarousel({ children, trackClassName, labels, ariaLabel = 'Cloudy games' }: { children: ReactNode; trackClassName?: string; labels?: readonly string[]; ariaLabel?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [active, setActive] = useState(0);
  const slides = Children.toArray(children);

  function slidePositions(element: HTMLDivElement) {
    const cards = Array.from(element.children) as HTMLElement[];
    const first = cards[0]?.offsetLeft ?? 0;
    const maxScroll = Math.max(0, element.scrollWidth - element.clientWidth);
    return cards.map(card => Math.min(card.offsetLeft - first, maxScroll));
  }

  function nearestSlide(element: HTMLDivElement) {
    const positions = slidePositions(element);
    return positions.reduce((best, position, index) =>
      Math.abs(position - element.scrollLeft) < Math.abs(positions[best] - element.scrollLeft) ? index : best, 0);
  }

  function select(index: number) {
    const element = track.current;
    if (!element) return;
    const positions = slidePositions(element);
    if (!positions.length) return;
    const next = Math.max(0, Math.min(index, positions.length - 1));
    element.scrollTo({
      left: positions[next],
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
    setActive(next);
  }

  return (
    <div className={styles.carousel}>
      <div
        ref={track}
        className={`cloudy-classic-game-grid ${styles.track} ${trackClassName ?? ''}`}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={event => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            select(active + (event.key === 'ArrowRight' ? 1 : -1));
          }
        }}
        onScroll={event => setActive(nearestSlide(event.currentTarget))}
        onDragStart={event => event.preventDefault()}
        onPointerDown={event => {
          if (event.pointerType !== 'mouse' || event.button !== 0) return;
          suppressClick.current = false;
          drag.current = { x: event.clientX, left: event.currentTarget.scrollLeft, moved: false };
        }}
        onPointerMove={event => {
          const gesture = drag.current;
          if (!gesture) return;
          if (!(event.buttons & 1)) {
            drag.current = null;
            event.currentTarget.style.scrollSnapType = '';
            return;
          }
          const distance = event.clientX - gesture.x;
          if (Math.abs(distance) <= 6 && !gesture.moved) return;
          gesture.moved = true;
          suppressClick.current = true;
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.setPointerCapture(event.pointerId);
          }
          event.currentTarget.style.scrollSnapType = 'none';
          event.currentTarget.scrollLeft = gesture.left - distance;
        }}
        onPointerUp={event => {
          const gesture = drag.current;
          drag.current = null;
          event.currentTarget.style.scrollSnapType = '';
          if (gesture?.moved) select(nearestSlide(event.currentTarget));
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
        onPointerCancel={event => {
          drag.current = null;
          suppressClick.current = false;
          event.currentTarget.style.scrollSnapType = '';
        }}
        onClickCapture={event => {
          if (suppressClick.current) {
            event.preventDefault();
            event.stopPropagation();
            suppressClick.current = false;
          }
        }}
      >
        {children}
      </div>
      {slides.length > 1 && (
        <div className={styles.controls} aria-label="Game carousel controls">
          <button className={styles.arrow} type="button" aria-label="Previous game" disabled={active === 0} onClick={() => select(active - 1)}>‹</button>
          <div className={styles.dots} aria-label="Choose a game slide">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show ${labels?.[index] ?? (index === 0 ? 'Rust' : index === 1 ? 'Coming soon' : `slide ${index + 1}`)}`}
                aria-pressed={active === index}
                onClick={() => select(index)}
              />
            ))}
          </div>
          <button className={styles.arrow} type="button" aria-label="Next game" disabled={active === slides.length - 1} onClick={() => select(active + 1)}>›</button>
        </div>
      )}
    </div>
  );
}
