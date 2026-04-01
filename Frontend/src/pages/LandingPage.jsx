import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  Users,
  Crosshair,
  Trophy,
  CalendarCheck,
  CreditCard,
  Bell,
  UserPlus,
  Gamepad2,
  Award,
  User,
  Building2,
  ShieldCheck,
  Medal,
  Zap,
  Sparkles,
  ArrowRight,
  Play,
  Mail,
  Moon,
  Sun,
  Menu,
  X,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";
import { showToast } from "../FutsalOwner/components/Toast";

const THEME_KEY = "playpal-landing-theme";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Tournaments", href: "#tournaments" },
  { label: "Contact", href: "#contact" },
];

const featureCards = [
  {
    icon: Star,
    title: "Player Profiles & Ratings",
    desc: "Anonymous 5-star endorsement system. Build your reputation on the field.",
  },
  {
    icon: Users,
    title: "Team Management",
    desc: "Create teams, invite players, and manage your roster effortlessly.",
  },
  {
    icon: Crosshair,
    title: "Smart Matchmaking",
    desc: "Find the perfect opponents based on skill level and availability.",
  },
  {
    icon: Trophy,
    title: "Tournament Creation",
    desc: "Create tournaments with auto-generated fixtures and brackets.",
  },
  {
    icon: CalendarCheck,
    title: "Venue Booking",
    desc: "Browse and book futsal venues instantly with real-time availability.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    desc: "Pay seamlessly via Khalti or Stripe with full transaction history.",
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    desc: "Stay updated with match invites, results, and booking confirmations.",
  },
];

const secondaryFeatures = featureCards.slice(4, 7);

const howSteps = [
  {
    n: 1,
    icon: UserPlus,
    title: "Sign Up",
    desc: "Create your account as a Player or Futsal Owner in seconds.",
  },
  {
    n: 2,
    icon: Users,
    title: "Build Your Crew",
    desc: "Create or join a team, or register your venue on the platform.",
  },
  {
    n: 3,
    icon: Gamepad2,
    title: "Book & Compete",
    desc: "Book venues, matchmake with teams, or create tournaments.",
  },
  {
    n: 4,
    icon: Award,
    title: "Play & Get Rated",
    desc: "Hit the pitch, play matches, and earn anonymous ratings.",
  },
];

const audienceCards = [
  {
    icon: User,
    title: "Player",
    desc: "Create your profile, join teams, get matched, and earn anonymous ratings from teammates and opponents.",
  },
  {
    icon: Building2,
    title: "Futsal Owner",
    desc: "Register your venue, manage bookings, host tournaments, and grow your futsal business effortlessly.",
  },
  {
    icon: ShieldCheck,
    title: "Admin",
    desc: "Oversee the entire platform — manage users, resolve disputes, and ensure fair play across PlayPal.",
  },
];

const testimonials = [
  {
    quote:
      "PlayPal completely changed how I find matches. The matchmaking is insanely accurate!",
    name: "Rajan Shrestha",
    role: "Player",
  },
  {
    quote:
      "Managing bookings and tournaments used to be a nightmare. PlayPal made it effortless.",
    name: "Suman Gurung",
    role: "Futsal Owner",
  },
  {
    quote:
      "Our team went from casual to competitive thanks to the rating system. Love it!",
    name: "Priya Tamang",
    role: "Team Captain",
  },
];

function LogoMark({ className = "" }) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-lg font-bold text-white ${className}`}
    >
      P
    </div>
  );
}

export default function LandingPage() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(THEME_KEY) === "dark";
  });
  const [mobileNav, setMobileNav] = useState(false);
  const [waitEmail, setWaitEmail] = useState("");

  useEffect(() => {
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark]);

  const scrollTo = (href) => {
    setMobileNav(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const onWaitlist = (e) => {
    e.preventDefault();
    if (!waitEmail.trim() || !waitEmail.includes("@")) {
      showToast.error("Please enter a valid email");
      return;
    }
    showToast.success("You're on the list! We'll be in touch.");
    setWaitEmail("");
  };

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 antialiased selection:bg-emerald-500/30 dark:bg-neutral-950 dark:text-white">
        {/* subtle page background */}
        <div
          className="pointer-events-none fixed inset-0 -z-10 opacity-40 dark:opacity-20"
          style={{
            backgroundImage: dark
              ? "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16,185,129,0.25), transparent)"
              : "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(16,185,129,0.12), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(16,185,129,0.06), transparent)",
          }}
        />

        {/* ── Navbar ───────────────────────────────────────── */}
        <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-neutral-950/90">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => scrollTo("#home")}
              className="flex items-center gap-2.5"
            >
              <LogoMark />
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                PlayPal
              </span>
            </button>

            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map((l) => (
                <button
                  key={l.href}
                  type="button"
                  onClick={() => scrollTo(l.href)}
                  className="text-sm font-medium text-gray-600 transition hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
                >
                  {l.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setDark((d) => !d)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:bg-gray-50 dark:border-white/15 dark:text-gray-200 dark:hover:bg-white/10"
                aria-label="Toggle theme"
              >
                {dark ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              <Link
                to="/login"
                className="hidden rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 sm:inline-block dark:border-white/20 dark:text-white dark:hover:bg-white/10"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="hidden rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 sm:inline-block"
              >
                Sign Up
              </Link>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 md:hidden dark:border-white/15"
                onClick={() => setMobileNav((o) => !o)}
                aria-label="Menu"
              >
                {mobileNav ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {mobileNav && (
            <div className="border-t border-gray-100 bg-white px-4 py-4 dark:border-white/10 dark:bg-neutral-950 md:hidden">
              {navLinks.map((l) => (
                <button
                  key={l.href}
                  type="button"
                  onClick={() => scrollTo(l.href)}
                  className="block w-full py-2.5 text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {l.label}
                </button>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3 dark:border-white/10">
                <Link
                  to="/login"
                  className="rounded-xl border border-gray-300 py-2.5 text-center text-sm font-semibold dark:border-white/20"
                  onClick={() => setMobileNav(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-xl bg-emerald-500 py-2.5 text-center text-sm font-semibold text-white"
                  onClick={() => setMobileNav(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </header>

        <main>
          {/* ── Hero ───────────────────────────────────────── */}
          <section
            id="home"
            className="relative overflow-hidden px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-28"
          >
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
                The Ultimate Futsal Platform
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
                Manage Your Futsal Experience{" "}
                <span className="text-emerald-500 dark:text-emerald-400">
                  Like a Pro
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base text-gray-600 sm:text-lg dark:text-gray-400">
                Book venues, build teams, join tournaments, and get rated — all
                in one powerful platform built for futsal lovers.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="/signup"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600 sm:w-auto"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-gray-300 bg-white px-8 py-3.5 text-sm font-bold text-gray-900 transition hover:bg-gray-50 dark:border-white/25 dark:bg-transparent dark:text-white dark:hover:bg-white/5 sm:w-auto"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Watch Demo
                </button>
              </div>
            </div>

            <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-6 text-center sm:mt-20">
              {[
                { v: "5K+", l: "Players" },
                { v: "200+", l: "Venues" },
                { v: "500+", l: "Matches" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-bold text-emerald-600 sm:text-3xl dark:text-emerald-400">
                    {s.v}
                  </div>
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Features ───────────────────────────────────── */}
          <section
            id="features"
            className="border-t border-gray-100 bg-gradient-to-b from-emerald-50/40 to-white px-4 py-20 dark:border-white/5 dark:from-emerald-950/20 dark:to-neutral-950 sm:px-6 lg:px-8"
          >
            <div className="mx-auto max-w-7xl">
              <p className="text-center text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Features
              </p>
              <h2 className="mt-3 text-center text-3xl font-extrabold text-gray-900 sm:text-4xl dark:text-white">
                Everything You Need to{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  Dominate
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600 dark:text-gray-400">
                From player ratings to tournament management — PlayPal has it all.
              </p>

              <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {featureCards.slice(0, 4).map((f) => (
                  <article
                    key={f.title}
                    className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-neutral-900/80"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      <f.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {f.desc}
                    </p>
                  </article>
                ))}
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-3">
                {secondaryFeatures.map((f) => (
                  <article
                    key={f.title}
                    className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-neutral-900/80"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      <f.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {f.desc}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ── How it works ───────────────────────────────── */}
          <section
            id="how-it-works"
            className="border-t border-gray-100 px-4 py-20 dark:border-white/5 sm:px-6 lg:px-8"
          >
            <div className="mx-auto max-w-7xl">
              <p className="text-center text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                How it works
              </p>
              <h2 className="mt-3 text-center text-3xl font-extrabold text-gray-900 sm:text-4xl dark:text-white">
                Get Started in{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  4 Easy Steps
                </span>
              </h2>

              <div className="relative mt-16">
                <div className="absolute left-0 right-0 top-14 hidden h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent lg:block dark:via-emerald-600/50" />

                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                  {howSteps.map((step) => (
                    <div
                      key={step.n}
                      className="relative flex flex-col items-center text-center"
                    >
                      <div className="relative z-10 mb-5 flex h-24 w-24 items-center justify-center rounded-2xl bg-emerald-50 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:ring-emerald-500/20">
                        <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                          {step.n}
                        </span>
                        <step.icon className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Who is it for ──────────────────────────────── */}
          <section className="border-t border-gray-100 bg-gray-50/80 px-4 py-20 dark:border-white/5 dark:bg-neutral-900/40 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <p className="text-center text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Who is it for?
              </p>
              <h2 className="mt-3 text-center text-3xl font-extrabold text-gray-900 sm:text-4xl dark:text-white">
                Built for{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  Everyone
                </span>
              </h2>
              <div className="mt-14 grid gap-6 md:grid-cols-3">
                {audienceCards.map((c) => (
                  <article
                    key={c.title}
                    className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-neutral-900"
                  >
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      <c.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {c.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {c.desc}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ── Tournaments ────────────────────────────────── */}
          <section
            id="tournaments"
            className="border-t border-gray-100 px-4 py-20 dark:border-white/5 sm:px-6 lg:px-8"
          >
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl dark:text-white">
                Compete for{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  Glory & Prizes
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-gray-600 dark:text-gray-400">
                Create or join tournaments with auto-generated fixtures, brackets,
                and prize pools.
              </p>
            </div>

            <div className="relative mx-auto mt-12 max-w-3xl">
              <div className="absolute -inset-4 rounded-3xl bg-emerald-500/20 blur-2xl dark:bg-emerald-500/10" />
              <div className="relative rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-neutral-900">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Featured tournament
                </p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  PlayPal Championship 2025
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  16 teams • Single Elimination • Auto Fixtures
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { icon: Trophy, label: "Winner", amt: "Rs. 50,000" },
                    { icon: Medal, label: "Runner up", amt: "Rs. 25,000" },
                    { icon: Star, label: "Best Player", amt: "Rs. 10,000" },
                    { icon: Zap, label: "Best Keeper", amt: "Rs. 5,000" },
                  ].map((p) => (
                    <div
                      key={p.label}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center dark:border-white/10 dark:bg-neutral-800/50"
                    >
                      <p.icon className="mx-auto h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white">
                        {p.amt}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {p.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Testimonials ───────────────────────────────── */}
          <section className="border-t border-gray-100 bg-gray-50/80 px-4 py-20 dark:border-white/5 dark:bg-neutral-900/40 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <p className="text-center text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Testimonials
              </p>
              <h2 className="mt-3 text-center text-3xl font-extrabold text-gray-900 sm:text-4xl dark:text-white">
                Loved by{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  Players & Owners
                </span>
              </h2>
              <div className="mt-14 grid gap-6 md:grid-cols-3">
                {testimonials.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900"
                  >
                    <div className="flex gap-0.5 text-emerald-500">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {t.quote}
                    </p>
                    <p className="mt-6 font-bold text-gray-900 dark:text-white">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t.role}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA Waitlist ───────────────────────────────── */}
          <section
            id="contact"
            className="border-t border-gray-100 px-4 py-20 dark:border-white/5 sm:px-6 lg:px-8"
          >
            <div className="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white p-8 shadow-lg dark:border-white/10 dark:bg-neutral-900 sm:p-10">
              <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                Join PlayPal{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  Today
                </span>
              </h2>
              <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
                Whether you&apos;re a player, team captain, or futsal owner — your
                futsal journey starts here.
              </p>
              <form
                onSubmit={onWaitlist}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={waitEmail}
                    onChange={(e) => setWaitEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm outline-none ring-emerald-500/30 focus:ring-2 dark:border-white/10 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-600"
                >
                  Join Waitlist
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </section>
        </main>

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className="border-t border-gray-200 bg-[#f4f4f5] dark:border-white/10 dark:bg-neutral-900">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="flex items-center gap-2">
                  <LogoMark />
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                    PlayPal
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  The ultimate futsal management platform for players, teams, and
                  venue owners.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">
                  Platform
                </h4>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollTo("#features")}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      Features
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollTo("#tournaments")}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      Tournaments
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollTo("#how-it-works")}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      How It Works
                    </button>
                  </li>
                  <li>
                    <span className="cursor-default opacity-70">Pricing</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">
                  Support
                </h4>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <Link
                      to="/help"
                      className="hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <span className="opacity-70">Privacy Policy</span>
                  </li>
                  <li>
                    <span className="opacity-70">Terms of Service</span>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollTo("#contact")}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      Contact Us
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">
                  Connect
                </h4>
                <div className="mt-4 flex gap-2">
                  {[Facebook, Instagram, Youtube].map((Icon, i) => (
                    <a
                      key={i}
                      href="#"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-emerald-200 hover:text-emerald-600 dark:border-white/10 dark:bg-neutral-800 dark:hover:text-emerald-400"
                      aria-label="Social"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                  <a
                    href="#"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-emerald-200 hover:text-emerald-600 dark:border-white/10 dark:bg-neutral-800 dark:hover:text-emerald-400"
                    aria-label="X"
                  >
                    <span className="text-xs font-bold">𝕏</span>
                  </a>
                </div>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  hello@playpal.com
                </p>
              </div>
            </div>
            <div className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-500 dark:border-white/10 dark:text-gray-500">
              © {new Date().getFullYear()} PlayPal. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
