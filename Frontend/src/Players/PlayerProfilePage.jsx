import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  User,
  Pencil,
  ShieldCheck,
  Info,
  CheckCircle2,
  Loader2,
  X,
  ChevronDown,
} from "lucide-react";

import PlayerSidebar from "./PlayerSidebar";
import PlayerHeader from "./PlayerHeader";
import { useAuthStore } from "../store/authStore";
import { showToast } from "../FutsalOwner/components/Toast";
import {
  getMyEndorsement,
  getPlayerRatingSummary,
  upsertEndorsement,
} from "../store/endorsementService";

const SKILLS = ["Shooting", "Passing", "Dribbling", "Defense", "Goalkeeping", "Teamwork"];
const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward", "Winger"];

const round1 = (n) => Math.round(n * 10) / 10;

const calcOverallFromDistribution = (dist) => {
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  if (!total) return 0;
  const sum = 5 * dist[5] + 4 * dist[4] + 3 * dist[3] + 2 * dist[2] + 1 * dist[1];
  return round1(sum / total);
};

const starColor = "#22C55E";
const bg = "#ffffff";

function RatingRing({ rating, size = 84 }) {
  const r = 34;
  const circumference = 2 * Math.PI * r;
  const percent = Math.max(0, Math.min(1, rating / 5));
  const dashOffset = circumference * (1 - percent);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 84 84" className="block">
        <circle cx="42" cy="42" r={r} stroke="rgba(34,197,94,0.15)" strokeWidth="10" fill="none" />
        <circle
          cx="42"
          cy="42"
          r={r}
          stroke={starColor}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 42 42)"
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900">{rating.toFixed(1)}</span>
          <span className="text-sm text-gray-500">/ 5</span>
        </div>
        <div className="mt-0.5 text-xs text-gray-500">Overall</div>
      </div>
    </div>
  );
}

function Tooltip({ text }) {
  return (
    <div className="group relative inline-flex items-center">
      <Info className="w-4 h-4 text-gray-500" />
      <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-white border border-gray-200 text-gray-700 text-xs px-3 py-2 rounded-lg shadow-lg">
          {text}
        </div>
      </div>
    </div>
  );
}

function SkillMultiSelect({ value, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onDoc = (e) => {
      // Close if clicking outside.
      const target = e.target;
      if (!target) return;
      if (target.closest?.("[data-skill-root]")) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const toggle = (skill) => {
    if (disabled) return;
    if (value.includes(skill)) onChange(value.filter((s) => s !== skill));
    else onChange([...value, skill]);
  };

  return (
    <div className="relative" data-skill-root>
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className="w-full flex flex-wrap items-center gap-2 justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <div className="flex flex-wrap gap-2 items-center">
          {value.length === 0 ? (
            <span className="text-gray-500 text-sm">Select skills (required)</span>
          ) : (
            value.map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-700"
              >
                {s}
              </span>
            ))
          )}
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          className="text-gray-500"
          aria-hidden="true"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute z-20 left-0 right-0 mt-2 rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto p-2">
              {SKILLS.map((skill) => {
                const selected = value.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggle(skill)}
                    className={`w-full text-left rounded-lg px-3 py-2.5 transition flex items-center justify-between ${
                      selected
                        ? "bg-emerald-500/10 border border-emerald-500/20"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-gray-700 text-sm">{skill}</span>
                    {selected ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-gray-300" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-500">
                {value.length} selected
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StarSelector({ value, onChange, disabled = false }) {
  const [hover, setHover] = useState(0);

  const active = hover || value;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const isActive = n <= active;
        return (
          <motion.button
            key={n}
            type="button"
            disabled={disabled}
            className="relative"
            onMouseEnter={() => !disabled && setHover(n)}
            onMouseLeave={() => !disabled && setHover(0)}
            onClick={() => !disabled && onChange(n)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.12 }}
            aria-label={`${n} star`}
          >
            <Star
              className="w-9 h-9"
              strokeWidth={1.5}
              color={isActive ? starColor : "rgba(148,163,184,0.6)"}
              fill={isActive ? starColor : "transparent"}
            />
          </motion.button>
        );
      })}
    </div>
  );
}

function ModalShell({ isOpen, title, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
            role="button"
            tabIndex={-1}
          />
          <motion.div
            initial={{ y: 18, opacity: 0, scale: 0.99 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 14, opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold">{title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Anonymous & privacy-safe</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition rounded-lg p-1 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function mockPlayerProfile(playerId) {
  const seed = Number(String(playerId).replace(/\D/g, "").slice(0, 6) || 0);
  const isCaptain = seed % 4 === 0;
  const positions = ["Midfielder", "Forward", "Defender", "Goalkeeper", "Winger"];
  const preferredPosition = positions[seed % positions.length];

  const namePool = ["Aarav", "Sara", "Mike", "Alex", "Emma", "David", "Rahul", "Suman", "Ishan", "Nisha"];
  const lastPool = ["Khan", "Sharma", "Gautam", "Thapa", "Giri", "Joshi", "Paudel", "Bista", "Koirala", "Adhikari"];
  const name = `${namePool[seed % namePool.length]} ${lastPool[(seed * 3) % lastPool.length]}`;
  const username = name.toLowerCase().replace(/\s+/g, "_");

  const avatarSeed = encodeURIComponent(username);
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;

  return {
    _id: String(playerId),
    avatar,
    name,
    username,
    role: isCaptain ? "Captain" : "Player",
    preferredPosition,
  };
}

const PlayerProfilePage = () => {
  const params = useParams();
  const { user } = useAuthStore();

  const currentUserId = user?._id?.toString?.() || user?.id?.toString?.() || "";
  const playerIdFromRoute = params?.playerId?.toString?.() || "";
  const playerId = playerIdFromRoute || currentUserId;

  const isOwnProfile = !!playerId && !!currentUserId && playerId === currentUserId;

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [profile, setProfile] = useState(() => mockPlayerProfile(playerId || "unknown"));

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [ratingSummary, setRatingSummary] = useState({
    overallRating: 0,
    endorsementsCount: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  const [myEndorsement, setMyEndorsement] = useState(null);

  const [endorseOpen, setEndorseOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [comment, setComment] = useState("");

  const [editPreferredPosition, setEditPreferredPosition] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);

  const myHasEndorsed = !!myEndorsement;

  const overallRatingComputed = useMemo(() => {
    return calcOverallFromDistribution(ratingSummary.distribution);
  }, [ratingSummary.distribution]);

  useEffect(() => {
    setProfile(mockPlayerProfile(playerId || "unknown"));
  }, [playerId]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setSummaryLoading(true);
      try {
        const [summary, my] = await Promise.all([
          getPlayerRatingSummary(playerId),
          getMyEndorsement(playerId, currentUserId),
        ]);
        if (!mounted) return;
        setRatingSummary(summary);
        setMyEndorsement(my);
      } catch {
        if (!mounted) return;
        // Keep mock defaults if anything fails.
      } finally {
        if (mounted) setSummaryLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, currentUserId]);

  useEffect(() => {
    // If profile changes due to playerId, initialize edit field.
    setEditPreferredPosition(profile.preferredPosition);
  }, [profile.preferredPosition]);

  const openEndorseModal = () => {
    if (isOwnProfile) return;
    setSelectedRating(myEndorsement?.rating || 0);
    setSelectedSkills(myEndorsement?.skills || []);
    setComment("");
    setEndorseOpen(true);
  };

  const closeEndorseModal = () => {
    setEndorseOpen(false);
    setSelectedRating(0);
    setSelectedSkills([]);
    setComment("");
  };

  const handleSubmitEndorsement = async () => {
    if (isOwnProfile) return;
    if (!selectedRating) {
      showToast.error("Select a star rating first");
      return;
    }
    if (!selectedSkills.length) {
      showToast.error("Select at least one skill");
      return;
    }

    setSubmitting(true);
    try {
      await upsertEndorsement({
        playerId,
        userId: currentUserId,
        rating: selectedRating,
        skills: selectedSkills,
        comment,
      });

      setMyEndorsement({
        rating: selectedRating,
        skills: selectedSkills,
        comment: comment || "",
        updatedAt: Date.now(),
      });

      // Update aggregated UI locally (anonymous & aggregated).
      setRatingSummary((prev) => {
        const nextDist = { ...prev.distribution };
        const wasUpdate = !!myEndorsement;
        const oldRating = myEndorsement?.rating || 0;

        if (wasUpdate && oldRating) {
          nextDist[oldRating] = Math.max(0, (nextDist[oldRating] || 0) - 1);
        }

        nextDist[selectedRating] = (nextDist[selectedRating] || 0) + 1;

        const endorsementsCount = Object.values(nextDist).reduce((a, b) => a + b, 0);
        const overallRating = calcOverallFromDistribution(nextDist);
        return { ...prev, distribution: nextDist, endorsementsCount, overallRating };
      });

      showToast.success(myHasEndorsed ? "Endorsement updated successfully" : "Player endorsed successfully");
      closeEndorseModal();
    } catch (e) {
      showToast.error(e?.response?.data?.message || "Failed to submit endorsement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEditProfile = async () => {
    if (!isOwnProfile) return;
    if (!editPreferredPosition) {
      showToast.error("Preferred position is required");
      return;
    }

    setEditing(true);
    try {
      // UI-only edit (future-ready: connect to backend)
      await new Promise((r) => setTimeout(r, 400));
      setProfile((p) => ({ ...p, preferredPosition: editPreferredPosition }));
      showToast.success("Profile updated");
      setEditOpen(false);
    } catch {
      showToast.error("Failed to update profile");
    } finally {
      setEditing(false);
    }
  };

  const infoText = "All endorsements are anonymous";

  const ratingDistSorted = [5, 4, 3, 2, 1];
  const endorsementsCount = ratingSummary.endorsementsCount || 0;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: bg }}>
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? "5rem" : "16rem"})` }}
      >
        <PlayerHeader onMenuToggle={() => {}} sidebarOpen={false} />

        <div className="max-w-6xl mx-auto pt-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Player Profile</h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">
                {isOwnProfile ? "You can edit your profile and view your ratings." : "Anonymous endorsements only."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isOwnProfile ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setEditOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 text-emerald-700 font-semibold hover:bg-emerald-500/15 transition"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Profile
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={openEndorseModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-black font-semibold hover:bg-emerald-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  <Star className="w-4 h-4" />
                  {myHasEndorsed ? "Update Endorsement" : "Endorse Player"}
                </motion.button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-16 h-16 rounded-full border border-gray-200 object-cover"
                    />
                    {/* Future-ready: Verified badge placeholder */}
                    <div className="absolute -bottom-1 -right-1 hidden sm:block">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-gray-900 font-bold text-lg truncate">{profile.name}</h2>
                    </div>
                    <div className="text-gray-500 text-sm mt-1">@{profile.username}</div>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
                          profile.role === "Captain"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-gray-200 bg-gray-100 text-gray-700"
                        }`}
                      >
                        {profile.role}
                      </span>
                      <span className="hidden sm:inline-flex items-center rounded-full border border-gray-200 bg-gray-100 text-xs text-gray-600 px-3 py-1">
                        Future: Top skills highlight
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4">
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <div className="text-gray-700 text-sm font-semibold">Preferred Position</div>
                      </div>
                      <div className="text-emerald-700 font-bold">{profile.preferredPosition}</div>
                    </div>
                  </div>

                  {/* Future-ready placeholders */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="text-xs text-gray-500">Verified badge (coming soon)</div>
                    <div className="mt-2 h-2 w-3/4 bg-gray-200 rounded-full" />
                    <div className="mt-2 h-2 w-1/2 bg-gray-200 rounded-full" />
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-gray-900 font-bold text-lg">Endorsement & Rating</h3>
                        <Tooltip text={infoText} />
                      </div>
                      <div className="text-gray-500 text-sm mt-1">
                        {summaryLoading ? "Loading..." : `${endorsementsCount} endorsements`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isOwnProfile && myHasEndorsed && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-emerald-700 text-sm font-semibold">
                        You have already endorsed this player
                      </div>
                    )}

                    {!isOwnProfile && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={openEndorseModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 text-emerald-700 font-semibold hover:bg-emerald-500/15 transition"
                      >
                        <Star className="w-4 h-4" />
                        {myHasEndorsed ? "Update Endorsement" : "Endorse Player"}
                      </motion.button>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="md:col-span-1 flex justify-center md:justify-start">
                    {summaryLoading ? (
                      <div className="w-[84px] h-[84px] rounded-full border border-gray-200 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-emerald-300 animate-spin" />
                      </div>
                    ) : (
                      <RatingRing rating={overallRatingComputed} />
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    {summaryLoading ? (
                      <div className="space-y-3">
                        {ratingDistSorted.map((n) => (
                          <div key={n} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                            <div className="h-2 bg-gray-200 rounded-full w-3/4" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      ratingDistSorted.map((n) => {
                        const count = ratingSummary.distribution?.[n] || 0;
                        const pct = endorsementsCount ? (count / endorsementsCount) * 100 : 0;
                        return (
                          <div key={n} className="flex items-center gap-3">
                            <div className="w-16 text-sm text-gray-700 font-semibold flex items-center gap-1">
                              <span className="inline-flex items-center">
                                {n}⭐
                              </span>
                            </div>
                            <div className="flex-1 rounded-full h-2.5 bg-gray-200 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-emerald-500"
                                initial={false}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                              />
                            </div>
                            <div className="w-14 text-right text-xs text-gray-500">{count}</div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Skills bars placeholder */}
                <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-gray-900 font-semibold">Skill bars (coming soon)</div>
                    <div className="text-xs text-gray-500">Match-based endorsements (future)</div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {["Shooting", "Passing", "Dribbling"].map((s, idx) => (
                      <div key={s} className="flex items-center gap-3">
                        <div className="w-20 text-xs text-gray-500">{s}</div>
                        <div className="flex-1 rounded-full h-2.5 bg-gray-200 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-emerald-500/70"
                            initial={{ width: 0 }}
                            animate={{ width: `${30 + idx * 12}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.05 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {isOwnProfile && (
                  <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-700 text-sm">
                    You can edit your profile, but you can only endorse other players.
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Endorsement Modal */}
      <ModalShell
        isOpen={endorseOpen}
        title={myHasEndorsed ? "Update Endorsement" : "Endorse Player"}
        onClose={closeEndorseModal}
      >
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-gray-900 font-semibold">Your star rating</div>
              <div className="text-sm text-gray-500">{selectedRating ? `${selectedRating}/5` : "Pick 1-5 stars"}</div>
            </div>
            <div className="mt-3">
              <StarSelector value={selectedRating} onChange={setSelectedRating} disabled={submitting} />
            </div>
          </div>

          <div>
            <div className="text-gray-900 font-semibold mb-2">Skills (multi-select)</div>
            <SkillMultiSelect
              value={selectedSkills}
              onChange={setSelectedSkills}
              disabled={submitting}
            />
            <div className="text-xs text-gray-500 mt-2">Select at least one skill to continue.</div>
          </div>

          <div>
            <div className="text-gray-900 font-semibold mb-2">Optional comment</div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write an anonymous comment (optional)."
              disabled={submitting}
              className="w-full min-h-24 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            <div className="text-xs text-gray-500 mt-2">
              Your comment is submitted anonymously and not shown with your identity.
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={closeEndorseModal}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitEndorsement}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition disabled:opacity-60"
            >
              {submitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </span>
              ) : myHasEndorsed ? (
                "Submit Update"
              ) : (
                "Submit Endorsement"
              )}
            </button>
          </div>
        </div>
      </ModalShell>

      {/* Edit Profile Modal */}
      <ModalShell isOpen={editOpen} title="Edit Profile" onClose={() => setEditOpen(false)}>
        <div className="space-y-5">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="text-gray-900 font-semibold">Preferred Position</div>
            <div className="mt-3">
              <select
                value={editPreferredPosition}
                disabled={editing}
                onChange={(e) => setEditPreferredPosition(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                {POSITIONS.map((p) => (
                  <option key={p} value={p} className="text-black">
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-gray-500 mt-2">This updates the profile section only (future-ready: full profile editing).</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditOpen(false)}
              disabled={editing}
              className="flex-1 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEditProfile}
              disabled={editing}
              className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition disabled:opacity-60"
            >
              {editing ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Profile"
              )}
            </button>
          </div>
        </div>
      </ModalShell>
    </div>
  );
};

export default PlayerProfilePage;

