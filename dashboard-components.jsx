import React, { useMemo, useState } from 'react';
import {
  Bell,
  BriefcaseBusiness,
  CircleDollarSign,
  Headset,
  LayoutDashboard,
  MapPin,
  Moon,
  Search,
  Sparkles,
  Star,
  Sun,
  UserCircle2,
  Wallet
} from 'lucide-react';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'bookings', label: 'My Bookings', icon: BriefcaseBusiness },
  { key: 'workers', label: 'Find Workers', icon: Search },
  { key: 'profile', label: 'Profile', icon: UserCircle2 },
  { key: 'payments', label: 'Payments', icon: CircleDollarSign },
  { key: 'support', label: 'Support', icon: Headset }
];

const workerSeed = [
  {
    id: 1,
    name: 'Ravi Kumar',
    skill: 'Brick Mason',
    rating: 4.8,
    rate: 420,
    distanceKm: 1.4,
    jobsCompleted: 123,
    status: 'Worker En Route'
  },
  {
    id: 2,
    name: 'Arjun Das',
    skill: 'General Labour',
    rating: 4.6,
    rate: 360,
    distanceKm: 2.1,
    jobsCompleted: 91,
    status: 'Confirmed'
  },
  {
    id: 3,
    name: 'Karan Singh',
    skill: 'Painter',
    rating: 4.9,
    rate: 510,
    distanceKm: 3.2,
    jobsCompleted: 155,
    status: 'In Progress'
  },
  {
    id: 4,
    name: 'Salman Ali',
    skill: 'Plumber',
    rating: 4.7,
    rate: 470,
    distanceKm: 0.8,
    jobsCompleted: 109,
    status: 'Requested'
  }
];

const statusSteps = ['Requested', 'Confirmed', 'Worker En Route', 'In Progress', 'Completed'];

function StatusStepper({ status }) {
  const activeIndex = Math.max(statusSteps.indexOf(status), 0);

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Live Booking Status
      </p>
      <div className="flex items-center gap-1.5">
        {statusSteps.map((step, idx) => (
          <div key={step} className="flex items-center gap-1.5">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                idx <= activeIndex ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              title={step}
            />
            {idx < statusSteps.length - 1 ? (
              <div
                className={`h-0.5 w-5 ${
                  idx < activeIndex ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ) : null}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{status}</p>
    </div>
  );
}

function WorkerCard({ worker }) {
  return (
    <article className="rounded-2xl border border-white/40 bg-white/70 p-5 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{worker.name}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">{worker.skill}</p>
        </div>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
          {worker.rating}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <div className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span>{worker.rating} rating</span>
        </div>
        <div className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
          <MapPin className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <span>{worker.distanceKm} km away</span>
        </div>
        <div className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
          <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>₹{worker.rate}/hr</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{worker.jobsCompleted} jobs completed</p>

      <StatusStepper status={worker.status} />

      <div className="mt-4 flex items-center gap-2">
        <button className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800 dark:bg-cyan-500 dark:hover:bg-cyan-400">
          <Sparkles className="h-4 w-4" />
          Book Now
        </button>
        <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
          Message
        </button>
      </div>
    </article>
  );
}

function WorkerCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-2 h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-4 h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-2 h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-4 h-2 w-full rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-4 h-8 w-24 rounded bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

export function Sidebar({ active = 'workers', onNavigate, alerts = 3, darkMode = false, onToggleTheme }) {
  return (
    <aside className="w-full border-b border-white/20 bg-white/60 p-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/50 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div className="mb-8 flex items-center justify-between lg:block">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">LABOUR-LO</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Smart Labour Booking</p>
        </div>
        <button
          type="button"
          onClick={onToggleTheme}
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate?.(item.key)}
              className={`inline-flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950'
                  : 'text-slate-700 hover:bg-white/80 dark:text-slate-200 dark:hover:bg-slate-900'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              {item.key === 'dashboard' && alerts > 0 ? (
                <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">{alerts}</span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="mt-6 rounded-xl border border-cyan-100 bg-cyan-50/80 p-3 dark:border-cyan-900/60 dark:bg-cyan-950/30">
        <p className="text-xs text-slate-600 dark:text-slate-300">Labour-Lo Credits</p>
        <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">₹2,450</p>
      </div>
    </aside>
  );
}

export function WorkerCardGrid() {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState('top-rated');

  const workers = useMemo(() => {
    let filtered = [...workerSeed].filter((w) => {
      const key = `${w.name} ${w.skill}`.toLowerCase();
      return key.includes(search.toLowerCase());
    });

    if (sortMode === 'nearest') {
      filtered.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    if (sortMode === 'top-rated') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    if (sortMode === 'price-low') {
      filtered.sort((a, b) => a.rate - b.rate);
    }

    return filtered;
  }, [search, sortMode]);

  function simulateRefresh() {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 900);
  }

  return (
    <section className="flex-1 p-4 md:p-6 lg:p-8">
      <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Worker Discovery</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Find verified workers nearby with live status updates.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={simulateRefresh}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Refresh
          </button>
          <button
            type="button"
            className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">5</span>
          </button>
        </div>
      </header>

      <div className="mb-5 grid gap-2 md:grid-cols-[1fr_auto_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or skill"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>

        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="nearest">Nearest to Me</option>
          <option value="top-rated">Top Rated</option>
          <option value="price-low">Price: Low to High</option>
        </select>

        <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400">
          Apply Filters
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => <WorkerCardSkeleton key={idx} />)
          : workers.map((worker) => <WorkerCard key={worker.id} worker={worker} />)}
      </div>
    </section>
  );
}

export default function LabourLoDashboardDemo() {
  const [active, setActive] = useState('workers');
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50 to-slate-200 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
        <div className="mx-auto flex max-w-[1440px] flex-col lg:flex-row">
          <Sidebar
            active={active}
            onNavigate={setActive}
            alerts={3}
            darkMode={darkMode}
            onToggleTheme={() => setDarkMode((p) => !p)}
          />
          <WorkerCardGrid />
        </div>
      </div>
    </div>
  );
}
