const units = ['Days', 'Hours', 'Minutes', 'Seconds'] as const;

export function WipeCountdown() {
  return (
    <div className="cloudy-wipe-timer" aria-label="Wipe schedule not set">
      {units.map((label) => (
        <div className="cloudy-wipe-unit" key={label}>
          <strong>—</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
