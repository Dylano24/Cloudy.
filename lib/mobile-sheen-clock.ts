export function createMobileSheenClock() {
  let previous: number | null = null;
  let elapsed = 0;
  const intervals: number[] = [];
  return {
    step(now: number) {
      if (previous !== null) {
        const delta = Math.max(0, now - previous);
        if (delta > 0 && delta <= 50) {
          intervals.push(delta);
          if (intervals.length > 12) intervals.shift();
        }
        const sorted = [...intervals].sort((a, b) => a - b);
        const typicalFrame = sorted[Math.floor(sorted.length / 2)] ?? 1000 / 60;
        // Do not catch up in one large jump after a late frame. The median
        // adapts to normal 30/60/120 Hz rendering without learning one spike.
        elapsed = (elapsed + Math.min(delta, typicalFrame * 1.1)) % 6000;
      }
      previous = now;
      return (elapsed % 6000) / 6000;
    },
    pause() { previous = null; },
  };
}
