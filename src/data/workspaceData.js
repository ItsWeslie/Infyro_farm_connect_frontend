import {
  Tractor,
  MapPinned,
  Sprout,
  ClipboardList,
  Wallet,
  PackageCheck,
  CalendarDays,
  Bell,
  Settings,
} from 'lucide-react';
import { ExpenseCategory, HarvestUnit } from '../types/enums';

export const workspaceData = {
  Farms: {
    eyebrow: 'YOUR LAND, AT A GLANCE',
    title: 'Your farms',
    description: 'Every growing space, gathered in one place.',
    stats: [
      ['Total farms', '02', 'registered spaces'],
      ['Total land', '8.4 ac', 'across all farms'],
      ['Active fields', '04', 'being cultivated'],
      ['This season', 'Kharif', 'current cycle'],
    ],
    rows: [
      ['Green Valley Farm', 'Tambaram, Tamil Nadu', '5.6 acres', '4 fields', 'Active'],
      ['Sunrise Plot', 'Vandalur, Tamil Nadu', '2.8 acres', '2 fields', 'Active'],
    ],
  },
  Fields: {
    eyebrow: 'EVERY PATCH HAS POTENTIAL',
    title: 'Field directory',
    description: 'Understand your land and what is growing in it.',
    stats: [
      ['Total fields', '06', 'across your farms'],
      ['Cultivated', '4.9 ac', 'currently in use'],
      ['Available', '3.5 ac', 'ready to plan'],
      ['Soil checks', '02', 'recently recorded'],
    ],
    rows: [
      ['North Field', 'Green Valley Farm', '1.2 acres', 'Tomato', 'Growing'],
      ['Paddy Field A', 'Green Valley Farm', '2.5 acres', 'Rice', 'Growing'],
      ['Kitchen Garden', 'Green Valley Farm', '0.4 acres', 'Spinach', 'Ready soon'],
      ['East Field', 'Sunrise Plot', '0.8 acres', 'Chilli', 'Growing'],
      ['West Patch', 'Sunrise Plot', '1.7 acres', '—', 'Available'],
    ],
  },
  'Crop management': {
    eyebrow: 'FROM SEED TO HARVEST',
    title: 'Crop management',
    description: 'Keep every planting on track through the growing season.',
    stats: [
      ['Total plantings', '04', 'this season'],
      ['Growing', '02', 'actively developing'],
      ['Ready soon', '01', 'harvest approaching'],
      ['Planned', '01', 'awaiting a start'],
    ],
    rows: [
      ['Tomato', 'Arka Rakshak', 'North Field', '72%', 'Growing'],
      ['Rice', 'Ponni', 'Paddy Field A', '48%', 'Growing'],
      ['Spinach', 'Palak Green', 'Kitchen Garden', '94%', 'Ready soon'],
      ['Chilli', 'Guntur Sannam', 'East Field', '35%', 'Growing'],
    ],
  },
  Activities: {
    eyebrow: 'THE WORK BEHIND THE GROWTH',
    title: 'Farm activities',
    description: 'A clear view of the work happening across your fields.',
    stats: [
      ['Logged this week', '12', 'farm activities'],
      ['Completed', '09', 'tasks checked off'],
      ['Upcoming', '03', 'planned tasks'],
      ['On schedule', '92%', 'weekly completion'],
    ],
    rows: [
      ['Morning irrigation', 'North Field · Tomato', 'Today, 8:30 AM', 'Ravi Kumar', 'Completed'],
      ['Fertilizer application', 'Paddy Field A · Rice', 'Yesterday, 4:15 PM', 'Ravi Kumar', 'Completed'],
      ['Inspect leaf health', 'East Field · Chilli', 'Oct 28, 9:00 AM', 'Ravi Kumar', 'Upcoming'],
      ['Harvest preparation', 'Kitchen Garden · Spinach', 'Oct 30, 7:30 AM', 'Ravi Kumar', 'Upcoming'],
      ['Weed control', 'North Field · Tomato', 'Oct 25, 10:00 AM', 'Ravi Kumar', 'Completed'],
    ],
  },
  Expenses: {
    eyebrow: 'SPEND WITH CLARITY',
    title: 'Farm expenses',
    description: 'Track the cost of caring for your farm and plan ahead.',
    stats: [
      ['This month', '₹8,450', 'total recorded'],
      ['Last month', '₹9,225', 'previous total'],
      ['Biggest category', 'Fertilizer', '₹2,600 this month'],
      ['Budget used', '56%', 'of ₹15,000 plan'],
    ],
    rows: [
      ['Organic fertilizer', 'FERTILIZER', 'Paddy Field A', '₹2,600', 'Oct 24, 2026'],
      ['Seeds & seedlings', 'SEEDS_AND_SEEDLINGS', 'North Field', '₹1,850', 'Oct 20, 2026'],
      ['Irrigation supplies', 'IRRIGATION', 'Green Valley Farm', '₹1,500', 'Oct 17, 2026'],
      ['Farm labour', 'LABOUR', 'Multiple fields', '₹1,400', 'Oct 14, 2026'],
      ['Fuel & transport', 'FUEL_AND_TRANSPORT', 'Green Valley Farm', '₹1,100', 'Oct 08, 2026'],
    ],
  },
  'Harvest records': {
    eyebrow: 'EVERY HARVEST TELLS A STORY',
    title: 'Harvest records',
    description: 'Capture your yield and learn from every growing cycle.',
    stats: [
      ['Harvest entries', '08', 'records this season'],
      ['Total yield', '426 kg', 'recorded to date'],
      ['Best yield', 'Rice', '210 kg recorded'],
      ['Recent harvest', '24 Oct', 'Spinach · 18 kg'],
    ],
    rows: [
      ['Spinach', 'Kitchen Garden', '18', 'KILOGRAM', 'Oct 24, 2026'],
      ['Tomato', 'North Field', '42', 'KILOGRAM', 'Oct 18, 2026'],
      ['Rice', 'Paddy Field A', '210', 'KILOGRAM', 'Oct 12, 2026'],
      ['Chilli', 'East Field', '26', 'KILOGRAM', 'Oct 06, 2026'],
      ['Tomato', 'North Field', '38', 'KILOGRAM', 'Sep 28, 2026'],
    ],
  },
  Calendar: {
    eyebrow: 'MAKE ROOM FOR WHAT MATTERS',
    title: 'Season calendar',
    description: 'Plan field work, milestones, and harvest days at a glance.',
    stats: [
      ['This month', '08', 'scheduled events'],
      ['Upcoming', '03', 'next seven days'],
      ['Tasks done', '12', 'completed this month'],
      ['Next milestone', 'Oct 30', 'spinach harvest'],
    ],
    rows: [
      ['Oct 27 · Today', 'Check soil moisture', 'North Field', 'Ravi Kumar', 'Today'],
      ['Oct 28 · Tomorrow', 'Inspect chilli plants', 'East Field', 'Ravi Kumar', 'Planned'],
      ['Oct 29 · Thu', 'Prepare harvest crates', 'Green Valley Farm', 'Ravi Kumar', 'Planned'],
      ['Oct 30 · Fri', 'Spinach harvest', 'Kitchen Garden', 'Ravi Kumar', 'Important'],
      ['Nov 02 · Mon', 'Rice field inspection', 'Paddy Field A', 'Ravi Kumar', 'Planned'],
    ],
  },
  Notifications: {
    eyebrow: 'A LITTLE NUDGE AT THE RIGHT TIME',
    title: 'Notifications',
    description: 'Important reminders and updates for your farm.',
    stats: [
      ['Unread', '03', 'need a look'],
      ['This week', '08', 'total updates'],
      ['Reminders', '04', 'scheduled'],
      ['Completed', '05', 'marked as read'],
    ],
    rows: [
      ['Harvest coming up', 'Spinach is almost ready in 3 days.', 'Today, 9:00 AM', 'Harvest', 'Unread'],
      ['Irrigation reminder', 'Check soil moisture in North Field.', 'Today, 7:30 AM', 'Reminder', 'Unread'],
      ['Weekly expenses ready', 'Your farm spending overview is updated.', 'Yesterday, 6:00 PM', 'Report', 'Unread'],
      ['Activity logged', 'Fertilizer application was recorded.', 'Oct 25, 4:15 PM', 'Activity', 'Read'],
    ],
  },
  Settings: {
    eyebrow: 'YOUR WORKSPACE, YOUR WAY',
    title: 'Settings',
    description: 'Manage your profile and personalize your farm workspace.',
    stats: [
      ['Profile', 'Complete', 'personal details'],
      ['Farm units', 'Acres', 'measurement preference'],
      ['Notifications', 'Enabled', 'reminders active'],
      ['Appearance', 'Earth', 'current theme'],
    ],
    rows: [
      ['Personal profile', 'Name, contact details, and preferences', 'Ravi Kumar', 'Edit profile', 'Available'],
      ['Farm preferences', 'Units, location, and default farm', 'Acres · Tamil Nadu', 'Edit preferences', 'Available'],
      ['Notifications', 'Reminders and activity updates', 'Enabled', 'Manage alerts', 'Available'],
      ['Appearance', 'Theme and visual preferences', 'Earth-inspired', 'Customize', 'Available'],
    ],
  },
};

export const pageMeta = {
  Farms: {
    icon: Tractor,
    cta: 'Add farm',
    columns: ['FARM NAME', 'LOCATION', 'LAND AREA', 'FIELDS', 'STATUS'],
    labels: ['Farm name', 'Location', 'Land area (acres)'],
  },
  Fields: {
    icon: MapPinned,
    cta: 'Add field',
    columns: ['FIELD NAME', 'FARM', 'AREA', 'CURRENT CROP', 'STATUS'],
    labels: ['Field name', 'Farm name', 'Area (acres)'],
  },
  'Crop management': {
    icon: Sprout,
    cta: 'Add crop',
    columns: ['CROP', 'VARIETY', 'FIELD', 'PROGRESS', 'STATUS'],
    labels: ['Crop name', 'Variety', 'Field'],
  },
  Activities: {
    icon: ClipboardList,
    cta: 'Log activity',
    columns: ['ACTIVITY', 'FIELD / CROP', 'DATE & TIME', 'ASSIGNED TO', 'STATUS'],
    labels: ['Activity name', 'Field or crop', 'Date'],
  },
  Expenses: {
    icon: Wallet,
    cta: 'Add expense',
    columns: ['DESCRIPTION', 'CATEGORY', 'FARM / FIELD', 'AMOUNT', 'DATE'],
    labels: ['Expense description', 'Category', 'Amount (₹)'],
    categories: Object.values(ExpenseCategory),
  },
  'Harvest records': {
    icon: PackageCheck,
    cta: 'Record harvest',
    columns: ['CROP', 'FIELD', 'QUANTITY', 'UNIT', 'HARVEST DATE'],
    labels: ['Crop name', 'Field', 'Quantity harvested', 'Unit'],
    units: Object.values(HarvestUnit),
  },
  Calendar: {
    icon: CalendarDays,
    cta: 'Add event',
    columns: ['DATE', 'EVENT', 'LOCATION', 'ASSIGNED TO', 'STATUS'],
    labels: ['Event name', 'Date', 'Location'],
  },
  Notifications: {
    icon: Bell,
    cta: 'Mark all read',
    columns: ['NOTIFICATION', 'DETAILS', 'RECEIVED', 'TYPE', 'STATUS'],
    labels: [],
  },
  Settings: {
    icon: Settings,
    cta: 'Save preferences',
    columns: ['SETTING', 'DESCRIPTION', 'CURRENT VALUE', 'ACTION', 'STATUS'],
    labels: [],
  },
};

