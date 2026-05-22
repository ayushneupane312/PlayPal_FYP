import { useState, useEffect, useId } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Users,
  BadgeDollarSign,
  Bell,
  Trophy,
  Medal,
  Star,
  Target,
  Shield,
  TrendingUp,
  Shuffle,
  Clock3,
  PauseCircle,
  CalendarClock,
  CreditCard,
  Banknote,
  LayoutList,
  CheckCircle2,
  List,
} from "lucide-react";
import FutsalOwnerSidebar from "./FutsalOwnerSidebar";
import Header from "./components/Header";
import { showToast } from "./components/Toast";
import axios from "axios";
import { createTournament } from "../store/tournamentService";
import { RequiredMark } from "../components/RequiredMark";
import API_BASE from "../utils/apiBase.js";

const STEPS = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Details" },
  { id: 3, label: "Registration" },
  { id: 4, label: "Prizes" },
  { id: 5, label: "Fixtures" },
  { id: 6, label: "Review" },
];

const initialData = {
  banner: null,
  name: "",
  description: "",
  venue: "",
  location: "",
  startDate: "",
  endDate: "",
  regDeadline: "",
  maxTeams: 16,
  format: "knockout",
  entryFee: 1500,
  paymentMethod: "online",
  prizes: {
    winner: { enabled: true, amount: 10000, label: "Tournament champion" },
    runnerUp: { enabled: true, amount: 5000, label: "Second place" },
    bestPlayer: { enabled: true, amount: 2000, label: "Most valuable player" },
    topScorer: { enabled: false, amount: 1500, label: "Highest goal scorer" },
    bestGoalkeeper: { enabled: false, amount: 1500, label: "Best defensive player" },
    risingPlayer: { enabled: false, amount: 1000, label: "Best emerging talent" },
  },
  customPrizes: [],
  customPrizeDraft: "",
  shuffleTeams: true,
  matchDuration: 20,
  breakBetween: 5,
  court: "",
  timeSlot: "",
  notifyPlayers: true,
};

const courts = ["Court 1", "Court 2", "Court 3", "Main Ground"];

function StepIndicator({ current, completed }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 32, flexWrap: "wrap" }}>
      {STEPS.map((step, i) => {
        const done = completed.includes(step.id);
        const active = current === step.id;
        return (
          <div key={step.id} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: done ? "#16a34a" : active ? "#16a34a" : "#f3f4f6",
                border: active ? "2px solid #16a34a" : done ? "none" : "2px solid #e5e7eb",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: done || active ? "#fff" : "#9ca3af",
                fontWeight: 700, fontSize: 13,
                transition: "all 0.3s",
              }}>
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : step.id}
              </div>
              <span style={{ fontSize: 11, color: active ? "#16a34a" : done ? "#16a34a" : "#9ca3af", fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: 48, height: 2, background: done ? "#16a34a" : "#e5e7eb", margin: "0 4px", marginBottom: 16, flexShrink: 0, transition: "background 0.3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div onClick={() => onChange(!checked)} style={{
      width: 44, height: 24, borderRadius: 12,
      background: checked ? "#16a34a" : "#d1d5db",
      cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0,
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        position: "absolute", top: 3, left: checked ? 23 : 3, transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      }} />
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", prefix, style, required }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label != null && label !== false && (
        <label style={{ color: "#374151", fontSize: 13, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          {label}
          {required ? <RequiredMark /> : null}
        </label>
      )}
      <div style={{
        display: "flex", alignItems: "center",
        background: "#ffffff", border: "1px solid #e5e7eb",
        borderRadius: 8, overflow: "hidden",
      }}>
        {prefix && (
          <span style={{ padding: "0 10px", color: "#6b7280", fontSize: 14, borderRight: "1px solid #e5e7eb", paddingTop: 10, paddingBottom: 10 }}>{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: "#111827", padding: "10px 12px", fontSize: 14,
          }}
        />
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options, placeholder, required }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label != null && label !== false && (
        <label style={{ color: "#374151", fontSize: 13, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          {label}
          {required ? <RequiredMark /> : null}
        </label>
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: "#ffffff", border: "1px solid #e5e7eb",
          borderRadius: 8, color: value ? "#111827" : "#6b7280",
          padding: "10px 12px", fontSize: 14, outline: "none", cursor: "pointer",
        }}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─── STEP 1 ───────────────────────────────────────────────────────────────────
function Step1({ data, setData }) {
  return (
    <div>
      <h2 style={{ color: "#111827", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Basic Information</h2>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>Set up the core details for your tournament.</p>

      <div style={{ marginBottom: 20 }}>
        <label style={{ color: "#374151", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 8 }}>
          Tournament Banner{" "}
          <span style={{ color: "#6b7280", fontWeight: 400 }}>(optional)</span>
        </label>
        <div
          style={{
            border: "1.5px dashed #d1d5db", borderRadius: 10, padding: "40px 20px",
            textAlign: "center", cursor: "pointer",
            background: data.banner ? "#f9fafb" : "#ffffff",
            transition: "border-color 0.2s",
          }}
          onClick={() => document.getElementById("bannerInput").click()}
        >
          {data.banner ? (
            <img src={data.banner} alt="banner" style={{ maxHeight: 140, borderRadius: 6, maxWidth: "100%" }} />
          ) : (
            <>
              <div style={{
                width: 44, height: 44, background: "#f3f4f6", borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p style={{ color: "#4b5563", fontSize: 14, marginBottom: 4 }}>Drag & drop or click to upload</p>
              <p style={{ color: "#9ca3af", fontSize: 12 }}>PNG, JPG up to 5MB — 800×400 recommended</p>
            </>
          )}
          <input
            id="bannerInput" type="file" accept="image/*" style={{ display: "none" }}
            onChange={e => {
              const file = e.target.files[0];
              if (!file) return;
              const r = new FileReader();
              r.onload = ev => setData(d => ({ ...d, banner: ev.target.result, bannerFile: file }));
              r.readAsDataURL(file);
            }}
          />
        </div>
      </div>

      <Input label="Tournament Name" required value={data.name} onChange={v => setData(d => ({ ...d, name: v }))}
        placeholder="e.g. PlayPal Champions League 2026" style={{ marginBottom: 16 }} />

      <div style={{ marginBottom: 16 }}>
        <label style={{ color: "#374151", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
          Description
          <RequiredMark />
        </label>
        <textarea
          value={data.description}
          onChange={e => setData(d => ({ ...d, description: e.target.value }))}
          placeholder="Describe your tournament, rules, and what makes it special..."
          maxLength={500}
          style={{
            width: "100%", height: 120, background: "#ffffff",
            border: "1px solid #e5e7eb", borderRadius: 8, color: "#111827",
            padding: "10px 12px", fontSize: 14, resize: "none", outline: "none", boxSizing: "border-box",
          }}
        />
        <div style={{ textAlign: "right", color: "#9ca3af", fontSize: 12 }}>{data.description.length}/500</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[["Venue", "venue", "Your registered futsal venue"], ["Location", "location", "Auto-filled from your venue address"]].map(([lbl, key, ph]) => (
          <div key={key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ color: "#374151", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
              {lbl}
              <RequiredMark />
            </label>
            <div style={{
              background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8,
              padding: "10px 12px", fontSize: 14, color: data[key] ? "#111827" : "#9ca3af",
            }}>
              {data[key] || ph}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Custom mini-illustrations for tournament format cards (replaces plain emoji). */
function TournamentFormatIllustration({ variant, selected }) {
  const gid = useId().replace(/:/g, "");
  const stroke = selected ? "#15803d" : "#64748b";
  const strokeSoft = selected ? "#4ade80" : "#94a3b8";
  const fillBox = selected ? "#dcfce7" : "#f1f5f9";
  const fillAccent = selected ? "#bbf7d0" : "#e2e8f0";

  const wrap = (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={`tf-bg-${variant}-${gid}`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor={selected ? "#ecfdf5" : "#f8fafc"} />
          <stop offset="1" stopColor={selected ? "#d1fae5" : "#f1f5f9"} />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#tf-bg-${variant}-${gid})`} />
      <rect x="2" y="2" width="60" height="60" rx="16" stroke={selected ? "#86efac" : "#e2e8f0"} strokeWidth="1" />
    </svg>
  );

  if (variant === "knockout") {
    return (
      <div style={{ position: "relative", width: 64, height: 64, marginBottom: 12 }}>
        {wrap}
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          style={{ position: "absolute", left: 0, top: 0 }}
          aria-hidden
        >
          <rect x="10" y="12" width="16" height="10" rx="2" fill={fillBox} stroke={stroke} strokeWidth="1.5" />
          <rect x="38" y="12" width="16" height="10" rx="2" fill={fillBox} stroke={stroke} strokeWidth="1.5" />
          <path
            d="M18 22v4M18 26h28M46 22v4M32 26v10"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="24" y="36" width="16" height="12" rx="3" fill={fillAccent} stroke={stroke} strokeWidth="1.75" />
          <path d="M30 40h4M30 43h4" stroke={strokeSoft} strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (variant === "group_knockout") {
    return (
      <div style={{ position: "relative", width: 64, height: 64, marginBottom: 12 }}>
        {wrap}
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          style={{ position: "absolute", left: 0, top: 0 }}
          aria-hidden
        >
          <rect x="11" y="11" width="11" height="9" rx="2" fill={fillBox} stroke={stroke} strokeWidth="1.35" />
          <rect x="42" y="11" width="11" height="9" rx="2" fill={fillBox} stroke={stroke} strokeWidth="1.35" />
          <rect x="11" y="24" width="11" height="9" rx="2" fill={fillBox} stroke={stroke} strokeWidth="1.35" />
          <rect x="42" y="24" width="11" height="9" rx="2" fill={fillBox} stroke={stroke} strokeWidth="1.35" />
          <path
            d="M16.5 33v3.5c0 1 1 2 2 2h27c1 0 2-1 2-2V33"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <path d="M32 38.5v4" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <path
            d="M26 46h12l-1.5 4h-9L26 46z"
            fill={fillAccent}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M29 48.5h6" stroke={strokeSoft} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  /* round_robin */
  return (
    <div style={{ position: "relative", width: 64, height: 64, marginBottom: 12 }}>
      {wrap}
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        style={{ position: "absolute", left: 0, top: 0 }}
        aria-hidden
      >
        <ellipse cx="32" cy="32" rx="22" ry="14" stroke={stroke} strokeWidth="1.25" strokeDasharray="3 3" opacity={0.55} />
        <circle cx="32" cy="18" r="4.5" fill={fillBox} stroke={stroke} strokeWidth="1.5" />
        <circle cx="46" cy="32" r="4.5" fill={fillBox} stroke={stroke} strokeWidth="1.5" />
        <circle cx="32" cy="46" r="4.5" fill={fillBox} stroke={stroke} strokeWidth="1.5" />
        <circle cx="18" cy="32" r="4.5" fill={fillBox} stroke={stroke} strokeWidth="1.5" />
        <path
          d="M35.2 20.2c4.5 2.8 7.3 7.2 7.8 12.2M44.8 35.6c-2.8 4.5-7.2 7.3-12.2 7.8M28.8 43.8c-4.5-2.8-7.3-7.2-7.8-12.2M19.2 28.4c2.8-4.5 7.2-7.3 12.2-7.8"
          stroke={strokeSoft}
          strokeWidth="1.35"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

// ─── STEP 2 ───────────────────────────────────────────────────────────────────
function Step2({ data, setData }) {
  const [hoverFormat, setHoverFormat] = useState(null);
  const [focusFormat, setFocusFormat] = useState(null);
  const formats = [
    { id: "knockout", label: "Knockout", sub: "Single elimination bracket" },
    { id: "group_knockout", label: "Group + Knockout", sub: "Group stage followed by knockouts" },
    { id: "round_robin", label: "Round Robin", sub: "Every team plays every other team" },
  ];
  return (
    <div>
      <h2 style={{ color: "#111827", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Tournament Details</h2>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>Configure dates, team capacity, and format.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
        {[["Start Date", "startDate"], ["End Date", "endDate"], ["Registration Deadline", "regDeadline"]].map(([lbl, key]) => (
          <Input key={key} label={lbl} type="date" value={data[key]} onChange={v => setData(d => ({ ...d, [key]: v }))} required />
        ))}
      </div>

      <Input label="Maximum Teams" type="number" value={data.maxTeams}
        onChange={v => setData(d => ({ ...d, maxTeams: parseInt(v) || 0 }))}
        style={{ marginBottom: 20, maxWidth: 200 }} required />

      <div>
        <label style={{ color: "#374151", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
          Tournament Format
          <RequiredMark />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {formats.map(f => {
            const active = data.format === f.id;
            const hover = hoverFormat === f.id;
            const focused = focusFormat === f.id;
            return (
              <div
                key={f.id}
                role="button"
                tabIndex={0}
                aria-pressed={active}
                aria-label={`${f.label}: ${f.sub}`}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setData(d => ({ ...d, format: f.id }));
                  }
                }}
                onClick={() => setData(d => ({ ...d, format: f.id }))}
                onMouseEnter={() => setHoverFormat(f.id)}
                onMouseLeave={() => setHoverFormat(null)}
                onFocus={() => setFocusFormat(f.id)}
                onBlur={() => setFocusFormat(null)}
                style={{
                  padding: "18px 16px",
                  borderRadius: 14,
                  cursor: "pointer",
                  border: active ? "2px solid #16a34a" : focused ? "2px solid #86efac" : "1px solid #e5e7eb",
                  background: active ? "linear-gradient(165deg, #f0fdf4 0%, #ecfdf5 55%, #ffffff 100%)" : "#ffffff",
                  transition: "box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
                  boxShadow: active
                    ? "0 8px 24px rgba(22, 163, 74, 0.12), 0 2px 8px rgba(22, 163, 74, 0.06)"
                    : hover || focused
                      ? "0 6px 20px rgba(15, 23, 42, 0.08)"
                      : "0 1px 2px rgba(15, 23, 42, 0.04)",
                  transform: hover && !active ? "translateY(-2px)" : "none",
                  outline: "none",
                }}
              >
                <TournamentFormatIllustration variant={f.id} selected={active} />
                <div style={{ color: active ? "#15803d" : "#111827", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{f.label}</div>
                <div style={{ color: active ? "#3f6212" : "#6b7280", fontSize: 12, lineHeight: 1.45 }}>{f.sub}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── STEP 3 ───────────────────────────────────────────────────────────────────
function Step3({ data, setData }) {
  const prizePool = data.maxTeams * data.entryFee;
  const methods = [
    { id: "online", label: "Online Payment", icon: <CreditCard size={15} /> },
    { id: "cash", label: "Cash Payment", icon: <Banknote size={15} /> },
    { id: "both", label: "Both", icon: <LayoutList size={15} /> },
  ];
  return (
    <div>
      <h2 style={{ color: "#111827", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Registration Settings</h2>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>Set entry fees and payment preferences.</p>

      <Input label="Entry Fee per Team" type="number" value={data.entryFee}
        onChange={v => setData(d => ({ ...d, entryFee: parseInt(v) || 0 }))}
        prefix="NPR " style={{ marginBottom: 20, maxWidth: 240 }} required />

      <div style={{ marginBottom: 20 }}>
        <label style={{ color: "#374151", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
          Payment Method
          <RequiredMark />
        </label>
        <div style={{ display: "flex", gap: 10 }}>
          {methods.map(m => (
            <button key={m.id} onClick={() => setData(d => ({ ...d, paymentMethod: m.id }))} style={{
              padding: "8px 16px", borderRadius: 8,
              border: data.paymentMethod === m.id ? "1.5px solid #16a34a" : "1.5px solid #e5e7eb",
              background: data.paymentMethod === m.id ? "#f0fdf4" : "#ffffff",
              color: data.paymentMethod === m.id ? "#16a34a" : "#6b7280",
              cursor: "pointer", fontSize: 14, fontWeight: 500,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        background: "#f0fdf4", border: "1px solid #bbf7d0",
        borderRadius: 10, padding: 20,
      }}>
        <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 6 }}>Potential Prize Pool</div>
        <div style={{ color: "#16a34a", fontSize: 32, fontWeight: 800, marginBottom: 4 }}>
          NPR {prizePool.toLocaleString()}
        </div>
        <div style={{ color: "#4b5563", fontSize: 13 }}>
          Based on {data.maxTeams} teams × NPR {data.entryFee.toLocaleString()} entry fee
        </div>
      </div>
    </div>
  );
}

// ─── STEP 4 ───────────────────────────────────────────────────────────────────
function Step4({ data, setData }) {
  const prizeKeys = ["winner", "runnerUp", "bestPlayer", "topScorer", "bestGoalkeeper", "risingPlayer"];
  const prizeLabels = {
    winner: { label: "Winner", Icon: Trophy, color: "#16a34a" },
    runnerUp: { label: "Runner-up", Icon: Medal, color: "#f97316" },
    bestPlayer: { label: "Best Player", Icon: Star, color: "#eab308" },
    topScorer: { label: "Top Scorer", Icon: Target, color: "#0ea5e9" },
    bestGoalkeeper: { label: "Best Goalkeeper", Icon: Shield, color: "#6366f1" },
    risingPlayer: { label: "Rising Player", Icon: TrendingUp, color: "#22c55e" },
  };

  const updatePrize = (key, field, val) => {
    setData(d => ({ ...d, prizes: { ...d.prizes, [key]: { ...d.prizes[key], [field]: val } } }));
  };

  return (
    <div>
      <h2 style={{ color: "#111827", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Prize Distribution</h2>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>Configure prizes and rewards for the tournament.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {prizeKeys.map(key => {
          const p = data.prizes[key];
          const meta = prizeLabels[key];
          const IconComp = meta.Icon;
          return (
            <div key={key} style={{
              background: "#ffffff", border: "1px solid #e5e7eb",
              borderRadius: 10, padding: 16,
              opacity: p.enabled ? 1 : 0.6,
              transition: "opacity 0.2s, box-shadow 0.2s",
              boxShadow: p.enabled ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: "999px",
                    background: `${meta.color}1A`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <IconComp size={16} color={meta.color} />
                  </span>
                  <span style={{ color: "#111827", fontWeight: 600, fontSize: 14 }}>{meta.label}</span>
                </div>
                <Toggle checked={p.enabled} onChange={v => updatePrize(key, "enabled", v)} />
              </div>
              <div style={{
                display: "flex", alignItems: "center",
                background: p.enabled ? "#ffffff" : "#f9fafb",
                border: "1px solid #e5e7eb", borderRadius: 6,
                padding: "6px 10px", marginBottom: 8,
              }}>
                <span style={{ color: "#6b7280", marginRight: 6, fontSize: 13 }}>NPR</span>
                <input
                  type="number" value={p.amount}
                  onChange={e => updatePrize(key, "amount", parseInt(e.target.value) || 0)}
                  disabled={!p.enabled}
                  style={{ background: "transparent", border: "none", outline: "none", color: "#111827", fontSize: 14, width: "100%" }}
                />
              </div>
              <input
                value={p.label}
                onChange={e => updatePrize(key, "label", e.target.value)}
                disabled={!p.enabled}
                style={{
                  background: p.enabled ? "#ffffff" : "#f9fafb",
                  border: "1px solid #e5e7eb", borderRadius: 6,
                  padding: "6px 10px", color: "#4b5563", fontSize: 13,
                  width: "100%", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
        <input
          value={data.customPrizeDraft || ""}
          onChange={(e) => setData((d) => ({ ...d, customPrizeDraft: e.target.value }))}
          placeholder="Custom prize name"
          style={{
            flex: 1,
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 14,
            color: "#111827",
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={() => {
            const name = (data.customPrizeDraft || "").trim();
            if (!name) return;
            setData((d) => ({
              ...d,
              customPrizes: [...d.customPrizes, { name, amount: 0, label: "" }],
              customPrizeDraft: "",
            }));
          }}
          style={{
            padding: "10px 18px",
            border: "1.5px dashed #d1d5db",
            borderRadius: 8,
            background: "transparent",
            color: "#6b7280",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          + Add Custom Prize
        </button>
      </div>
    </div>
  );
}

// ─── STEP 5 ───────────────────────────────────────────────────────────────────
function Step5({ data, setData }) {
  return (
    <div>
      <h2 style={{ color: "#111827", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Fixture Settings</h2>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>Configure match scheduling and fixture generation.</p>

      <div style={{
        background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 10,
        padding: 16, marginBottom: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, background: "#f0fdf4",
            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Shuffle size={18} color="#16a34a" />
          </div>
          <div>
            <div style={{ color: "#111827", fontWeight: 600, fontSize: 14 }}>Shuffle Teams Automatically</div>
            <div style={{ color: "#6b7280", fontSize: 12 }}>Randomly assign teams to brackets</div>
          </div>
        </div>
        <Toggle checked={data.shuffleTeams} onChange={v => setData(d => ({ ...d, shuffleTeams: v }))} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Input
          label={<span style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock3 size={14} color="#4b5563" /><span>Match Duration (minutes)</span></span>}
          type="number" value={data.matchDuration}
          onChange={v => setData(d => ({ ...d, matchDuration: parseInt(v) || 0 }))}
          required
        />
        <Input
          label={<span style={{ display: "flex", alignItems: "center", gap: 6 }}><PauseCircle size={14} color="#4b5563" /><span>Break Between Matches (minutes)</span></span>}
          type="number" value={data.breakBetween}
          onChange={v => setData(d => ({ ...d, breakBetween: parseInt(v) || 0 }))}
          required
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <Select
          label={<span style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={14} color="#4b5563" /><span>Court</span></span>}
          value={data.court} onChange={v => setData(d => ({ ...d, court: v }))}
          options={courts} placeholder="Select court"
          required
        />
        <Input
          label={<span style={{ display: "flex", alignItems: "center", gap: 6 }}><CalendarClock size={14} color="#4b5563" /><span>Match Time Slot</span></span>}
          value={data.timeSlot} onChange={v => setData(d => ({ ...d, timeSlot: v }))}
          placeholder="e.g. 06:00–07:00 AM"
          required
        />
      </div>

      <div style={{
        background: "#f9fafb", border: "1px solid #e5e7eb",
        borderRadius: 10, padding: 24, textAlign: "center",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.3, marginBottom: 12 }}>
          {[[120], [160, 100], [80, 120, 80]].map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: 8 }}>
              {row.map((w, bi) => (
                <div key={bi} style={{ height: 18, width: w, background: "#d1d5db", borderRadius: 4 }} />
              ))}
            </div>
          ))}
        </div>
        <p style={{ color: "#6b7280", fontSize: 13 }}>Bracket preview will be generated after teams register</p>
      </div>
    </div>
  );
}

// ─── STEP 6 ───────────────────────────────────────────────────────────────────
function Step6({ data, setData }) {
  const enabledPrizes = Object.entries(data.prizes).filter(([, p]) => p.enabled);
  const formatLabel = { knockout: "Knockout", group_knockout: "Group + Knockout", round_robin: "Round Robin" };

  const prizeIconMap = {
    winner: <Trophy size={14} color="#16a34a" />,
    runnerUp: <Medal size={14} color="#f97316" />,
    bestPlayer: <Star size={14} color="#eab308" />,
    topScorer: <Target size={14} color="#0ea5e9" />,
    bestGoalkeeper: <Shield size={14} color="#6366f1" />,
    risingPlayer: <TrendingUp size={14} color="#22c55e" />,
  };
  const prizeNameMap = {
    winner: "Winner", runnerUp: "Runner-up", bestPlayer: "Best Player",
    topScorer: "Top Scorer", bestGoalkeeper: "Best Goalkeeper", risingPlayer: "Rising Player",
  };

  const InfoRow = ({ icon, label, value, sub }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <div style={{
        width: 32, height: 32, background: "#f3f4f6", borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 500, marginBottom: 2 }}>{label}</div>
        <div style={{ color: "#111827", fontWeight: 600, fontSize: 13 }}>{value || "—"}</div>
        {sub && <div style={{ color: "#6b7280", fontSize: 12, marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );

  return (
    <div>
      <h2 style={{ color: "#111827", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Review & Publish</h2>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>Review all details before publishing your tournament.</p>

      {/* Banner */}
      {data.banner ? (
        <div style={{ marginBottom: 20, borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb" }}>
          <img src={data.banner} alt="Tournament Banner"
            style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }} />
        </div>
      ) : (
        <div style={{
          marginBottom: 20, borderRadius: 12, border: "1.5px dashed #e5e7eb",
          padding: "28px 20px", textAlign: "center", background: "#f9fafb",
        }}>
          <p style={{ color: "#9ca3af", fontSize: 13 }}>No banner uploaded</p>
        </div>
      )}

      {/* Main Card */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h3 style={{ color: "#111827", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              {data.name || "Untitled Tournament"}
            </h3>
            <p style={{ color: "#6b7280", fontSize: 13, maxWidth: 480 }}>
              {data.description || "No description provided."}
            </p>
          </div>
          <span style={{
            background: "#f3f4f6", color: "#6b7280", borderRadius: 6,
            padding: "3px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
          }}>
            Draft
          </span>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16,
          paddingTop: 16, borderTop: "1px solid #f3f4f6",
        }}>
          <InfoRow
            icon={<CalendarDays size={15} color="#6b7280" />}
            label="Tournament Dates"
            value={data.startDate && data.endDate ? `${data.startDate} → ${data.endDate}` : null}
          />
          <InfoRow
            icon={<CalendarDays size={15} color="#6b7280" />}
            label="Registration Deadline"
            value={data.regDeadline}
          />
          <InfoRow
            icon={<MapPin size={15} color="#6b7280" />}
            label="Venue"
            value={data.venue}
            sub={data.location}
          />
          <InfoRow
            icon={<Users size={15} color="#6b7280" />}
            label="Max Teams"
            value={`${data.maxTeams} teams`}
            sub={formatLabel[data.format]}
          />
          <InfoRow
            icon={<BadgeDollarSign size={15} color="#6b7280" />}
            label="Entry Fee"
            value={`NPR ${data.entryFee.toLocaleString()} / team`}
          />
          <InfoRow
            icon={<Clock3 size={15} color="#6b7280" />}
            label="Match Settings"
            value={`${data.matchDuration} min matches`}
            sub={`${data.breakBetween} min break · ${data.court || "—"} · ${data.timeSlot || "—"}`}
          />
        </div>

        {/* Prize Pool Banner */}
        <div style={{
          marginTop: 16, padding: "12px 16px",
          background: "#f0fdf4", border: "1px solid #bbf7d0",
          borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Trophy size={18} color="#16a34a" />
            <span style={{ color: "#15803d", fontWeight: 700, fontSize: 15 }}>
              Prize Pool: NPR {(data.maxTeams * data.entryFee).toLocaleString()}
            </span>
          </div>
          <span style={{ color: "#6b7280", fontSize: 13 }}>
            {enabledPrizes.length} prizes · {formatLabel[data.format]}
          </span>
        </div>
      </div>

      {/* Prizes */}
      {enabledPrizes.length > 0 && (
        <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <h4 style={{ color: "#111827", fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Prize Distribution</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {enabledPrizes.map(([key, p]) => (
              <div key={key} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 0", borderBottom: "1px solid #f9fafb",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {prizeIconMap[key]}
                  <span style={{ color: "#374151", fontSize: 14, fontWeight: 500 }}>{prizeNameMap[key]}</span>
                  <span style={{ color: "#9ca3af", fontSize: 12 }}>— {p.label}</span>
                </div>
                <span style={{ color: "#111827", fontWeight: 700, fontSize: 14 }}>
                  NPR {p.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fixture Summary */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <h4 style={{ color: "#111827", fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Fixture Summary</h4>
        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Shuffle size={14} color={data.shuffleTeams ? "#16a34a" : "#9ca3af"} />
            <span style={{ color: "#374151", fontSize: 13 }}>
              Team shuffle: <strong>{data.shuffleTeams ? "Enabled" : "Disabled"}</strong>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Clock3 size={14} color="#6b7280" />
            <span style={{ color: "#374151", fontSize: 13 }}>
              {data.matchDuration} min match · {data.breakBetween} min break
            </span>
          </div>
          {data.court && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={14} color="#6b7280" />
              <span style={{ color: "#374151", fontSize: 13 }}>{data.court}</span>
            </div>
          )}
        </div>
      </div>

      {/* Notify Toggle */}
      <div style={{
        background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12,
        padding: 16, marginBottom: 16,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, background: "#f3f4f6", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Bell size={18} color="#6b7280" />
          </div>
          <div>
            <div style={{ color: "#111827", fontWeight: 600, fontSize: 14 }}>Notify all players</div>
            <div style={{ color: "#6b7280", fontSize: 12 }}>Send push notification after publishing</div>
          </div>
        </div>
        <Toggle checked={data.notifyPlayers} onChange={v => setData(d => ({ ...d, notifyPlayers: v }))} />
      </div>

      {data.notifyPlayers && (
        <div style={{
          background: "#f9fafb", border: "1px solid #e5e7eb",
          borderRadius: 10, padding: 16, marginBottom: 4,
        }}>
          <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8 }}>Notification preview</div>
          <div style={{
            background: "#ffffff", border: "1px solid #e5e7eb",
            borderRadius: 8, padding: 14,
          }}>
            <div style={{ color: "#111827", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
              🏆 New Tournament Alert!
            </div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>
              {data.name || "Tournament"} at {data.venue || "your venue"}. Register your team now!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const STEP_COMPONENTS = [Step1, Step2, Step3, Step4, Step5, Step6];

export default function TournamentCreator() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState([]);
  const [data, setData] = useState(initialData);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/venue/my-venue`, { withCredentials: true });
        if (res.data?.success && res.data.data) {
          const v = res.data.data;
          setData(d => ({ ...d, venue: v.venueName || "", location: v.fullAddress || "" }));
        }
      } catch (err) {
        console.warn("Unable to load owner venue for tournaments", err.response?.data || err.message);
      }
    };
    fetchVenue();
  }, []);

  const goNext = () => {
    if (step === 1) {
      if (!data.name || !data.description || !data.venue || !data.location) {
        showToast.error("Please complete all basic information fields before continuing.");
        return;
      }
    }
    if (step === 2) {
      if (!data.startDate || !data.endDate || !data.regDeadline || !data.maxTeams || !data.format) {
        showToast.error("Please fill in dates, max teams and format.");
        return;
      }
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const reg = new Date(data.regDeadline);
      if (end < start) { showToast.error("End date cannot be earlier than the start date."); return; }
      if (reg >= start) { showToast.error("Registration deadline must be earlier than the start date."); return; }
    }
    if (step === 3) {
      if (!data.entryFee || !data.paymentMethod) {
        showToast.error("Please set entry fee and payment method.");
        return;
      }
    }
    if (step === 5) {
      if (!data.matchDuration || !data.breakBetween || !data.court || !data.timeSlot) {
        showToast.error("Please fill match duration, break, court and time slot before continuing.");
        return;
      }
    }
    if (!completed.includes(step)) setCompleted(c => [...c, step]);
    if (step < 6) setStep(s => s + 1);
  };

  const goPrev = () => { if (step > 1) setStep(s => s - 1); };

  const handleSubmitToBackend = async () => {
    try {
      setSaving(true);
      if (!data.name || !data.description || !data.startDate || !data.endDate || !data.regDeadline || !data.maxTeams || !data.entryFee) {
        showToast.error("Please complete all required fields before publishing.");
        return;
      }
      const venueRes = await axios.get(`${API_BASE}/api/venue/my-venue`, { withCredentials: true });
      if (!venueRes.data?.success || !venueRes.data.data?._id) {
        showToast.error("Your venue could not be loaded. Please create or update your venue first.");
        return;
      }
      const venueId = venueRes.data.data._id;

      let bannerImageUrl = null;
      if (data.bannerFile) {
        const formData = new FormData();
        formData.append("file", data.bannerFile);
        const uploadRes = await axios.post(`${base}/api/upload/file`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        if (!uploadRes.data?.success || !uploadRes.data.url) { showToast.error("Banner upload failed."); return; }
        bannerImageUrl = uploadRes.data.url;
      }

      const paymentMethods = [];
      if (data.paymentMethod === "online" || data.paymentMethod === "both") paymentMethods.push("online");
      if (data.paymentMethod === "cash" || data.paymentMethod === "both") paymentMethods.push("cash");

      const prizesPayload = Object.entries(data.prizes).map(([key, p]) => ({
        title: p.label,
        type: key === "winner" ? "winner" : key === "runnerUp" ? "runner_up" : key === "bestPlayer" ? "best_player"
          : key === "topScorer" ? "top_scorer" : key === "bestGoalkeeper" ? "best_goalkeeper"
          : key === "risingPlayer" ? "rising_player" : "custom",
        enabled: p.enabled,
        amount: Number(p.amount) || 0,
        reward: p.label,
      }));

      const payload = {
        venueId, name: data.name, description: data.description,
        bannerImage: bannerImageUrl, startDate: data.startDate,
        endDate: data.endDate, registrationDeadline: data.regDeadline,
        maxTeams: Number(data.maxTeams), minPlayersPerTeam: 5,
        entryFeePerTeam: Number(data.entryFee), paymentMethods,
        format: data.format, prizes: prizesPayload,
      };

      const res = await createTournament(payload);
      if (!res?.success) { showToast.error(res?.message || "Failed to create tournament."); return; }
      showToast.success("Tournament created successfully.");
    } catch (err) {
      console.error("Tournament create error", err);
      showToast.error(err.response?.data?.message || "Failed to create tournament.");
    } finally {
      setSaving(false);
    }
  };

  const StepComp = STEP_COMPONENTS[step - 1];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <FutsalOwnerSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? "ml-20" : "ml-64"}`}>
        <Header />

        <main className="p-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Create Tournament</h1>
              <p className="text-sm text-gray-500">
                Set up the tournament details, registration and prizes for your futsal venue.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/futsalowner/my-tournaments")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition shrink-0"
            >
              <List className="w-4 h-4" />
              My Tournaments
            </button>
          </div>

          <div className="max-w-5xl">
            <div className="mb-6">
              <StepIndicator current={step} completed={completed} />
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-4">
              <StepComp data={data} setData={setData} />
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                type="button"
                onClick={goPrev}
                disabled={step === 1}
                className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                  step === 1
                    ? "border-gray-200 text-gray-400 bg-white cursor-not-allowed"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              {step < 6 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="px-5 py-2 rounded-lg bg-emerald-600 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  Next step
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitToBackend}
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-emerald-600 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Create tournament"}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}