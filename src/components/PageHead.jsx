import { useNavigate } from 'react-router-dom';
import { ICON } from '../icons.jsx';

/** Header sub-halaman: tombol back + judul (gaya skrinsut "Tambah Alamat") */
export default function PageHead({ title, right = null, onBack = null }) {
  const navigate = useNavigate();
  const Back = ICON.back;

  return (
    <div className="subhead">
      <button className="back" aria-label="Kembali" onClick={() => (onBack ? onBack() : navigate(-1))}>
        <Back size={20} />
      </button>
      <h2 style={{ flex: 1 }}>{title}</h2>
      {right}
    </div>
  );
}
