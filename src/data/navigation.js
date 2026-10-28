import {
  LayoutDashboard,
  Tractor,
  MapPinned,
  Sprout,
  ClipboardList,
  CalendarDays,
  Wallet,
  PackageCheck,
  Bell,
  Settings,
} from 'lucide-react';

export const navigation = [
  {
    section: 'WORKSPACE',
    items: [
      { label: 'Overview', icon: LayoutDashboard },
      { label: 'Farms', icon: Tractor },
      { label: 'Fields', icon: MapPinned },
      { label: 'Crop management', icon: Sprout, badge: '4' },
      { label: 'Activities', icon: ClipboardList },
      { label: 'Calendar', icon: CalendarDays, dot: true },
    ],
  },
  {
    section: 'INSIGHTS',
    items: [
      { label: 'Expenses', icon: Wallet },
      { label: 'Harvest records', icon: PackageCheck },
      { label: 'Notifications', icon: Bell, badge: '3' },
    ],
  },
];

export const initialCrops = [
  {
    name: 'Tomato',
    variety: 'Arka Rakshak',
    field: 'North Field',
    area: '1.2 acres',
    progress: 72,
    status: 'Growing',
    harvest: 'Nov 12, 2026',
    icon: '🍅',
    tone: 'tomato',
  },
  {
    name: 'Rice',
    variety: 'Ponni',
    field: 'Paddy Field A',
    area: '2.5 acres',
    progress: 48,
    status: 'Growing',
    harvest: 'Dec 04, 2026',
    icon: '🌾',
    tone: 'rice',
  },
  {
    name: 'Spinach',
    variety: 'Palak Green',
    field: 'Kitchen Garden',
    area: '0.4 acres',
    progress: 94,
    status: 'Ready soon',
    harvest: 'Oct 30, 2026',
    icon: '🥬',
    tone: 'spinach',
  },
  {
    name: 'Chilli',
    variety: 'Guntur Sannam',
    field: 'East Field',
    area: '0.8 acres',
    progress: 35,
    status: 'Growing',
    harvest: 'Jan 18, 2027',
    icon: '🌶️',
    tone: 'chilli',
  },
];

export const initialActivities = [
  {
    tone: 'blue',
    title: 'Morning irrigation completed',
    detail: 'North Field · Tomato',
    time: 'Today, 8:30 AM',
  },
  {
    tone: 'green',
    title: 'Fertilizer applied',
    detail: 'Paddy Field A · Rice',
    time: 'Yesterday, 4:15 PM',
  },
  {
    tone: 'gold',
    title: 'Harvest record added',
    detail: 'Kitchen Garden · Spinach',
    time: 'Oct 24, 11:20 AM',
  },
];

