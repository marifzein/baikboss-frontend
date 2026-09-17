/**
 * Icon mapping — single source of truth for all icons in the app.
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
  Bell,
  User,
  Search,
  LogOut,
  Wallet,
  Ticket,
  Gift,
  Globe,
  Shield,
  Settings,
  Phone,
  ChevronRight,
  Sparkles,
  Truck,
  Wrench,
  Hammer,
  Droplets,
  ShoppingBag,
  Clock,
  Calendar,
  StickyNote,
  UserRound,
  Trash2,
  Pencil,
  Plus,
  MapPinned,
  Smile,
  Sun,
  Moon,
  Sunset,
  Sparkle,
  Dices,
  Hand,
  HandMetal,
  CircleDashed,
} from 'lucide-react';

/* ---------- navigation icons ---------- */
export const NAV_ICONS = {
  home: Home,
  layanan: Search,
  pesanan: ClipboardList,
  pesan: MessageCircle,
  profil: UserRound,
};

/* ---------- 4 layanan dashboard ---------- */
export const SERVICE_ICONS = {
  bossmove: Truck,
  bossglow: Sparkles,
  bossclean: Droplets,
  bossfix: Hammer,
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
  pin: MapPinned,
  destination: Target,
  whatsapp: MessageCircle,
  success: CheckCircle,
  party: PartyPopper,
  faq: HelpCircle,
  alert: CircleAlert,
  bell: Bell,
  user: User,
  logout: LogOut,
  wallet: Wallet,
  voucher: Ticket,
  gift: Gift,
  globe: Globe,
  shield: Shield,
  settings: Settings,
  phone: Phone,
  chev: ChevronRight,
  package: Package,
  clock: Clock,
  calendar: Calendar,
  note: StickyNote,
  trash: Trash2,
  pencil: Pencil,
  plus: Plus,
  smile: Smile,
  sun: Sun,
  moon: Moon,
  sunset: Sunset,
  bag: ShoppingBag,
  wrench: Wrench,
  sparkle: Sparkle,
  dices: Dices,
  hand: Hand,
  moon: Moon,
  sun: Sun,
  circleDashed: CircleDashed,
};

/* ---------- lookup helpers ---------- */

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
  truck: Truck,
  sparkles: Sparkles,
  droplets: Droplets,
  hammer: Hammer,
  bell: Bell,
  user: User,
  'map-pin': MapPin,
  wrench: Wrench,
  'shopping-bag': ShoppingBag,
};

/** Render helper — returns a React element or null */
export function Icon({ name, size = 18, className = '' }) {
  const Comp = iconMap[name];
  if (!Comp) return null;
  return <Comp size={size} className={className} strokeWidth={2} />;
}
