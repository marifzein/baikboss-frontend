/** Indikator step wizard (4 titik progres) */
export default function Steps({ current, total = 4 }) {
  return (
    <div className="steps">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`dot${i < current ? ' on' : ''}`} />
      ))}
    </div>
  );
}
