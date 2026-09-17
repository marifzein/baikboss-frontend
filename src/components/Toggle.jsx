/** Toggle switch (gaya "Jadikan alamat utama" di skrinsut) */
export default function Toggle({ checked, onChange, label, sub }) {
  return (
    <div className="toggle-row">
      <div>
        <div className="t-title">{label}</div>
        {sub && <div className="t-sub">{sub}</div>}
      </div>
      <label className="switch">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="track" />
      </label>
    </div>
  );
}
