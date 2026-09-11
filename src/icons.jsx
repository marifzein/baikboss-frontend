/**
 * Icon mapping — single source of truth for all icons in the app.
 * Every emoji that appeared in the original design is now a Lucide icon.
 */

import {
  Home,
  ClipboardList,
  HelpCircle,
  MessageCircle,
  MapPin,
  Navigation,
  Target,
  ArrowLeft,
  CheckCircle,
  PartyPopper,
  DoorOpen,
  Armchair,
  Sofa,
  Snowflake,
  Monitor,
  WashingMachine,
  Package,
  CircleAlert,
} from 'lucide-react';

/* ---------- navigation icons ---------- */
export const NAV_ICONS = {
  home: Home,
  tarif: ClipboardList,
  faq: HelpCircle,
};

/* ---------- services (pindahan types) ---------- */
export const SERVICE_ICONS = {
  rumah: Home,
  kos: Sofa,
  warung: Package,
  kantor: ClipboardList,
};

/* ---------- barang / items ---------- */
export const ITEM_ICONS = {
  lemari: DoorOpen,
  meja: Armchair,
  kursi: Sofa,
  kulkas: Snowflake,
  mesin_cuci: WashingMachine,
  tv: Monitor,
  ac: Snowflake,
};

/* ---------- misc / single-use ---------- */
export const ICON = {
  back: ArrowLeft,
  gps: Navigation,
  location: MapPin,
  destination: Target,
  whatsapp: MessageCircle,
  success: CheckCircle,
  party: PartyPopper,
  faq: HelpCircle,
  alert: CircleAlert,
};

/* ---------- lookup helpers ---------- */

/** Map a kebab-case icon name (from backend) to a Lucide component */
const iconMap = {
  home: Home,
  clipboard: ClipboardList,
  'clipboard-list': ClipboardList,
  help: HelpCircle,
  sofa: Sofa,
  package: Package,
  'door-open': DoorOpen,
  armchair: Armchair,
  snowflake: Snowflake,
  'washing-machine': WashingMachine,
  monitor: Monitor,
};

/** Render helper — returns a React element or null */
export function Icon({ name, size = 18, className = '' }) {
  const Comp = iconMap[name];
  if (!Comp) return null;
  return <Comp size={size} className={className} strokeWidth={2} />;
}
