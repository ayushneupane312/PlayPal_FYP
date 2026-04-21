import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Star, Users, Crosshair, Trophy, CalendarCheck, CreditCard,
  Bell, UserPlus, Gamepad2, Award, User, Building2, ShieldCheck,
  Medal, Zap, Sparkles, ArrowRight, Play, Mail, Moon, Sun,
  Menu, X, Facebook, Instagram, Youtube, ChevronDown,
} from "lucide-react";
import { showToast } from "../FutsalOwner/components/Toast";

/* ─── data ───────────────────────────────────────────────────────────────── */

const THEME_KEY = "playpal-landing-theme";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Tournaments", href: "#tournaments" },
  { label: "Contact", href: "#contact" },
];

const featureCards = [
  { icon: Star,          title: "Player Profiles & Ratings",  desc: "Anonymous 5-star endorsement system. Build your reputation on the field." },
  { icon: Users,         title: "Team Management",             desc: "Create teams, invite players, and manage your roster effortlessly." },
  { icon: Crosshair,     title: "Smart Matchmaking",           desc: "Find the perfect opponents based on skill level and availability." },
  { icon: Trophy,        title: "Tournament Creation",         desc: "Create tournaments with auto-generated fixtures and brackets." },
  { icon: CalendarCheck, title: "Venue Booking",               desc: "Browse and book futsal venues instantly with real-time availability." },
  { icon: CreditCard,    title: "Secure Payments",             desc: "Pay seamlessly via Khalti or Stripe with full transaction history." },
  { icon: Bell,          title: "Real-time Notifications",     desc: "Stay updated with match invites, results, and booking confirmations." },
];

const howSteps = [
  { n: 1, icon: UserPlus,  title: "Sign Up",          desc: "Create your account as a Player or Futsal Owner in seconds." },
  { n: 2, icon: Users,     title: "Build Your Crew",  desc: "Create or join a team, or register your venue on the platform." },
  { n: 3, icon: Gamepad2,  title: "Book & Compete",   desc: "Book venues, matchmake with teams, or create tournaments." },
  { n: 4, icon: Award,     title: "Play & Get Rated", desc: "Hit the pitch, play matches, and earn anonymous ratings." },
];

const audienceCards = [
  { icon: User,        title: "Player",       grad: "from-emerald-500 to-teal-400",   desc: "Create your profile, join teams, get matched, and earn anonymous ratings from teammates and opponents." },
  { icon: Building2,   title: "Futsal Owner", grad: "from-amber-500 to-orange-400",   desc: "Register your venue, manage bookings, host tournaments, and grow your futsal business effortlessly." },
  { icon: ShieldCheck, title: "Admin",        grad: "from-violet-500 to-purple-400",  desc: "Oversee the entire platform — manage users, resolve disputes, and ensure fair play across PlayPal." },
];

const testimonials = [
  { quote: "PlayPal completely changed how I find matches. The matchmaking is insanely accurate!", name: "Rajan Shrestha", role: "Player" },
  { quote: "Managing bookings and tournaments used to be a nightmare. PlayPal made it effortless.",  name: "Suman Gurung",   role: "Futsal Owner" },
  { quote: "Our team went from casual to competitive thanks to the rating system. Love it!",          name: "Priya Tamang",   role: "Team Captain" },
];

/* ─── helpers ────────────────────────────────────────────────────────────── */

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("revealed"); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function LogoMark() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-lg font-black text-white shadow-lg shadow-emerald-500/40">
      P
    </div>
  );
}

/* ─── component ──────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const [dark, setDark] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(THEME_KEY) !== "light" : true
  );
  const [mobileNav, setMobileNav] = useState(false);
  const [waitEmail, setWaitEmail] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const videoRef = useRef(null);

  useScrollReveal();

  useEffect(() => { localStorage.setItem(THEME_KEY, dark ? "dark" : "light"); }, [dark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href) => {
    setMobileNav(false);
    document.getElementById(href.replace("#", ""))?.scrollIntoView({ behavior: "smooth" });
  };

  const onWaitlist = (e) => {
    e.preventDefault();
    if (!waitEmail.trim() || !waitEmail.includes("@")) { showToast.error("Please enter a valid email"); return; }
    showToast.success("You're on the list! We'll be in touch.");
    setWaitEmail("");
  };

  /* inline styles for reveal animations */
  const revealStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .reveal.revealed { opacity: 1; transform: none; }
    .reveal-delay-1 { transition-delay: 0.1s; }
    .reveal-delay-2 { transition-delay: 0.2s; }
    .reveal-delay-3 { transition-delay: 0.3s; }
    .reveal-delay-4 { transition-delay: 0.4s; }

    .hero-title { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em; line-height: 1; }
    .font-display { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.03em; }
    .font-body { font-family: 'DM Sans', sans-serif; }

    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(16,185,129,0.4); }
      50% { box-shadow: 0 0 40px rgba(16,185,129,0.8), 0 0 80px rgba(16,185,129,0.3); }
    }
    .glow-btn { animation: pulse-glow 2.5s ease-in-out infinite; }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    .float { animation: float 4s ease-in-out infinite; }

    @keyframes ticker {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .ticker-track { animation: ticker 28s linear infinite; }
    .ticker-track:hover { animation-play-state: paused; }

    @keyframes grain {
      0%, 100% { transform: translate(0, 0); }
      10% { transform: translate(-2%, -3%); }
      20% { transform: translate(3%, 2%); }
      30% { transform: translate(-1%, 4%); }
      40% { transform: translate(4%, -1%); }
      50% { transform: translate(-3%, 1%); }
      60% { transform: translate(2%, -4%); }
      70% { transform: translate(-4%, 3%); }
      80% { transform: translate(1%, -2%); }
      90% { transform: translate(-2%, 4%); }
    }
    .grain::after {
      content: '';
      position: fixed;
      inset: -200%;
      width: 400%;
      height: 400%;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
      opacity: 0.035;
      pointer-events: none;
      animation: grain 8s steps(10) infinite;
      z-index: 9999;
    }

    .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.35); }

    .stat-number { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.05em; }

    .video-overlay {
      background: linear-gradient(
        to bottom,
        rgba(5,10,10,0.55) 0%,
        rgba(5,10,10,0.4) 40%,
        rgba(5,10,10,0.75) 85%,
        rgba(5,10,10,1) 100%
      );
    }

    .section-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }
  `;

  const isDark = dark;

  return (
    <div className={`font-body grain ${isDark ? "dark" : ""}`} style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{revealStyle}</style>

      <div className="min-h-screen bg-[#060d0d] text-white antialiased selection:bg-emerald-500/30">

        {/* ── Navbar ─────────────────────────────────────────────────────── */}
        <header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            scrolled
              ? "border-b border-white/10 bg-[#060d0d]/95 backdrop-blur-xl shadow-2xl"
              : "bg-transparent"
          }`}
        >
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button type="button" onClick={() => scrollTo("#home")} className="flex items-center gap-2.5">
              <LogoMark />
              <span className="font-display text-xl tracking-widest text-white">PLAYPAL</span>
            </button>

            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map((l) => (
                <button
                  key={l.href}
                  type="button"
                  onClick={() => scrollTo(l.href)}
                  className="text-sm font-medium text-gray-400 transition-colors duration-200 hover:text-emerald-400"
                >
                  {l.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setDark((d) => !d)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-gray-400 transition hover:border-emerald-500/50 hover:text-emerald-400"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <Link
                to="/login"
                className="hidden rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-gray-200 transition hover:border-emerald-500/50 hover:text-white sm:inline-block"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="hidden rounded-full bg-emerald-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 sm:inline-block glow-btn"
              >
                Sign Up
              </Link>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 md:hidden"
                onClick={() => setMobileNav((o) => !o)}
              >
                {mobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileNav && (
            <div className="border-t border-white/10 bg-[#060d0d]/98 backdrop-blur-xl px-4 py-4 md:hidden">
              {navLinks.map((l) => (
                <button
                  key={l.href}
                  type="button"
                  onClick={() => scrollTo(l.href)}
                  className="block w-full py-3 text-left text-sm font-medium text-gray-300"
                >
                  {l.label}
                </button>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
                <Link to="/login" className="rounded-xl border border-white/20 py-2.5 text-center text-sm font-semibold" onClick={() => setMobileNav(false)}>Login</Link>
                <Link to="/signup" className="rounded-xl bg-emerald-500 py-2.5 text-center text-sm font-bold text-white" onClick={() => setMobileNav(false)}>Sign Up</Link>
              </div>
            </div>
          )}
        </header>

        <main>
          {/* ── Hero with Video Background ─────────────────────────────── */}
          <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">

            {/* VIDEO BACKGROUND */}
            <div className="absolute inset-0 z-0">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80"
              >
                {/* Replace src with your actual video file */}
                {/* <source src="/videos/futsal-hero.mp4" type="video/mp4" /> */}
                {/* Fallback: uses poster image if video fails */}
              </video>
              {/* dark gradient overlay */}
              <div className="absolute inset-0 video-overlay" />
              {/* green tint accent */}
              <div className="absolute inset-0 bg-emerald-950/20" />
            </div>

            {/* decorative court lines */}
            <div className="absolute inset-0 z-[1] overflow-hidden opacity-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] border-2 border-emerald-400 rounded-2xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[400px] bg-emerald-400" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] border-2 border-emerald-400 rounded-full" />
            </div>

            <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8 pt-20">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                <Sparkles className="h-3 w-3" />
                The Ultimate Futsal Platform
              </div>

              <h1 className="hero-title text-[clamp(3.5rem,12vw,8rem)] text-white leading-none">
                OWN THE{" "}
                <span className="text-emerald-400" style={{ textShadow: "0 0 60px rgba(52,211,153,0.6)" }}>
                  COURT.
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base text-gray-300 sm:text-lg leading-relaxed">
                Book venues, build teams, crush tournaments, and get rated — one platform built for futsal lovers across Nepal.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="/signup"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-9 py-4 text-sm font-bold text-white shadow-2xl shadow-emerald-500/40 transition hover:bg-emerald-400 sm:w-auto glow-btn"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  className="group inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/25 bg-white/5 backdrop-blur-sm px-9 py-4 text-sm font-bold text-white transition hover:bg-white/10 sm:w-auto"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 group-hover:bg-emerald-500 transition">
                    <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                  </span>
                  Watch Demo
                </button>
              </div>

              {/* stats */}
              <div className="mt-16 grid grid-cols-3 gap-4 max-w-xl mx-auto">
                {[
                  { v: "5K+",  l: "Players" },
                  { v: "200+", l: "Venues" },
                  { v: "500+", l: "Matches" },
                ].map((s) => (
                  <div key={s.l} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
                    <div className="stat-number text-3xl text-emerald-400">{s.v}</div>
                    <div className="mt-1 text-xs text-gray-400 font-medium">{s.l}</div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => scrollTo("#features")}
                className="mt-12 flex items-center gap-2 text-gray-500 text-xs uppercase tracking-widest mx-auto hover:text-emerald-400 transition float"
              >
                <ChevronDown className="h-5 w-5" />
                Scroll to explore
              </button>
            </div>
          </section>

          {/* ── Ticker / marquee ────────────────────────────────────────── */}
          <div className="border-y border-white/10 bg-emerald-500/5 py-4 overflow-hidden">
            <div className="ticker-track flex gap-12 whitespace-nowrap w-max">
              {[...Array(2)].map((_, di) =>
                ["Real-Time Booking", "Smart Matchmaking", "Tournament Brackets", "Khalti Payments", "Anonymous Ratings", "Team Management", "Venue Dashboard", "Live Notifications"].map((t, i) => (
                  <span key={`${di}-${i}`} className="flex items-center gap-3 text-sm font-semibold text-gray-400 uppercase tracking-widest">
                    <span className="text-emerald-500">✦</span> {t}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* ── Features ────────────────────────────────────────────────── */}
          <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="reveal text-center mb-16">
                <p className="section-label text-emerald-500 mb-3">Features</p>
                <h2 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-white">
                  EVERYTHING YOU NEED TO{" "}
                  <span className="text-emerald-400">DOMINATE</span>
                </h2>
                <p className="mt-4 text-gray-400 max-w-xl mx-auto">
                  From player ratings to tournament management — PlayPal has it all.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {featureCards.slice(0, 4).map((f, i) => (
                  <article
                    key={f.title}
                    className={`reveal reveal-delay-${i + 1} card-hover rounded-2xl border border-white/8 bg-white/4 p-6 backdrop-blur-sm`}
                    style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)" }}
                  >
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400">
                      <f.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
                  </article>
                ))}
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {featureCards.slice(4).map((f, i) => (
                  <article
                    key={f.title}
                    className={`reveal reveal-delay-${i + 1} card-hover rounded-2xl border border-white/8 bg-white/4 p-6 backdrop-blur-sm`}
                    style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)" }}
                  >
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400">
                      <f.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ── How It Works ────────────────────────────────────────────── */}
          <section id="how-it-works" className="px-4 py-24 sm:px-6 lg:px-8 border-t border-white/5">
            <div className="mx-auto max-w-7xl">
              <div className="reveal text-center mb-20">
                <p className="section-label text-emerald-500 mb-3">How It Works</p>
                <h2 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-white">
                  GET STARTED IN{" "}
                  <span className="text-emerald-400">4 STEPS</span>
                </h2>
              </div>

              <div className="relative grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                {/* connector line */}
                <div className="absolute top-14 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent hidden lg:block" />

                {howSteps.map((step, i) => (
                  <div key={step.n} className={`reveal reveal-delay-${i + 1} relative flex flex-col items-center text-center`}>
                    <div className="relative z-10 mb-6 flex h-28 w-28 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/8 backdrop-blur-sm shadow-2xl shadow-emerald-500/10">
                      <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white shadow-lg shadow-emerald-500/50">
                        {step.n}
                      </span>
                      <step.icon className="h-10 w-10 text-emerald-400" />
                    </div>
                    <h3 className="text-base font-bold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Audience ────────────────────────────────────────────────── */}
          <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-white/5">
            <div className="mx-auto max-w-7xl">
              <div className="reveal text-center mb-16">
                <p className="section-label text-emerald-500 mb-3">Who Is It For?</p>
                <h2 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-white">
                  BUILT FOR{" "}
                  <span className="text-emerald-400">EVERYONE</span>
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {audienceCards.map((c, i) => (
                  <article
                    key={c.title}
                    className={`reveal reveal-delay-${i + 1} card-hover relative overflow-hidden rounded-3xl border border-white/10 p-8 text-center`}
                    style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.3) 100%)" }}
                  >
                    {/* gradient accent bg */}
                    <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${c.grad} pointer-events-none`} />
                    <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${c.grad} text-white shadow-2xl`}>
                      <c.icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-display text-2xl text-white mb-3">{c.title.toUpperCase()}</h3>
                    <p className="text-sm leading-relaxed text-gray-400">{c.desc}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ── Tournaments ─────────────────────────────────────────────── */}
          <section id="tournaments" className="px-4 py-24 sm:px-6 lg:px-8 border-t border-white/5">
            <div className="mx-auto max-w-4xl">
              <div className="reveal text-center mb-14">
                <p className="section-label text-emerald-500 mb-3">Tournaments</p>
                <h2 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-white">
                  COMPETE FOR{" "}
                  <span className="text-emerald-400">GLORY</span>
                </h2>
                <p className="mt-4 text-gray-400 max-w-xl mx-auto">
                  Create or join tournaments with auto-generated fixtures, brackets, and prize pools.
                </p>
              </div>

              <div className="reveal relative">
                <div className="absolute -inset-6 rounded-3xl bg-emerald-500/10 blur-3xl pointer-events-none" />
                <div className="relative rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-white/6 to-white/2 p-8 backdrop-blur-sm">
                  <p className="section-label text-emerald-500 mb-2">Featured Tournament</p>
                  <h3 className="font-display text-3xl text-white mb-1">PLAYPAL CHAMPIONSHIP 2025</h3>
                  <p className="text-sm text-gray-500 mb-8">16 teams · Single Elimination · Auto Fixtures</p>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { icon: Trophy,  label: "Winner",      amt: "NPR 50,000" },
                      { icon: Medal,   label: "Runner Up",   amt: "NPR 25,000" },
                      { icon: Star,    label: "Best Player", amt: "NPR 10,000" },
                      { icon: Zap,     label: "Best Keeper", amt: "NPR 5,000"  },
                    ].map((p) => (
                      <div
                        key={p.label}
                        className="card-hover rounded-2xl border border-white/10 bg-white/4 p-5 text-center"
                      >
                        <p.icon className="mx-auto h-6 w-6 text-emerald-400 mb-3" />
                        <p className="font-bold text-white text-sm">{p.amt}</p>
                        <p className="text-xs text-gray-500 mt-1">{p.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Testimonials ────────────────────────────────────────────── */}
          <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-white/5">
            <div className="mx-auto max-w-7xl">
              <div className="reveal text-center mb-16">
                <p className="section-label text-emerald-500 mb-3">Testimonials</p>
                <h2 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-white">
                  LOVED BY{" "}
                  <span className="text-emerald-400">PLAYERS & OWNERS</span>
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {testimonials.map((t, i) => (
                  <article
                    key={t.name}
                    className={`reveal reveal-delay-${i + 1} card-hover rounded-2xl border border-white/10 p-7`}
                    style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.2) 100%)" }}
                  >
                    <div className="text-4xl text-emerald-500 font-serif leading-none mb-4">"</div>
                    <div className="flex gap-0.5 text-emerald-500 mb-4">
                      {[1,2,3,4,5].map((s) => <Star key={s} className="h-3.5 w-3.5 fill-current" />)}
                    </div>
                    <p className="text-sm leading-relaxed text-gray-300">{t.quote}</p>
                    <div className="mt-6 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.role}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA ─────────────────────────────────────────────────────── */}
          <section id="contact" className="px-4 py-24 sm:px-6 lg:px-8 border-t border-white/5">
            <div className="reveal mx-auto max-w-2xl relative">
              <div className="absolute -inset-8 rounded-3xl bg-emerald-500/8 blur-3xl pointer-events-none" />
              <div
                className="relative rounded-3xl border border-emerald-500/20 p-10 text-center"
                style={{ background: "linear-gradient(145deg, rgba(16,185,129,0.08) 0%, rgba(255,255,255,0.03) 100%)" }}
              >
                <h2 className="font-display text-[clamp(2.5rem,6vw,3.5rem)] text-white">
                  JOIN PLAYPAL{" "}
                  <span className="text-emerald-400">TODAY</span>
                </h2>
                <p className="mt-3 text-sm text-gray-400 max-w-md mx-auto">
                  Whether you're a player, team captain, or futsal owner — your futsal journey starts here.
                </p>
                <form onSubmit={onWaitlist} className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={waitEmail}
                      onChange={(e) => setWaitEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 backdrop-blur-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 whitespace-nowrap"
                  >
                    Join Waitlist
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </section>
        </main>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className="border-t border-white/8 bg-[#040a0a]">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <LogoMark />
                  <span className="font-display text-xl tracking-widest text-emerald-400">PLAYPAL</span>
                </div>
                <p className="text-sm leading-relaxed text-gray-500">
                  The ultimate futsal management platform for players, teams, and venue owners across Nepal.
                </p>
              </div>

              {[
                {
                  title: "Platform",
                  links: [
                    { label: "Features",    action: () => scrollTo("#features") },
                    { label: "Tournaments", action: () => scrollTo("#tournaments") },
                    { label: "How It Works",action: () => scrollTo("#how-it-works") },
                    { label: "Pricing",     action: null },
                  ],
                },
                {
                  title: "Support",
                  links: [
                    { label: "Help Center",     action: null },
                    { label: "Privacy Policy",  action: null },
                    { label: "Terms of Service",action: null },
                    { label: "Contact Us",      action: () => scrollTo("#contact") },
                  ],
                },
              ].map((col) => (
                <div key={col.title}>
                  <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">{col.title}</h4>
                  <ul className="space-y-2.5 text-sm text-gray-500">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        {l.action ? (
                          <button type="button" onClick={l.action} className="hover:text-emerald-400 transition-colors">{l.label}</button>
                        ) : (
                          <span className="opacity-50 cursor-default">{l.label}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div>
                <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Connect</h4>
                <div className="flex gap-2 mb-5">
                  {[Facebook, Instagram, Youtube].map((Icon, i) => (
                    <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-500 transition hover:border-emerald-500/40 hover:text-emerald-400">
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                  <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-500 transition hover:border-emerald-500/40 hover:text-emerald-400">
                    <span className="text-xs font-bold">𝕏</span>
                  </a>
                </div>
                <p className="text-sm text-gray-500">hello@playpal.com</p>
              </div>
            </div>

            <div className="mt-12 border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-gray-600">© {new Date().getFullYear()} PlayPal. All rights reserved.</p>
              <p className="text-xs text-gray-700">Built in Nepal 🇳🇵</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}