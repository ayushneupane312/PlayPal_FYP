import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, Loader2 } from "lucide-react";
import { getTournamentById, getRegisteredTeams } from "../../store/tournamentService";
import { showToast } from "../components/Toast";
import { exportSchedulePdf, slugifyFileName } from "../../utils/exportSchedulePdf";

// ─── Constants ───────────────────────────────────────────────────────────────
const MATCH_W = 176;
const MATCH_H = 64;
const SLOT_H = 32;
const GAP = 24;
const ROUND_GAP = 96;
const LABEL_H = 28;
const NAME_MAX_LEN = 22;
const TEAM_TOKEN_SEP = "|||";

const DEFAULT_TEAMS = [
  "FC Alpha","FC Beta","FC Gamma","FC Delta","FC Epsilon",
  "FC Zeta","FC Eta","FC Theta","FC Iota","FC Kappa","FC Lambda",
];

const encodeTeamToken = (id, name) => `${id}${TEAM_TOKEN_SEP}${name}`;
const decodeTeamName = (token) => {
  if (!token || token === "BYE") return token;
  const idx = token.indexOf(TEAM_TOKEN_SEP);
  return idx >= 0 ? token.slice(idx + TEAM_TOKEN_SEP.length) : token;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const nxt2 = (n) => { let p = 1; while (p < n) p *= 2; return p; };

const shuffleArr = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

const findMatch = (bracket, id) => {
  for (const r of bracket) for (const m of r) if (m.id === id) return m;
  return null;
};

const propagate = (bracket) => {
  const b = bracket.map(r => r.map(m => ({ ...m })));
  for (let r = 1; r < b.length; r++) {
    b[r].forEach((m) => {
      const a = findMatch(b, m.sa);
      const b2 = findMatch(b, m.sb);
      m.t = [a?.w || null, b2?.w || null];
      if (m.t[0] === "BYE" && m.t[1] && m.t[1] !== "BYE") m.w = m.t[1];
      else if (m.t[1] === "BYE" && m.t[0] && m.t[0] !== "BYE") m.w = m.t[0];
      else if (!m.t[0] || !m.t[1]) m.w = null;
    });
  }
  return b;
};

const autobye = (bracket) => {
  const b = bracket.map(r => r.map(m => ({ ...m })));
  b[0].forEach((m) => {
    if (m.t[0] === "BYE" && m.t[1] !== "BYE") m.w = m.t[1];
    else if (m.t[1] === "BYE" && m.t[0] !== "BYE") m.w = m.t[0];
    else if (m.t[0] === "BYE" && m.t[1] === "BYE") m.w = "BYE";
  });
  return propagate(b);
};

const computePositions = (roundsArr) => {
  const pos = [];
  const rowStep = MATCH_H + GAP * 4;
  const r0ys = roundsArr[0].map((_, i) => i * rowStep + 36);
  pos.push(r0ys);
  for (let r = 1; r < roundsArr.length; r++) {
    const prev = pos[r - 1];
    const ys = roundsArr[r].map((_, mi) => {
      const a = prev[mi * 2] ?? 0;
      const b = prev[mi * 2 + 1] ?? a;
      return (a + b) / 2;
    });
    pos.push(ys);
  }
  return pos;
};

const buildHalfBracket = (r0matches, fullBracket) => {
  const rounds = [r0matches];
  let prev = r0matches;
  while (prev.length > 1) {
    const rnd = [];
    for (let i = 0; i < prev.length; i += 2) {
      const a = prev[i];
      const b = prev[i + 1];
      const real = fullBracket.flat().find(
        (bm) => bm.sa === a?.id && bm.sb === b?.id
      );
      if (real) rnd.push(real);
    }
    if (!rnd.length) break;
    rounds.push(rnd);
    prev = rnd;
  }
  return rounds;
};

// ─── SVG helpers ─────────────────────────────────────────────────────────────
const SvgLine = ({ x1, y1, x2, y2 }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2}
    stroke="#22c55e" strokeWidth="1.5" opacity="0.5" />
);

const SvgText = ({ x, y, children, fill = "#888", size = 11, bold = false }) => (
  <text x={x} y={y} textAnchor="middle" fill={fill}
    fontSize={size} fontFamily="sans-serif"
    fontWeight={bold ? "500" : "400"}>
    {children}
  </text>
);

// ─── Match Box ───────────────────────────────────────────────────────────────
const MatchBox = ({ m, x, y, onPick }) => {
  const [hovered, setHovered] = useState(null);

  return (
    <g>
      {/* Outer rect */}
      <rect x={x} y={y} width={MATCH_W} height={MATCH_H} rx="6"
        fill="white" stroke="#d1d5db" strokeWidth="0.8" />
      {/* Divider */}
      <line x1={x} y1={y + SLOT_H} x2={x + MATCH_W} y2={y + SLOT_H}
        stroke="#e5e7eb" strokeWidth="0.6" />

      {[0, 1].map((idx) => {
        const sy = y + idx * SLOT_H;
        const t = m.t[idx];
        const isWinner = m.w && m.w === t && t !== "BYE";
        const isBye = t === "BYE";
        const isEmpty = !t;
        const isLoser = m.w && m.w !== t && t && t !== "BYE";
        const isHov = hovered === idx;

        return (
          <g key={idx}>
            {/* Winner highlight */}
            {isWinner && (
              <rect x={x} y={sy} width={MATCH_W} height={SLOT_H}
                fill="#f0fdf4" rx={idx === 0 ? 6 : 0} />
            )}
            {/* Hover highlight */}
            {isHov && !m.w && t && t !== "BYE" && (
              <rect x={x} y={sy} width={MATCH_W} height={SLOT_H}
                fill="rgba(34,197,94,0.08)" rx="4" />
            )}
            {/* Dot */}
            <circle cx={x + 10} cy={sy + SLOT_H / 2} r="3.5"
              fill={isWinner ? "#22c55e" : isBye ? "#94a3b8" : "#d1d5db"} />
            {/* Name */}
            {(() => {
              const fullName = isBye ? "Bye" : isEmpty ? "—" : (decodeTeamName(t) || "");
              const shortName =
                fullName.length > NAME_MAX_LEN
                  ? fullName.slice(0, NAME_MAX_LEN - 1) + "…"
                  : fullName;
              return (
                <>
                  {fullName && fullName !== "—" && fullName !== "Bye" && (
                    <title>{fullName}</title>
                  )}
                  <text x={x + 20} y={sy + SLOT_H / 2 + 4}
                    fontSize="12" fontFamily="sans-serif"
                    fontWeight={isWinner ? "600" : "400"}
                    fill={
                      isWinner ? "#14532d"
                        : isBye || isEmpty ? "#94a3b8"
                        : isLoser ? "#9ca3af"
                        : "#374151"
                    }>
                    {shortName}
                  </text>
                </>
              );
            })()}
            {/* Clickable overlay */}
            {t && t !== "BYE" && !m.w && (
              <rect x={x} y={sy} width={MATCH_W} height={SLOT_H}
                fill="transparent" style={{ cursor: "pointer" }} rx="4"
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onPick(m.id, t)} />
            )}
          </g>
        );
      })}
    </g>
  );
};

// ─── Trophy Box ──────────────────────────────────────────────────────────────
const TrophyBox = ({ x, y, winner }) => {
  const won = winner && winner !== "BYE";
  const winnerName = won ? decodeTeamName(winner) : "";
  const boxW = 100;
  return (
    <g>
      <rect x={x} y={y} width={boxW} height={MATCH_H} rx="8"
        fill={won ? "#f0fdf4" : "#f9fafb"}
        stroke={won ? "#22c55e" : "#e5e7eb"} strokeWidth="1.2" />
      <text x={x + boxW / 2} y={y + 22} textAnchor="middle" fontSize="18">🏆</text>
      {won && <title>{winnerName}</title>}
      <text x={x + boxW / 2} y={y + 46} textAnchor="middle" fontSize="11" fontFamily="sans-serif"
        fontWeight="600" fill={won ? "#14532d" : "#94a3b8"}>
        {won
          ? winnerName.length > 14
            ? winnerName.slice(0, 13) + "…"
            : winnerName
          : "Champion"}
      </text>
    </g>
  );
};

// ─── Single-sided bracket ────────────────────────────────────────────────────
const SingleBracket = ({ bracket, onPick }) => {
  const rounds = bracket.length;
  const positions = computePositions(bracket);
  const totalH = positions[0][positions[0].length - 1] + MATCH_H + 20 + LABEL_H;
  const totalW = rounds * (MATCH_W + ROUND_GAP) + ROUND_GAP / 2 + 90;
  const champion = bracket[rounds - 1]?.[0]?.w;

  return (
    <svg width={totalW} height={totalH} viewBox={`0 0 ${totalW} ${totalH}`}
      style={{ display: "block", overflow: "visible" }}>
      {/* Connector lines */}
      {bracket.slice(1).map((rnd, ri) =>
        rnd.map((m, mi) => {
          const r = ri + 1;
          const x1 = (r - 1) * (MATCH_W + ROUND_GAP) + ROUND_GAP / 2 + MATCH_W;
          const x2 = r * (MATCH_W + ROUND_GAP) + ROUND_GAP / 2;
          const yA = positions[r - 1][mi * 2] + SLOT_H / 2 + LABEL_H;
          const yB = positions[r - 1][mi * 2 + 1] !== undefined
            ? positions[r - 1][mi * 2 + 1] + SLOT_H / 2 + LABEL_H : yA;
          const yM = positions[r][mi] + SLOT_H / 2 + LABEL_H;
          const midX = (x1 + x2) / 2;
          return (
            <g key={m.id}>
              <SvgLine x1={x1} y1={yA} x2={midX} y2={yA} />
              <SvgLine x1={midX} y1={yA} x2={midX} y2={yB} />
              <SvgLine x1={midX} y1={yB} x2={x1} y2={yB} />
              <SvgLine x1={midX} y1={yM} x2={x2} y2={yM} />
            </g>
          );
        })
      )}
      {/* Champion line */}
      {(() => {
        const lx = (rounds - 1) * (MATCH_W + ROUND_GAP) + ROUND_GAP / 2 + MATCH_W;
        const ly = positions[rounds - 1][0] + SLOT_H / 2 + LABEL_H;
        return <SvgLine x1={lx} y1={ly} x2={lx + 30} y2={ly} />;
      })()}
      {/* Round labels + match boxes */}
      {bracket.map((rnd, r) => {
        const x = r * (MATCH_W + ROUND_GAP) + ROUND_GAP / 2;
        const lbl =
          r === 0 && rnd.length >= 8
            ? "Round of 16"
            : r === 0
              ? "Round 1"
              : r === rounds - 1
                ? "Final"
                : r === rounds - 2
                  ? "Semi-final"
                  : rnd.length === 4
                    ? "Quarter-final"
                    : `Round ${r + 1}`;
        return (
          <g key={r}>
            <SvgText x={x + MATCH_W / 2} y={14} bold>{lbl}</SvgText>
            {rnd.map((m, mi) => (
              <MatchBox key={m.id} m={m} x={x} y={positions[r][mi] + LABEL_H} onPick={onPick} />
            ))}
          </g>
        );
      })}
      {/* Trophy */}
      <TrophyBox
        x={(rounds - 1) * (MATCH_W + ROUND_GAP) + ROUND_GAP / 2 + MATCH_W + 40}
        y={positions[rounds - 1][0] + LABEL_H}
        winner={champion} />
    </svg>
  );
};

// ─── Double-sided bracket ────────────────────────────────────────────────────
const DoubleBracket = ({ bracket, onPick }) => {
  const half = Math.ceil(bracket[0].length / 2);
  const topMatches = bracket[0].slice(0, half);
  const botMatches = bracket[0].slice(half);
  const finalRounds = bracket.slice(1);

  const topBracket = buildHalfBracket(topMatches, bracket);
  const botBracket = buildHalfBracket(botMatches, bracket);

  const topPos = computePositions(topBracket);
  const botPos = computePositions(botBracket);

  const sideH = Math.max(
    topPos[0][topPos[0].length - 1] + MATCH_H + 20 + LABEL_H,
    botPos[0][botPos[0].length - 1] + MATCH_H + 20 + LABEL_H
  );

  const sideW = topBracket.length * (MATCH_W + ROUND_GAP) + ROUND_GAP / 2;
  const centerX = sideW + ROUND_GAP * 2;
  const totalW = centerX * 2 + MATCH_W + 90;
  const totalH = sideH + 40;
  const midY = totalH / 2;
  const botOffX = totalW - 90;

  const finalPosY = [];
  finalRounds.forEach((rnd) => {
    const perMatch = MATCH_H + GAP * 6;
    const total = rnd.length * perMatch;
    const startY = midY - total / 2;
    finalPosY.push(rnd.map((_, mi) => startY + mi * perMatch));
  });

  const champion = bracket[bracket.length - 1]?.[0]?.w;

  return (
    <svg width={totalW} height={totalH} viewBox={`0 0 ${totalW} ${totalH}`}
      style={{ display: "block", overflow: "visible" }}>

      {/* ── Top half lines ── */}
      {topBracket.slice(1).map((rnd, ri) =>
        rnd.map((m, mi) => {
          const r = ri + 1;
          const x1 = (r - 1) * (MATCH_W + ROUND_GAP) + ROUND_GAP / 2 + MATCH_W;
          const x2 = r * (MATCH_W + ROUND_GAP) + ROUND_GAP / 2;
          const yA = topPos[r - 1][mi * 2] + SLOT_H / 2 + LABEL_H;
          const yB = topPos[r - 1][mi * 2 + 1] !== undefined
            ? topPos[r - 1][mi * 2 + 1] + SLOT_H / 2 + LABEL_H : yA;
          const yM = topPos[r][mi] + SLOT_H / 2 + LABEL_H;
          const midX = (x1 + x2) / 2;
          return (
            <g key={`tl-${m.id}`}>
              <SvgLine x1={x1} y1={yA} x2={midX} y2={yA} />
              <SvgLine x1={midX} y1={yA} x2={midX} y2={yB} />
              <SvgLine x1={midX} y1={yB} x2={x1} y2={yB} />
              <SvgLine x1={midX} y1={yM} x2={x2} y2={yM} />
            </g>
          );
        })
      )}

      {/* ── Bottom half lines (mirrored) ── */}
      {botBracket.slice(1).map((rnd, ri) =>
        rnd.map((m, mi) => {
          const r = ri + 1;
          const rx1 = botOffX - (r - 1) * (MATCH_W + ROUND_GAP) - ROUND_GAP / 2 - MATCH_W;
          const rx2 = botOffX - r * (MATCH_W + ROUND_GAP) - ROUND_GAP / 2;
          const yA = botPos[r - 1][mi * 2] + SLOT_H / 2 + LABEL_H;
          const yB = botPos[r - 1][mi * 2 + 1] !== undefined
            ? botPos[r - 1][mi * 2 + 1] + SLOT_H / 2 + LABEL_H : yA;
          const yM = botPos[r][mi] + SLOT_H / 2 + LABEL_H;
          const midX = (rx1 + rx2) / 2;
          return (
            <g key={`bl-${m.id}`}>
              <SvgLine x1={rx1} y1={yA} x2={midX} y2={yA} />
              <SvgLine x1={midX} y1={yA} x2={midX} y2={yB} />
              <SvgLine x1={midX} y1={yB} x2={rx1} y2={yB} />
              <SvgLine x1={midX} y1={yM} x2={rx2} y2={yM} />
            </g>
          );
        })
      )}

      {/* ── Top half → first final line ── */}
      {finalRounds.length > 0 && (() => {
        const topLastX = topBracket.length * (MATCH_W + ROUND_GAP) + ROUND_GAP / 2 - ROUND_GAP + MATCH_W;
        const topLastY = topPos[topBracket.length - 1][0] + SLOT_H / 2 + LABEL_H;
        const f0x = centerX;
        const f0yA = finalPosY[0][0] + SLOT_H / 2;
        const botLastX = botOffX - botBracket.length * (MATCH_W + ROUND_GAP) - ROUND_GAP / 2 + ROUND_GAP;
        const botLastY = botPos[botBracket.length - 1][0] + SLOT_H / 2 + LABEL_H;
        const f0yB = finalPosY[0][1] !== undefined ? finalPosY[0][1] + SLOT_H / 2 : f0yA;
        const rightEdge = f0x + MATCH_W;
        return (
          <g>
            <SvgLine x1={topLastX} y1={topLastY} x2={topLastX + ROUND_GAP / 2} y2={topLastY} />
            <SvgLine x1={topLastX + ROUND_GAP / 2} y1={topLastY} x2={topLastX + ROUND_GAP / 2} y2={f0yA} />
            <SvgLine x1={topLastX + ROUND_GAP / 2} y1={f0yA} x2={f0x} y2={f0yA} />
            <SvgLine x1={botLastX} y1={botLastY} x2={botLastX - ROUND_GAP / 2} y2={botLastY} />
            <SvgLine x1={botLastX - ROUND_GAP / 2} y1={botLastY} x2={botLastX - ROUND_GAP / 2} y2={f0yB} />
            <SvgLine x1={botLastX - ROUND_GAP / 2} y1={f0yB} x2={rightEdge} y2={f0yB} />
          </g>
        );
      })()}

      {/* ── Final round lines ── */}
      {finalRounds.slice(1).map((rnd, ri) =>
        rnd.map((m, mi) => {
          const r = ri + 1;
          const x1 = centerX + (r - 1) * (MATCH_W + ROUND_GAP) + MATCH_W;
          const x2 = centerX + r * (MATCH_W + ROUND_GAP);
          const yA = finalPosY[r - 1][mi * 2] + SLOT_H / 2;
          const yB = finalPosY[r - 1][mi * 2 + 1] !== undefined
            ? finalPosY[r - 1][mi * 2 + 1] + SLOT_H / 2 : yA;
          const yM = finalPosY[r][mi] + SLOT_H / 2;
          const midX = (x1 + x2) / 2;
          return (
            <g key={`fl-${m.id}`}>
              <SvgLine x1={x1} y1={yA} x2={midX} y2={yA} />
              <SvgLine x1={midX} y1={yA} x2={midX} y2={yB} />
              <SvgLine x1={midX} y1={yB} x2={x1} y2={yB} />
              <SvgLine x1={midX} y1={yM} x2={x2} y2={yM} />
            </g>
          );
        })
      )}

      {/* ── Top half labels + boxes ── */}
      {topBracket.map((rnd, r) => {
        const x = r * (MATCH_W + ROUND_GAP) + ROUND_GAP / 2;
        const lbl = r === 0 ? "Round 1"
          : r === topBracket.length - 1 ? "QF"
          : r === topBracket.length - 2 ? "R2" : `R${r + 1}`;
        return (
          <g key={`tr-${r}`}>
            <SvgText x={x + MATCH_W / 2} y={14} bold>{lbl}</SvgText>
            {rnd.map((m, mi) => (
              <MatchBox key={m.id} m={m} x={x} y={topPos[r][mi] + LABEL_H} onPick={onPick} />
            ))}
          </g>
        );
      })}

      {/* ── Bottom half labels + boxes (mirrored) ── */}
      {botBracket.map((rnd, r) => {
        const rx = botOffX - r * (MATCH_W + ROUND_GAP) - ROUND_GAP / 2 - MATCH_W;
        const lbl = r === 0 ? "Round 1"
          : r === botBracket.length - 1 ? "QF"
          : r === botBracket.length - 2 ? "R2" : `R${r + 1}`;
        return (
          <g key={`br-${r}`}>
            <SvgText x={rx + MATCH_W / 2} y={14} bold>{lbl}</SvgText>
            {rnd.map((m, mi) => (
              <MatchBox key={m.id} m={m} x={rx} y={botPos[r][mi] + LABEL_H} onPick={onPick} />
            ))}
          </g>
        );
      })}

      {/* ── Final round labels + boxes ── */}
      {finalRounds.map((rnd, ri) => {
        const x = centerX + ri * (MATCH_W + ROUND_GAP);
        const lbl = ri === finalRounds.length - 1 ? "Final"
          : ri === finalRounds.length - 2 ? "Semi-final" : "QF";
        const labelY = midY - finalRounds[0].length * (MATCH_H + GAP * 6) / 2 - 12;
        return (
          <g key={`fr-${ri}`}>
            <SvgText x={x + MATCH_W / 2} y={labelY} bold>{lbl}</SvgText>
            {rnd.map((m, mi) => (
              <MatchBox key={m.id} m={m} x={x} y={finalPosY[ri][mi]} onPick={onPick} />
            ))}
          </g>
        );
      })}

      {/* ── Champion trophy ── */}
      {(() => {
        const lastFinalX = centerX + (finalRounds.length - 1) * (MATCH_W + ROUND_GAP) + MATCH_W;
        const lastFinalY = finalPosY[finalRounds.length - 1][0];
        return (
          <g>
            <SvgLine x1={lastFinalX} y1={lastFinalY + SLOT_H / 2}
              x2={lastFinalX + 20} y2={lastFinalY + SLOT_H / 2} />
            <TrophyBox x={lastFinalX + 20} y={lastFinalY} winner={champion} />
          </g>
        );
      })()}
    </svg>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TournamentBracket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [bracket, setBracket] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [tournamentName, setTournamentName] = useState("Tournament");
  const [leaderContacts, setLeaderContacts] = useState([]);
  const [shareCopied, setShareCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const pdfExportRef = useRef(null);
  const bracketPanelRef = useRef(null);
  const isTournamentMode = Boolean(id);
  const shownErrorRef = useRef(false);
  /** Double-sided layout overlaps for 13+ teams; use horizontal scroll single bracket */
  const doubleSided = teams.length > 8 && teams.length <= 12;

  const buildBracket = useCallback((teamList) => {
    const sh = shuffleArr(teamList);
    const sz = nxt2(sh.length);
    const pad = [...sh];
    while (pad.length < sz) pad.push("BYE");

    const r0 = [];
    for (let i = 0; i < pad.length; i += 2) {
      r0.push({ id: `0_${i / 2}`, t: [pad[i], pad[i + 1]], w: null });
    }
    let prev = r0;
    const raw = [r0];
    while (prev.length > 1) {
      const rnd = [];
      for (let i = 0; i < prev.length; i += 2) {
        rnd.push({
          id: `${raw.length}_${i / 2}`,
          t: [null, null], w: null,
          sa: prev[i].id, sb: prev[i + 1]?.id,
        });
      }
      raw.push(rnd);
      prev = rnd;
    }
    setBracket(autobye(raw));
  }, []);

  useEffect(() => {
    const loadTournamentData = async () => {
      if (!id) {
        // Standalone mode fallback (non-tournament route)
        const fallback = DEFAULT_TEAMS.map((name, idx) => encodeTeamToken(`manual-${idx + 1}`, name));
        setTeams(fallback);
        setTournamentName("Tournament");
        setPageLoading(false);
        return;
      }

      try {
        setPageLoading(true);
        const [tournamentRes, registeredRes] = await Promise.all([
          getTournamentById(id),
          getRegisteredTeams(id)
        ]);

        const tournament = tournamentRes?.data ?? tournamentRes;
        const registeredList = registeredRes?.data ?? [];
        const fetchedTeams = registeredList
          .map((r, idx) => {
            const teamId = r?.teamId || r?.team?._id || r?._id;
            let teamName = r?.teamName || r?.team?.name;
            if (!teamId) return null;
            // Keep real registration rows even if team name failed to populate.
            if (!teamName || teamName === "—") {
              teamName = `Team ${idx + 1}`;
            }
            return encodeTeamToken(String(teamId), String(teamName).trim());
          })
          .filter(Boolean);
        const contacts = registeredList
          .map((r) => ({
            teamName: r?.teamName && r?.teamName !== "—" ? r.teamName : "Team",
            leaderName: r?.leader?.name || "Leader",
            email: r?.leader?.email && r?.leader?.email !== "—" ? r.leader.email : "",
            phone: r?.leader?.phone && r?.leader?.phone !== "—" ? r.leader.phone : ""
          }))
          .filter((c) => c.email || c.phone);

        setTournamentName(tournament?.name || "Tournament");
        setLeaderContacts(contacts);

        const isClosed =
          tournament?.status === "registration_closed" ||
          (tournament?.registrationDeadline &&
            new Date(tournament.registrationDeadline) < new Date());

        if (!isClosed) {
          if (!shownErrorRef.current) {
            showToast.error("Schedule is available only after registration closes.");
            shownErrorRef.current = true;
          }
          navigate(`/futsalowner/my-tournaments/${id}`);
          return;
        }

        if (fetchedTeams.length < 2) {
          if (!shownErrorRef.current) {
            showToast.error("At least 2 registered teams are required to generate the schedule.");
            shownErrorRef.current = true;
          }
          navigate(`/futsalowner/my-tournaments/${id}`);
          return;
        }

        setTeams(fetchedTeams);
      } catch (error) {
        console.error("Failed to load tournament schedule data:", error);
        if (!shownErrorRef.current) {
          showToast.error(error?.response?.data?.message || "Failed to load tournament schedule");
          shownErrorRef.current = true;
        }
        navigate(`/futsalowner/my-tournaments/${id}`);
      } finally {
        setPageLoading(false);
      }
    };

    loadTournamentData();
  }, [id, navigate]);

  useEffect(() => {
    if (teams.length >= 2) buildBracket(teams);
  }, [teams, buildBracket]);

  const handlePick = useCallback((id, team) => {
    setBracket((prev) => {
      const updated = prev.map((r) =>
        r.map((m) => m.id === id ? { ...m, w: team } : { ...m })
      );
      return propagate(updated);
    });
  }, []);

  const addTeam = () => {
    const v = inputVal.trim();
    if (!v || isTournamentMode) return;
    const token = encodeTeamToken(`manual-${Date.now()}`, v);
    if (teams.includes(token)) return;
    setTeams((t) => [...t, token]);
    setInputVal("");
  };

  const removeTeam = (i) => {
    if (isTournamentMode) return;
    setTeams((t) => t.filter((_, idx) => idx !== i));
  };

  const gen = () => buildBracket(teams);
  const shuffleGen = () => { const sh = shuffleArr(teams); setTeams(sh); buildBracket(sh); };

  const sz = teams.length ? nxt2(teams.length) : 0;
  const byes = sz - teams.length;
  const note = teams.length < 2
    ? "Need at least 2 teams."
    : `${sz / 2} first-round matches · ${byes} bye(s) · ${doubleSided ? "double" : "single"}-sided bracket${isTournamentMode ? " · from registered teams" : ""}`;

  const getSharePayload = () => {
    const scheduleUrl = window.location.href;
    const contactLines = leaderContacts.length
      ? `\nTeam Leaders:\n${leaderContacts
          .map((c, idx) => `${idx + 1}. ${c.teamName} - ${c.leaderName}${c.email ? ` | ${c.email}` : ""}${c.phone ? ` | ${c.phone}` : ""}`)
          .join("\n")}`
      : "";
    const text =
      `${tournamentName} schedule is ready.\n` +
      `View bracket: ${scheduleUrl}` +
      contactLines;
    return { url: scheduleUrl, text };
  };

  const handleDownloadPdf = async () => {
    if (!bracket.length) {
      showToast.error("Generate the bracket first, then download the PDF.");
      return;
    }
    const root = pdfExportRef.current;
    if (!root) {
      showToast.error("Could not prepare PDF export.");
      return;
    }

    const panel = bracketPanelRef.current;
    const prevMax = panel?.style.maxHeight;
    const prevOverflowY = panel?.style.overflowY;
    const prevOverflowX = panel?.style.overflowX;

    try {
      setPdfLoading(true);
      if (panel) {
        panel.style.maxHeight = "none";
        panel.style.overflowY = "visible";
        panel.style.overflowX = "visible";
      }
      await new Promise((r) => setTimeout(r, 150));

      const fileName = `${slugifyFileName(tournamentName)}-Schedule.pdf`;
      await exportSchedulePdf(root, fileName);
      showToast.success("PDF downloaded — share it with team leaders.");
    } catch (error) {
      console.error("PDF export failed:", error);
      showToast.error("Failed to create PDF. Try again after the bracket is fully visible.");
    } finally {
      if (panel) {
        panel.style.maxHeight = prevMax || "";
        panel.style.overflowY = prevOverflowY || "";
        panel.style.overflowX = prevOverflowX || "";
      }
      setPdfLoading(false);
    }
  };

  const handleShareSchedule = async () => {
    const payload = getSharePayload();
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${tournamentName} - Tournament Schedule`,
          text: payload.text,
          url: payload.url
        });
        return;
      }
      await navigator.clipboard.writeText(payload.text);
      setShareCopied(true);
      showToast.success("Schedule link copied. Share it with team leaders.");
      setTimeout(() => setShareCopied(false), 2000);
    } catch (error) {
      console.error("Share schedule failed:", error);
      showToast.error("Could not share schedule. Please copy the URL manually.");
    }
  };

  if (pageLoading) {
    return (
      <div style={{ fontFamily: "sans-serif", padding: "24px", background: "#f9fafb", minHeight: "100vh" }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "#111827" }}>
          Tournament Schedule
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14 }}>Loading schedule data...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: "16px", background: "#f9fafb", minHeight: "100vh" }}>
      <button
        onClick={() => navigate(id ? `/futsalowner/my-tournaments/${id}` : "/futsalowner/my-tournaments")}
        style={{
          border: "1px solid #d1d5db",
          background: "#fff",
          borderRadius: 8,
          padding: "6px 10px",
          fontSize: 12,
          color: "#374151",
          cursor: "pointer",
          marginBottom: 10,
        }}
      >
        ← Back to Tournament
      </button>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 14, color: "#111827" }}>
        {tournamentName} - Tournament Bracket
      </h2>
      {isTournamentMode && (
        <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={pdfLoading || bracket.length === 0}
            style={{
              height: 34,
              padding: "0 14px",
              borderRadius: 8,
              border: "1px solid #1d4ed8",
              background: pdfLoading ? "#93c5fd" : "#2563eb",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              cursor: pdfLoading || bracket.length === 0 ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {pdfLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {pdfLoading ? "Creating PDF…" : "Download PDF"}
          </button>
          <button
            type="button"
            onClick={handleShareSchedule}
            style={{
              height: 34,
              padding: "0 12px",
              borderRadius: 8,
              border: "1px solid #16a34a",
              background: "#22c55e",
              color: "#14532d",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {shareCopied ? "Copied ✓" : "Share link"}
          </button>
          <span style={{ fontSize: 11, color: "#6b7280" }}>
            Download a PDF to email or message team leaders. Use Share link for the live page URL.
          </span>
        </div>
      )}

      {/* PDF export capture area (teams + bracket + contacts) */}
      <div
        ref={pdfExportRef}
        style={{
          background: "#ffffff",
          borderRadius: 12,
        }}
      >
      <div
        style={{
          padding: "0 0 8px",
          borderBottom: pdfExportRef ? "none" : undefined,
        }}
      >
        <div
          style={{
            padding: "12px 16px 0",
            display: isTournamentMode ? "block" : "none",
          }}
        >
          <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#111827" }}>
            {tournamentName}
          </h3>
          <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>
            Fixture schedule · {teams.length} teams · Generated {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      {/* Input section */}
      <div style={{
        background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
        padding: "14px 16px", marginBottom: 16,
      }}>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
          Teams — <strong>{teams.length}</strong> {isTournamentMode ? "registered" : "added"}
        </div>

        {/* Team tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8, minHeight: 28 }}>
          {teams.map((t, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: "#f3f4f6", border: "1px solid #e5e7eb",
              borderRadius: 8, padding: "3px 8px", fontSize: 11, color: "#374151",
            }}>
              {decodeTeamName(t)}
              <button onClick={() => removeTeam(i)} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 13, color: "#9ca3af", lineHeight: 1, padding: 0,
                visibility: isTournamentMode ? "hidden" : "visible",
              }}>×</button>
            </span>
          ))}
        </div>

        {!isTournamentMode && (
          <div style={{ display: "flex", gap: 6 }}>
            <input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTeam()}
              placeholder="Enter team name..."
              maxLength={28}
              style={{
                flex: 1, height: 32, border: "1px solid #d1d5db", borderRadius: 8,
                padding: "0 10px", fontSize: 12, outline: "none", color: "#111827",
              }}
            />
            <button onClick={addTeam} style={{
              height: 32, padding: "0 12px", fontSize: 12, borderRadius: 8,
              border: "1px solid #d1d5db", background: "#fff", cursor: "pointer",
            }}>Add</button>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          {[
            { label: "Generate bracket", fn: gen, green: true },
            { label: "Shuffle & regenerate", fn: shuffleGen },
          ].map(({ label, fn, green }) => (
            <button key={label} onClick={fn} style={{
              height: 32, padding: "0 12px", fontSize: 12, borderRadius: 8,
              border: "1px solid " + (green ? "#16a34a" : "#d1d5db"),
              background: green ? "#22c55e" : "#fff",
              color: green ? "#14532d" : "#374151",
              fontWeight: green ? 500 : 400, cursor: "pointer",
            }}>{label}</button>
          ))}
        </div>

        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>{note}</div>
      </div>

      {/* Bracket */}
      {bracket.length > 0 && (
        <div
          ref={bracketPanelRef}
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: "20px 24px 28px",
            overflowX: "auto",
            overflowY: "auto",
            maxHeight: "calc(100vh - 220px)",
          }}
        >
          <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 16px" }}>
            {teams.length >= 13
              ? "Scroll horizontally to view the full bracket. Hover a team name to see the full label."
              : "Click a team slot to mark the winner. Hover for full team names."}
          </p>
          <div style={{ minWidth: doubleSided ? undefined : "min(100%, 1100px)", paddingBottom: 12 }}>
            {doubleSided
              ? <DoubleBracket bracket={bracket} onPick={handlePick} />
              : <SingleBracket bracket={bracket} onPick={handlePick} />}
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap", padding: "0 16px 12px" }}>
        {[
          { color: "#22c55e", label: "Winner (click slot to select)" },
          { color: "#94a3b8", label: "Bye (auto-advances)" },
          { color: "#d1d5db", label: "Pending" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6b7280" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
            {label}
          </div>
        ))}
      </div>

      {isTournamentMode && leaderContacts.length > 0 && (
        <div style={{ padding: "8px 16px 20px", borderTop: "1px solid #e5e7eb" }}>
          <h4 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "#111827" }}>
            Team leaders (contact)
          </h4>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
                <th style={{ padding: "6px 8px", border: "1px solid #e5e7eb" }}>Team</th>
                <th style={{ padding: "6px 8px", border: "1px solid #e5e7eb" }}>Leader</th>
                <th style={{ padding: "6px 8px", border: "1px solid #e5e7eb" }}>Email</th>
                <th style={{ padding: "6px 8px", border: "1px solid #e5e7eb" }}>Phone</th>
              </tr>
            </thead>
            <tbody>
              {leaderContacts.map((c, idx) => (
                <tr key={idx}>
                  <td style={{ padding: "6px 8px", border: "1px solid #e5e7eb" }}>{c.teamName}</td>
                  <td style={{ padding: "6px 8px", border: "1px solid #e5e7eb" }}>{c.leaderName}</td>
                  <td style={{ padding: "6px 8px", border: "1px solid #e5e7eb" }}>{c.email || "—"}</td>
                  <td style={{ padding: "6px 8px", border: "1px solid #e5e7eb" }}>{c.phone || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
}