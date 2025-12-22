import React from 'react';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, CreditCard, Users, Bell, User, Trophy, BarChart3, ShieldCheck, MapPin, Star, Phone, Mail, Instagram, Facebook } from "lucide-react";
import footballVideo from "../Assets/football.mp4";




const PlayPalLanding = () => {
  return (
    <div className="bg-slate-950 min-h-screen text-white font-sans selection:bg-emerald-500/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
        {/* Video Background */}
<div className="absolute inset-0 -z-20">
  <video
    key="hero-video"
    autoPlay
    loop
    muted
    playsInline
    preload="auto"
    className="h-full w-full object-cover opacity-60"
    src="/videos/football.mp4"
  />
  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/80 to-slate-950"></div>
</div>


        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
            >
              Book Futsal Grounds <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Instantly</span>. <br/>
              Track Performance. <br/>
              Play More.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-lg sm:text-xl text-slate-400 max-w-lg mx-auto lg:mx-0"
            >
              Nepal’s first smart futsal booking and gamified player platform.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/futsalcenter" className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 hover:scale-105 active:scale-95">
                Book a Ground
              </Link>
              <button className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/50 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-slate-800 hover:border-slate-600 active:scale-95">
                Download App
              </button>
            </motion.div>
          </div>

          {/* Hero Visual - Phone Mockup / Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative w-full max-w-sm lg:max-w-md"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-[2.5rem] blur opacity-30 animate-pulse"></div>
            <div className="relative rounded-[2.5rem] border border-slate-800 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-xl">
              <div className="aspect-[9/19] w-full rounded-[2rem] border border-slate-800 bg-slate-950 overflow-hidden relative">
                {/* Mockup Content */}
                <div className="absolute top-0 left-0 right-0 h-full w-full bg-slate-950 flex flex-col">
                  <div className="p-6 pt-12">
                    <div className="flex justify-between items-center mb-6">
                      <div className="h-8 w-8 rounded-full bg-slate-800"></div>
                      <div className="h-4 w-24 rounded-full bg-slate-800"></div>
                    </div>
                    <div className="h-32 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 mb-6 p-4">
                      <div className="h-4 w-20 bg-emerald-500/40 rounded mb-2"></div>
                      <div className="h-6 w-32 bg-white/10 rounded"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-16 rounded-xl bg-slate-900 border border-slate-800"></div>
                      <div className="h-16 rounded-xl bg-slate-900 border border-slate-800"></div>
                      <div className="h-16 rounded-xl bg-slate-900 border border-slate-800"></div>
                    </div>
                  </div>
                  <div className="mt-auto p-4 bg-slate-900/50 backdrop-blur border-t border-slate-800">
                    <div className="flex justify-around">
                      <div className="h-6 w-6 rounded bg-emerald-500"></div>
                      <div className="h-6 w-6 rounded bg-slate-700"></div>
                      <div className="h-6 w-6 rounded bg-slate-700"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-24 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Everything You Need</h2>
            <p className="mt-4 text-slate-400">Powerful features for players, teams, and venue owners.</p>
          </div>

          <div className="grid gap-12 lg:grid-cols-3">
            {/* Booking Features */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Calendar size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Booking</h3>
              </div>
              <ul className="space-y-6">
                {[
                  { title: "Live Slot Booking", desc: "Real-time availability, instant confirmation." },
                  { title: "Instant Payment & Wallet", desc: "Pay easily with QR or wallet." },
                  { title: "Team Booking & Split Payment", desc: "Split payments among team members." },
                  { title: "Automated Notifications", desc: "Get alerts for bookings and updates." },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-slate-200">{item.title}</h4>
                      <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Player Features */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                  <User size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Players</h3>
              </div>
              <ul className="space-y-6">
                {[
                  { title: "Player Profiles", desc: "Create and manage your professional profile." },
                  { title: "Stats Tracking", desc: "Track goals, assists, matches played." },
                  { title: "Rankings & Leaderboards", desc: "Climb the rankings in your city." },
                  { title: "Achievements & Badges", desc: "Earn badges for your milestones." },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-slate-200">{item.title}</h4>
                      <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Owner Features */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Owners</h3>
              </div>
              <ul className="space-y-6">
                {[
                  { title: "Dashboard for Owners", desc: "Manage your venue from one place." },
                  { title: "Revenue Tracking", desc: "Track daily, weekly, and monthly earnings." },
                  { title: "Smart Scheduling", desc: "Optimize slots to reduce downtime." },
                  { title: "Customer Insights", desc: "Understand your players better." },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="mt-1 h-2 w-2 rounded-full bg-purple-500 shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-slate-200">{item.title}</h4>
                      <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-16">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0"></div>

            {[
              { step: "01", title: "Choose Ground", desc: "See real-time availability." },
              { step: "02", title: "Book Instantly", desc: "Pay easily with QR or wallet." },
              { step: "03", title: "Play & Track", desc: "Your performance is auto-updated." },
              { step: "04", title: "Earn Rewards", desc: "Badges, rankings, tournaments." },
            ].map((item, index) => (
              <div key={index} className="relative flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-xl group-hover:border-emerald-500/50 transition-colors z-10">
                  <span className="text-3xl font-bold text-emerald-500">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Screenshots Slider */}
      <section className="py-24 bg-slate-900/30 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Experience the App</h2>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="flex overflow-x-auto pb-8 gap-6 px-4 sm:px-6 lg:px-8 no-scrollbar snap-x snap-mandatory">
          {["Booking Screen", "Team Creation", "Player Dashboard", "Leaderboard", "Payment Screen", "Owner Dashboard"].map((screen, index) => (
            <div key={index} className="flex-none w-72 sm:w-80 snap-center">
              <div className="aspect-[9/19] rounded-[2rem] border border-slate-800 bg-slate-900 p-2 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="h-full w-full rounded-[1.5rem] bg-slate-950 flex items-center justify-center border border-slate-800/50">
                  <span className="text-slate-500 font-medium">{screen}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Futsal Marketplace */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Featured Venues</h2>
              <p className="mt-2 text-slate-400">Top rated futsal grounds near you.</p>
            </div>
            <Link to="/futsalcenter" className="text-emerald-400 hover:text-emerald-300 font-medium hidden sm:block">View all venues →</Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "KickOff Arena", location: "Kathmandu", price: "Rs. 2,500/hr", slots: "3 slots left", rating: "4.8", image: "bg-emerald-900" },
              { name: "City Futsal", location: "Lalitpur", price: "Rs. 3,000/hr", slots: "6 slots left", rating: "4.7", image: "bg-blue-900" },
              { name: "Goal Park", location: "Bhaktapur", price: "Rs. 2,200/hr", slots: "Available", rating: "4.9", image: "bg-purple-900" },
            ].map((venue, index) => (
              <div key={index} className="group rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden hover:border-emerald-500/30 transition-all hover:shadow-lg hover:shadow-emerald-500/10">
                <div className={`h-48 w-full ${venue.image} relative`}>
                  <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-yellow-400 border border-yellow-500/20">
                    <Star size={12} fill="currentColor" /> {venue.rating}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">{venue.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm mt-2">
                    <MapPin size={14} /> {venue.location}
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <p className="text-emerald-400 font-bold">{venue.price}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{venue.slots}</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-emerald-500 transition-colors">Book Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link to="/futsalcenter" className="text-emerald-400 hover:text-emerald-300 font-medium">View all venues →</Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-16">What People Say</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { quote: "PlayPal made booking so easy for our squad. No more calling 10 places.", name: "Aarav S.", role: "Player" },
              { quote: "Our revenue increased by 30% since joining PlayPal. The dashboard is a lifesaver.", name: "Rajesh K.", role: "Futsal Owner" },
              { quote: "The stats tracking keeps our team motivated to play better every week.", name: "Suman T.", role: "Team Captain" },
            ].map((testimonial, index) => (
              <div key={index} className="rounded-2xl border border-slate-800 bg-slate-950 p-8 relative">
                <div className="text-emerald-500 text-4xl font-serif absolute top-6 left-6 opacity-30">"</div>
                <p className="text-slate-300 relative z-10 italic mb-6">{testimonial.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-slate-500 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Futsal Owners */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900/10"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="rounded-3xl bg-gradient-to-r from-emerald-900 to-slate-900 border border-emerald-500/30 p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Own a Futsal Ground?</h2>
              <p className="text-lg text-slate-300 mb-8">
                Join PlayPal to reduce no-shows, automate accounting, and attract more bookings with our smart management system.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {["Reduce no-shows", "Smarter scheduling", "Automated accounting", "Integrated payments"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-emerald-200">
                    <ShieldCheck size={18} /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-base font-bold text-emerald-900 shadow-lg transition-all hover:bg-emerald-50">
                Register Your Futsal
              </Link>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-2xl"></div>
              <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-bold text-white">Revenue</h4>
                  <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">+12.5%</span>
                </div>
                <div className="h-32 flex items-end gap-2">
                  {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                    <div key={i} className="flex-1 bg-emerald-500/20 rounded-t hover:bg-emerald-500 transition-colors" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why PlayPal? */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-16">Why PlayPal?</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "First in Nepal", desc: "The first dedicated futsal-focused platform in the country." },
              { title: "Gamified Experience", desc: "Unique leveling and badge system to keep you motivated." },
              { title: "Real-time Management", desc: "Live slot updates so you never double book." },
              { title: "Secure Payments", desc: "Integrated QR and wallet payments for safety." },
              { title: "South Asian Focus", desc: "Built specifically for the needs of South Asian users." },
              { title: "Lightweight & Fast", desc: "Optimized for performance on all devices." },
            ].map((item, index) => (
              <div key={index} className="p-6 rounded-xl border border-slate-800 bg-slate-900/30 hover:bg-slate-900/50 transition-colors">
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-900/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-16">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Is booking free?", a: "Yes, booking is completely free for players. You only pay for the court time." },
              { q: "How are payments handled?", a: "Payments are handled securely via QR codes or your digital wallet integration." },
              { q: "How is player data stored?", a: "Player data is encrypted and stored securely in our database following privacy standards." },
              { q: "What if a team cancels?", a: "Cancellation policies depend on the specific venue, but refunds are generally available if cancelled 24h in advance." },
              { q: "How do futsal owners join?", a: "Owners can click 'Register Your Futsal' to create an account and start listing their grounds instantly." },
            ].map((faq, index) => (
              <div key={index} className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-12">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">PlayPal</h3>
              <p className="text-slate-400 text-sm">
                Revolutionizing futsal in Nepal with smart booking and gamification.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/about" className="hover:text-emerald-400">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-emerald-400">Contact</Link></li>
                <li><Link to="/careers" className="hover:text-emerald-400">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/privacy" className="hover:text-emerald-400">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-emerald-400">Terms & Conditions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Connect</h4>
              <div className="flex gap-4 mb-6">
                <a href="#" className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all">
                  <Instagram size={20} />
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                  <Facebook size={20} />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm text-center md:text-left">
              © {new Date().getFullYear()} PlayPal. All rights reserved.
            </p>
            <div className="flex gap-4">
              <button className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-colors">
                Google Play
              </button>
              <button className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-colors">
                App Store
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PlayPalLanding;
