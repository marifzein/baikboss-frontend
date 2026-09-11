import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const icon = L.divIcon({
  className: 'bb-pin',
  html: '<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:#7c2ae8;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>',
  iconSize: [26, 26],
  iconAnchor: [13, 30],
});

function ClickCatcher({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({ lat, lng, onPick, height = 220 }) {
  const hasPin = lat != null && lng != null;
  const center = hasPin ? [lat, lng] : [-7.1509, 111.8816]; // pusat Bojonegoro

  useEffect(() => {
    // refresh ukuran peta saat mount/ubah
    window.dispatchEvent(new Event('resize'));
  }, [lat, lng]);

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={hasPin ? 16 : 12}
        style={{ height }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickCatcher onPick={onPick} />
        {hasPin && <Marker position={[lat, lng]} icon={icon} />}
      </MapContainer>
    </div>
  );
}
