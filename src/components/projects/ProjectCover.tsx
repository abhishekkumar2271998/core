import type { ReactNode } from "react";
import type { Project, ProjectCategory } from "@/types";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Deterministic helpers                                                      */
/* -------------------------------------------------------------------------- */

/** FNV-1a hash — stable across server and client. */
export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32 PRNG seeded from a number. Returns values in [0, 1). */
export function seededRandom(seed: number): () => number {
  let a = seed || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Round to one decimal so SVG attributes are identical on server and client. */
const r1 = (n: number) => Math.round(n * 10) / 10;

/* -------------------------------------------------------------------------- */
/*  Screen kinds                                                               */
/* -------------------------------------------------------------------------- */

export type ScreenKind = "dashboard" | "table" | "chat" | "terminal" | "mobile" | "components" | "editor" | "landing";

/** Which generated screens best represent each category (first = cover). */
export const categoryScreens: Record<ProjectCategory, ScreenKind[]> = {
  web: ["dashboard", "table", "landing", "editor"],
  mobile: ["mobile", "landing", "components", "dashboard"],
  "open-source": ["editor", "terminal", "landing", "components"],
  design: ["components", "landing", "editor", "table"],
  tooling: ["terminal", "editor", "table", "dashboard"],
  ai: ["chat", "dashboard", "table", "editor"],
};

export function coverScreenFor(project: Project): ScreenKind {
  const options = categoryScreens[project.category];
  // Landing pages and web apps alternate between their first two screens for variety.
  return project.category === "web" ? options[hashString(project.slug) % 2] : options[0];
}

/* -------------------------------------------------------------------------- */
/*  SVG building blocks                                                        */
/* -------------------------------------------------------------------------- */

const W = 800;
const H = 500;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ScreenContext {
  box: Box;
  rnd: () => number;
  c1: string;
  c2: string;
  slug: string;
  title: string;
}

function Bar({ x, y, w, h = 8, fill = "#fff", o = 0.25 }: { x: number; y: number; w: number; h?: number; fill?: string; o?: number }) {
  return <rect x={r1(x)} y={r1(y)} width={r1(Math.max(0, w))} height={h} rx={h / 2} fill={fill} fillOpacity={o} />;
}

function Panel({ x, y, w, h, o = 0.06, rx = 10 }: Box & { o?: number; rx?: number }) {
  return (
    <rect
      x={r1(x)}
      y={r1(y)}
      width={r1(w)}
      height={r1(h)}
      rx={rx}
      fill="#fff"
      fillOpacity={o}
      stroke="#fff"
      strokeOpacity={0.08}
    />
  );
}

function Decor({ seed }: { seed: number }) {
  const rnd = seededRandom(seed ^ 0x9e3779b9);
  const style = seed % 3;
  const lines: ReactNode[] = [];
  if (style === 0) {
    for (let x = 0; x <= W; x += 50) lines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} />);
    for (let y = 0; y <= H; y += 50) lines.push(<line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} />);
  } else if (style === 1) {
    for (let i = -H; i <= W; i += 28) lines.push(<line key={i} x1={i} y1={H} x2={i + H} y2={0} />);
  } else {
    for (let x = 20; x < W; x += 40) {
      for (let y = 20; y < H; y += 40) {
        lines.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={1.6} fill="#fff" fillOpacity={0.2} stroke="none" />);
      }
    }
  }
  const cx = r1(80 + rnd() * 640);
  const cy = r1(40 + rnd() * 200);
  const ring = r1(140 + rnd() * 120);
  return (
    <g aria-hidden>
      <g stroke="#fff" strokeOpacity={0.09} strokeWidth={1} opacity={0.9}>
        {lines}
      </g>
      <circle cx={cx} cy={cy} r={ring} fill="none" stroke="#fff" strokeOpacity={0.16} strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={r1(ring * 0.62)} fill="none" stroke="#fff" strokeOpacity={0.1} strokeDasharray="4 8" />
      <circle cx={r1(W - cx * 0.6)} cy={r1(H - cy * 0.4)} r={r1(60 + rnd() * 60)} fill="#fff" fillOpacity={0.07} />
    </g>
  );
}

function WindowFrame({ box, label, children }: { box: Box; label: string; children: ReactNode }) {
  const { x, y, w, h } = box;
  const rx = 14;
  const bar = 34;
  return (
    <g>
      <rect x={x + 6} y={y + 14} width={w} height={h} rx={rx} fill="#000" fillOpacity={0.18} />
      <rect x={x} y={y} width={w} height={h} rx={rx} fill="#0b0b12" fillOpacity={0.62} stroke="#fff" strokeOpacity={0.22} />
      <path
        d={`M${x} ${y + rx}a${rx} ${rx} 0 0 1 ${rx} -${rx}H${x + w - rx}a${rx} ${rx} 0 0 1 ${rx} ${rx}V${y + bar}H${x}Z`}
        fill="#fff"
        fillOpacity={0.07}
      />
      <line x1={x} y1={y + bar} x2={x + w} y2={y + bar} stroke="#fff" strokeOpacity={0.12} />
      <circle cx={x + 20} cy={y + bar / 2} r={5} fill="#ff5f57" />
      <circle cx={x + 37} cy={y + bar / 2} r={5} fill="#febc2e" />
      <circle cx={x + 54} cy={y + bar / 2} r={5} fill="#28c840" />
      <rect x={x + w / 2 - 110} y={y + 9} width={220} height={16} rx={8} fill="#fff" fillOpacity={0.1} />
      <text
        x={x + w / 2}
        y={y + 21}
        textAnchor="middle"
        fontSize={10}
        fill="#fff"
        fillOpacity={0.65}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      >
        {label}
      </text>
      {children}
    </g>
  );
}

/* ------------------------------------------------------------------ screens */

function Dashboard({ box, rnd, c1, c2 }: ScreenContext) {
  const { x, y, w, h } = box;
  const side = 118;
  const mx = x + side + 16;
  const mw = w - side - 16;
  const kpiW = (mw - 24) / 3;
  const chartY = y + 86;
  const chartH = Math.min(170, h - 200);
  const points = Array.from({ length: 14 }, (_, i) => {
    const px = mx + 16 + (i * (mw - 32)) / 13;
    const py = chartY + chartH - 24 - (0.25 + rnd() * 0.65) * (chartH - 50);
    return [r1(px), r1(py)] as const;
  });
  const line = points.map(([px, py]) => `${px},${py}`).join(" ");
  const area = `${mx + 16},${chartY + chartH - 16} ${line} ${mx + mw - 16},${chartY + chartH - 16}`;
  const barsY = chartY + chartH + 16;
  const barsH = h - (barsY - y);
  return (
    <g>
      <Panel x={x} y={y} w={side} h={h} o={0.04} />
      <circle cx={x + 22} cy={y + 22} r={9} fill={c1} />
      <Bar x={x + 38} y={y + 18} w={56} o={0.5} />
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i}>
          {i === 1 ? <rect x={x + 8} y={y + 50 + i * 28} width={side - 16} height={22} rx={6} fill={c1} fillOpacity={0.3} /> : null}
          <Bar x={x + 18} y={y + 57 + i * 28} w={40 + rnd() * 44} o={i === 1 ? 0.8 : 0.22} />
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Panel x={mx + i * (kpiW + 12)} y={y} w={kpiW} h={70} />
          <Bar x={mx + i * (kpiW + 12) + 14} y={y + 14} w={kpiW * 0.4} h={6} o={0.3} />
          <Bar x={mx + i * (kpiW + 12) + 14} y={y + 30} w={kpiW * (0.35 + rnd() * 0.25)} h={14} o={0.85} />
          <Bar x={mx + i * (kpiW + 12) + 14} y={y + 52} w={30} h={6} fill={i === 2 ? "#f87171" : "#4ade80"} o={0.8} />
        </g>
      ))}
      <Panel x={mx} y={chartY} w={mw} h={chartH} />
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={mx + 16} x2={mx + mw - 16} y1={r1(chartY + chartH * f)} y2={r1(chartY + chartH * f)} stroke="#fff" strokeOpacity={0.07} />
      ))}
      <polygon points={area} fill={c1} fillOpacity={0.28} />
      <polyline points={line} fill="none" stroke={c2} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={points[9][0]} cy={points[9][1]} r={5} fill="#fff" stroke={c2} strokeWidth={3} />
      {barsH > 40 ? (
        <>
          <Panel x={mx} y={barsY} w={mw * 0.58} h={barsH} />
          {Array.from({ length: 10 }, (_, i) => {
            const bh = (0.3 + rnd() * 0.6) * (barsH - 30);
            const bw = (mw * 0.58 - 40) / 10 - 6;
            return (
              <rect
                key={i}
                x={r1(mx + 20 + i * (bw + 6))}
                y={r1(barsY + barsH - 14 - bh)}
                width={r1(bw)}
                height={r1(bh)}
                rx={3}
                fill={i === 6 ? c2 : "#fff"}
                fillOpacity={i === 6 ? 0.9 : 0.2}
              />
            );
          })}
          <Panel x={mx + mw * 0.58 + 12} y={barsY} w={mw * 0.42 - 12} h={barsH} />
          <circle
            cx={r1(mx + mw * 0.79 + 6)}
            cy={r1(barsY + barsH / 2)}
            r={r1(Math.min(46, barsH / 2 - 14))}
            fill="none"
            stroke={c1}
            strokeWidth={12}
            strokeDasharray="160 400"
            strokeOpacity={0.9}
          />
        </>
      ) : null}
    </g>
  );
}

function Table({ box, rnd, c1, c2 }: ScreenContext) {
  const { x, y, w, h } = box;
  const rowH = 36;
  const rows = Math.max(3, Math.floor((h - 90) / rowH));
  const statusColors = ["#4ade80", "#facc15", c2];
  return (
    <g>
      <rect x={x} y={y} width={w * 0.38} height={28} rx={8} fill="#fff" fillOpacity={0.08} />
      <Bar x={x + 14} y={y + 10} w={w * 0.16} o={0.3} />
      <rect x={x + w - 110} y={y} width={110} height={28} rx={14} fill={c1} />
      <Bar x={x + w - 88} y={y + 10} w={66} o={0.9} />
      <rect x={x + w - 210} y={y} width={88} height={28} rx={14} fill="none" stroke="#fff" strokeOpacity={0.3} />
      <Bar x={x + w - 190} y={y + 10} w={48} o={0.5} />
      <Panel x={x} y={y + 44} w={w} h={h - 44} />
      {[0.04, 0.34, 0.58, 0.8].map((f, i) => (
        <Bar key={i} x={x + w * f + 8} y={y + 60} w={[60, 50, 44, 40][i]} h={6} o={0.4} />
      ))}
      <line x1={x} x2={x + w} y1={y + 78} y2={y + 78} stroke="#fff" strokeOpacity={0.1} />
      {Array.from({ length: rows }, (_, i) => {
        const ry = y + 86 + i * rowH;
        const sc = statusColors[Math.floor(rnd() * statusColors.length)];
        return (
          <g key={i}>
            {i === 2 ? <rect x={x + 4} y={ry - 4} width={w - 8} height={rowH - 4} rx={6} fill={c1} fillOpacity={0.16} /> : null}
            <circle cx={x + w * 0.04 + 16} cy={ry + 12} r={9} fill={i % 2 ? c1 : c2} fillOpacity={0.85} />
            <Bar x={x + w * 0.04 + 32} y={ry + 8} w={60 + rnd() * 70} o={0.6} />
            <Bar x={x + w * 0.34 + 8} y={ry + 8} w={40 + rnd() * 60} o={0.3} />
            <Bar x={x + w * 0.58 + 8} y={ry + 8} w={30 + rnd() * 40} o={0.3} />
            <rect x={x + w * 0.8 + 8} y={ry + 3} width={64} height={18} rx={9} fill={sc} fillOpacity={0.22} />
            <circle cx={x + w * 0.8 + 20} cy={ry + 12} r={3} fill={sc} />
            <Bar x={x + w * 0.8 + 28} y={ry + 9} w={36} h={6} fill={sc} o={0.8} />
            <line x1={x + 12} x2={x + w - 12} y1={ry + rowH - 6} y2={ry + rowH - 6} stroke="#fff" strokeOpacity={0.05} />
          </g>
        );
      })}
    </g>
  );
}

function Chat({ box, rnd, c1, c2 }: ScreenContext) {
  const { x, y, w, h } = box;
  const side = 150;
  const mx = x + side + 16;
  const mw = w - side - 16;
  const messages = [
    { me: true, lines: 1 },
    { me: false, lines: 3, cite: true },
    { me: true, lines: 2 },
    { me: false, lines: 2, cite: true },
  ];
  let cy = y + 8;
  return (
    <g>
      <Panel x={x} y={y} w={side} h={h} o={0.04} />
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          {i === 0 ? <rect x={x + 8} y={y + 10} width={side - 16} height={40} rx={8} fill={c1} fillOpacity={0.25} /> : null}
          <circle cx={x + 26} cy={y + 30 + i * 48} r={10} fill={i % 2 ? c2 : c1} fillOpacity={0.8} />
          <Bar x={x + 44} y={y + 22 + i * 48} w={60 + rnd() * 30} h={6} o={0.6} />
          <Bar x={x + 44} y={y + 34 + i * 48} w={40 + rnd() * 40} h={5} o={0.25} />
        </g>
      ))}
      {messages.map((m, i) => {
        const bw = m.me ? mw * (0.38 + rnd() * 0.1) : mw * (0.62 + rnd() * 0.1);
        const bh = 20 + m.lines * 14;
        const bx = m.me ? mx + mw - bw : mx + 34;
        const top = cy;
        cy += bh + (m.cite ? 40 : 16);
        if (top + bh > y + h - 60) return null;
        return (
          <g key={i}>
            {!m.me ? (
              <>
                <circle cx={mx + 12} cy={top + 12} r={12} fill={c2} />
                <path d={`M${mx + 7} ${top + 12}l4 4 7-8`} stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" />
              </>
            ) : null}
            <rect x={r1(bx)} y={top} width={r1(bw)} height={bh} rx={14} fill={m.me ? c1 : "#fff"} fillOpacity={m.me ? 0.9 : 0.09} />
            {Array.from({ length: m.lines }, (_, li) => (
              <Bar
                key={li}
                x={bx + 14}
                y={top + 13 + li * 14}
                w={(bw - 28) * (li === m.lines - 1 ? 0.6 : 0.95)}
                h={6}
                o={m.me ? 0.85 : 0.45}
              />
            ))}
            {m.cite
              ? [0, 1].map((ci) => (
                  <g key={ci}>
                    <rect x={bx + ci * 92} y={top + bh + 8} width={84} height={20} rx={10} fill="none" stroke={c2} strokeOpacity={0.8} />
                    <Bar x={bx + ci * 92 + 12} y={top + bh + 15} w={58} h={6} fill={c2} o={0.8} />
                  </g>
                ))
              : null}
          </g>
        );
      })}
      <rect x={mx} y={y + h - 44} width={mw} height={40} rx={20} fill="#fff" fillOpacity={0.08} stroke="#fff" strokeOpacity={0.15} />
      <Bar x={mx + 18} y={y + h - 28} w={mw * 0.4} o={0.25} />
      <circle cx={mx + mw - 22} cy={y + h - 24} r={14} fill={c2} />
      <path d={`M${mx + mw - 28} ${y + h - 24}h12m-5 -5 5 5-5 5`} stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" />
    </g>
  );
}

function Terminal({ box, c2, slug }: ScreenContext) {
  const { x, y, w } = box;
  const cmd = slug.split("-")[0];
  const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";
  const lines: { text: string; color?: string; o?: number }[] = [
    { text: `$ ${cmd} build --affected`, o: 0.95 },
    { text: "  resolving workspace graph…", o: 0.5 },
    { text: "✓ 42 packages resolved in 1.18s", color: "#4ade80" },
    { text: "● building web, api, docs (3/9 affected)", color: "#facc15" },
    { text: "", o: 0 },
    { text: "✓ web    built in 6.4s   cache: hit", color: "#4ade80" },
    { text: "✓ api    built in 3.1s   cache: miss", color: "#4ade80" },
    { text: "✓ docs   built in 2.7s   cache: hit", color: "#4ade80" },
    { text: `→ preview: https://pr-128.${slug}.dev`, color: c2 },
    { text: "$", o: 0.95 },
  ];
  return (
    <g fontFamily={mono} fontSize={15}>
      {lines.map((line, i) => (
        <text key={i} x={x + 8} y={y + 22 + i * 26} fill={line.color ?? "#fff"} fillOpacity={line.o ?? 1}>
          {line.text}
        </text>
      ))}
      <rect x={x + 8} y={y + 112} width={Math.min(320, w * 0.5)} height={6} rx={3} fill="#fff" fillOpacity={0.1} />
      <rect x={x + 8} y={y + 112} width={Math.min(320, w * 0.5) * 0.66} height={6} rx={3} fill={c2} />
      <rect x={x + 24} y={y + 22 + 9 * 26 - 14} width={9} height={17} fill="#fff" className="animate-blink" />
    </g>
  );
}

function Phone({ x, y, rnd, c1, c2, variant }: { x: number; y: number; rnd: () => number; c1: string; c2: string; variant: number }) {
  const pw = 200;
  const ph = 410;
  return (
    <g>
      <rect x={x + 6} y={y + 14} width={pw} height={ph} rx={34} fill="#000" fillOpacity={0.2} />
      <rect x={x} y={y} width={pw} height={ph} rx={34} fill="#0b0b12" fillOpacity={0.78} stroke="#fff" strokeOpacity={0.3} strokeWidth={2} />
      <rect x={x + pw / 2 - 34} y={y + 12} width={68} height={18} rx={9} fill="#000" />
      <Bar x={x + 20} y={y + 50} w={70} h={10} o={0.85} />
      <circle cx={x + pw - 32} cy={y + 55} r={12} fill={c2} fillOpacity={0.8} />
      {variant === 0 ? (
        <>
          <rect x={x + 16} y={y + 80} width={pw - 32} height={120} rx={20} fill={c1} />
          <circle cx={x + pw / 2} cy={y + 140} r={38} fill="none" stroke="#fff" strokeOpacity={0.3} strokeWidth={8} />
          <circle
            cx={x + pw / 2}
            cy={y + 140}
            r={38}
            fill="none"
            stroke="#fff"
            strokeWidth={8}
            strokeDasharray={`${r1(120 + rnd() * 80)} 240`}
            strokeLinecap="round"
            transform={`rotate(-90 ${x + pw / 2} ${y + 140})`}
          />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={x + 16} y={y + 214 + i * 46} width={pw - 32} height={38} rx={12} fill="#fff" fillOpacity={0.08} />
              <circle cx={x + 36} cy={y + 233 + i * 46} r={9} fill={i % 2 ? c2 : c1} />
              <Bar x={x + 54} y={y + 229 + i * 46} w={60 + rnd() * 40} h={7} o={0.6} />
              <rect x={x + pw - 46} y={y + 225 + i * 46} width={18} height={18} rx={5} fill={i < 2 ? c2 : "none"} stroke="#fff" strokeOpacity={0.4} />
            </g>
          ))}
        </>
      ) : (
        <>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            return (
              <g key={i}>
                <rect
                  x={x + 16 + col * 88}
                  y={y + 80 + row * 98}
                  width={80}
                  height={88}
                  rx={16}
                  fill={i === 0 ? c1 : i === 3 ? c2 : "#fff"}
                  fillOpacity={i === 0 || i === 3 ? 0.85 : 0.08}
                />
                <Bar x={x + 28 + col * 88} y={y + 140 + row * 98} w={44} h={6} o={0.7} />
              </g>
            );
          })}
          <rect x={x + 16} y={y + 376} width={pw - 32} height={20} rx={10} fill="#fff" fillOpacity={0.1} />
        </>
      )}
    </g>
  );
}

function Components({ box, c1, c2 }: ScreenContext) {
  const { x, y, w } = box;
  const col2 = x + w * 0.52;
  return (
    <g>
      <text x={x + 4} y={y + 54} fontSize={56} fontWeight={700} fill="#fff" fillOpacity={0.92}>
        Aa
      </text>
      <Bar x={x + 100} y={y + 22} w={120} h={10} o={0.7} />
      <Bar x={x + 100} y={y + 42} w={80} h={6} o={0.3} />
      {[c1, c2, "#ffffff", "#a1a1aa", "#3f3f46"].map((fill, i) => (
        <circle key={i} cx={col2 + 22 + i * 46} cy={y + 34} r={18} fill={fill} fillOpacity={i > 1 ? 0.6 : 1} stroke="#fff" strokeOpacity={0.25} />
      ))}
      {/* buttons */}
      <rect x={x} y={y + 90} width={120} height={36} rx={18} fill={c1} />
      <Bar x={x + 28} y={y + 104} w={64} o={0.95} />
      <rect x={x + 132} y={y + 90} width={120} height={36} rx={18} fill="none" stroke="#fff" strokeOpacity={0.4} />
      <Bar x={x + 160} y={y + 104} w={64} o={0.6} />
      <rect x={x + 264} y={y + 90} width={36} height={36} rx={18} fill="#fff" fillOpacity={0.12} />
      <path d={`M${x + 274} ${y + 108}h16m-8 -8v16`} stroke="#fff" strokeWidth={2} strokeLinecap="round" />
      {/* toggles */}
      {[true, false].map((on, i) => (
        <g key={i}>
          <rect x={col2 + i * 70} y={y + 94} width={52} height={28} rx={14} fill={on ? c2 : "#fff"} fillOpacity={on ? 1 : 0.15} />
          <circle cx={col2 + i * 70 + (on ? 38 : 14)} cy={y + 108} r={10} fill="#fff" />
        </g>
      ))}
      {/* checkbox */}
      <rect x={col2 + 150} y={y + 96} width={24} height={24} rx={6} fill={c1} />
      <path d={`M${col2 + 156} ${y + 108}l4 4 8-8`} stroke="#fff" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <rect x={col2 + 186} y={y + 96} width={24} height={24} rx={6} fill="none" stroke="#fff" strokeOpacity={0.4} />
      {/* input */}
      <Bar x={x} y={y + 152} w={70} h={6} o={0.5} />
      <rect x={x} y={y + 166} width={w * 0.46} height={40} rx={10} fill="#fff" fillOpacity={0.06} stroke={c1} strokeWidth={2} />
      <Bar x={x + 16} y={y + 182} w={w * 0.2} o={0.5} />
      <rect x={x + 16 + w * 0.2 + 4} y={y + 176} width={2} height={20} fill="#fff" className="animate-blink" />
      {/* slider */}
      <rect x={col2} y={y + 182} width={w * 0.44} height={6} rx={3} fill="#fff" fillOpacity={0.15} />
      <rect x={col2} y={y + 182} width={w * 0.28} height={6} rx={3} fill={c2} />
      <circle cx={col2 + w * 0.28} cy={y + 185} r={11} fill="#fff" stroke={c2} strokeWidth={3} />
      {/* card */}
      <Panel x={x} y={y + 230} w={w * 0.46} h={130} o={0.07} rx={14} />
      <rect x={x + 16} y={y + 246} width={36} height={36} rx={10} fill={c2} fillOpacity={0.9} />
      <Bar x={x + 64} y={y + 252} w={110} h={8} o={0.8} />
      <Bar x={x + 64} y={y + 268} w={70} h={6} o={0.3} />
      <Bar x={x + 16} y={y + 300} w={w * 0.38} h={6} o={0.25} />
      <Bar x={x + 16} y={y + 314} w={w * 0.3} h={6} o={0.25} />
      <rect x={x + 16} y={y + 332} width={56} height={18} rx={9} fill={c1} fillOpacity={0.3} />
      <rect x={x + 78} y={y + 332} width={56} height={18} rx={9} fill={c2} fillOpacity={0.3} />
      {/* avatars + badges */}
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={col2 + 20 + i * 26} cy={y + 252} r={18} fill={[c1, c2, "#f472b6", "#facc15"][i]} stroke="#0b0b12" strokeWidth={3} />
      ))}
      {["#4ade80", "#facc15", "#f87171"].map((fill, i) => (
        <g key={fill}>
          <rect x={col2 + i * 82} y={y + 290} width={72} height={22} rx={11} fill={fill} fillOpacity={0.2} />
          <Bar x={col2 + 14 + i * 82} y={y + 298} w={44} h={6} fill={fill} o={0.9} />
        </g>
      ))}
      <Panel x={col2} y={y + 326} w={w * 0.44} h={34} o={0.05} />
      <Bar x={col2 + 14} y={y + 340} w={w * 0.2} o={0.4} />
    </g>
  );
}

function Editor({ box, rnd, c1, c2 }: ScreenContext) {
  const { x, y, w, h } = box;
  const tree = 120;
  const code = x + tree + 12;
  const preview = w * 0.32;
  const codeW = w - tree - 12 - preview - 12;
  const palette = [c1, c2, "#fbbf24", "#fff", "#fff"];
  const lineCount = Math.floor((h - 10) / 22);
  return (
    <g>
      <Panel x={x} y={y} w={tree} h={h} o={0.04} />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          {i === 3 ? <rect x={x + 6} y={y + 10 + i * 24} width={tree - 12} height={20} rx={5} fill={c1} fillOpacity={0.3} /> : null}
          <rect x={x + 14 + (i % 3 ? 10 : 0)} y={y + 16 + i * 24} width={8} height={8} rx={2} fill={i % 3 ? c2 : "#fbbf24"} fillOpacity={0.7} />
          <Bar x={x + 28 + (i % 3 ? 10 : 0)} y={y + 16 + i * 24} w={40 + rnd() * 30} h={7} o={0.35} />
        </g>
      ))}
      {Array.from({ length: lineCount }, (_, i) => {
        const indent = [0, 1, 1, 2, 2, 2, 1, 0][i % 8] * 18;
        let cx = code + 34 + indent;
        const segs = 1 + Math.floor(rnd() * 3);
        return (
          <g key={i}>
            <text x={code + 18} y={y + 20 + i * 22} fontSize={10} textAnchor="end" fill="#fff" fillOpacity={0.3} fontFamily="ui-monospace, monospace">
              {i + 1}
            </text>
            {i === 5 ? <rect x={code} y={y + 8 + i * 22} width={codeW} height={20} fill="#fff" fillOpacity={0.05} /> : null}
            {Array.from({ length: segs }, (_, s) => {
              const sw = 24 + rnd() * 70;
              const fill = palette[Math.floor(rnd() * palette.length)];
              const el = <Bar key={s} x={cx} y={y + 13 + i * 22} w={Math.min(sw, code + codeW - cx - 8)} h={8} fill={fill} o={fill === "#fff" ? 0.35 : 0.85} />;
              cx += sw + 8;
              return cx < code + codeW ? el : null;
            })}
          </g>
        );
      })}
      <Panel x={x + w - preview} y={y} w={preview} h={h} o={0.07} />
      <rect x={x + w - preview + 14} y={y + 14} width={preview - 28} height={90} rx={10} fill={c1} fillOpacity={0.8} />
      <circle cx={x + w - preview / 2} cy={y + 59} r={22} fill="#fff" fillOpacity={0.25} />
      <Bar x={x + w - preview + 14} y={y + 120} w={preview * 0.7} h={10} o={0.8} />
      <Bar x={x + w - preview + 14} y={y + 140} w={preview * 0.55} h={6} o={0.3} />
      <Bar x={x + w - preview + 14} y={y + 154} w={preview * 0.6} h={6} o={0.3} />
      <rect x={x + w - preview + 14} y={y + 176} width={90} height={28} rx={14} fill={c2} />
    </g>
  );
}

function Landing({ box, rnd, c1, c2, title }: ScreenContext) {
  const { x, y, w, h } = box;
  const cx = x + w / 2;
  const cardW = (w - 40) / 3;
  const cardsY = y + 246;
  return (
    <g>
      <circle cx={x + 12} cy={y + 12} r={10} fill={c1} />
      <text x={x + 30} y={y + 17} fontSize={14} fontWeight={600} fill="#fff" fillOpacity={0.9}>
        {title}
      </text>
      {[0, 1, 2, 3].map((i) => (
        <Bar key={i} x={cx - 120 + i * 64} y={y + 9} w={44} h={7} o={0.35} />
      ))}
      <rect x={x + w - 92} y={y} width={92} height={26} rx={13} fill="#fff" fillOpacity={0.92} />
      <rect x={cx - 80} y={y + 52} width={160} height={22} rx={11} fill={c2} fillOpacity={0.22} stroke={c2} strokeOpacity={0.6} />
      <Bar x={cx - 60} y={y + 60} w={120} h={6} fill={c2} o={0.95} />
      <Bar x={cx - w * 0.32} y={y + 92} w={w * 0.64} h={22} o={0.9} />
      <Bar x={cx - w * 0.22} y={y + 124} w={w * 0.44} h={22} fill={c1} o={0.95} />
      <Bar x={cx - w * 0.28} y={y + 160} w={w * 0.56} h={7} o={0.3} />
      <Bar x={cx - w * 0.2} y={y + 174} w={w * 0.4} h={7} o={0.3} />
      <rect x={cx - 128} y={y + 192} width={120} height={30} rx={15} fill={c1} />
      <Bar x={cx - 104} y={y + 203} w={72} o={0.95} />
      <rect x={cx + 8} y={y + 192} width={120} height={30} rx={15} fill="none" stroke="#fff" strokeOpacity={0.4} />
      <Bar x={cx + 32} y={y + 203} w={72} o={0.6} />
      {cardsY + 30 < y + h
        ? [0, 1, 2].map((i) => (
            <g key={i}>
              <Panel x={x + i * (cardW + 20)} y={cardsY} w={cardW} h={Math.min(150, h - 246)} o={0.07} rx={14} />
              <rect x={x + i * (cardW + 20) + 16} y={cardsY + 16} width={32} height={32} rx={9} fill={i === 1 ? c2 : c1} fillOpacity={0.9} />
              <Bar x={x + i * (cardW + 20) + 16} y={cardsY + 62} w={cardW * (0.45 + rnd() * 0.2)} h={9} o={0.8} />
              <Bar x={x + i * (cardW + 20) + 16} y={cardsY + 80} w={cardW * 0.75} h={6} o={0.28} />
              <Bar x={x + i * (cardW + 20) + 16} y={cardsY + 93} w={cardW * 0.6} h={6} o={0.28} />
            </g>
          ))
        : null}
    </g>
  );
}

/* -------------------------------------------------------------------------- */
/*  MockScreen                                                                 */
/* -------------------------------------------------------------------------- */

interface MockScreenProps {
  kind: ScreenKind;
  project: Pick<Project, "slug" | "title" | "gradient">;
  /** "cover" peeks the window off the bottom edge; "full" shows the whole screen. */
  frame?: "cover" | "full";
  /** Extra seed so multiple screens of the same project differ. */
  variant?: number;
  className?: string;
}

/** Generated, deterministic illustration of a product screen (pure SVG, no ids). */
export function MockScreen({ kind, project, frame = "cover", variant = 0, className }: MockScreenProps) {
  const seed = hashString(`${project.slug}:${kind}:${variant}`);
  const rnd = seededRandom(seed);
  const [c1, c2] = project.gradient;
  const win: Box = frame === "cover" ? { x: 90, y: 64, w: 620, h: 470 } : { x: 36, y: 30, w: 728, h: 440 };
  const content: Box = { x: win.x + 18, y: win.y + 34 + 18, w: win.w - 36, h: win.h - 34 - 36 };
  const ctx: ScreenContext = { box: content, rnd, c1, c2, slug: project.slug, title: project.title };

  let body: ReactNode;
  if (kind === "mobile") {
    const top = frame === "cover" ? 70 : 45;
    body = (
      <>
        <Phone x={W / 2 - 220} y={top + 20} rnd={rnd} c1={c1} c2={c2} variant={0} />
        <Phone x={W / 2 + 20} y={top} rnd={rnd} c1={c1} c2={c2} variant={1} />
      </>
    );
  } else {
    const screens: Record<Exclude<ScreenKind, "mobile">, (c: ScreenContext) => ReactNode> = {
      dashboard: Dashboard,
      table: Table,
      chat: Chat,
      terminal: Terminal,
      components: Components,
      editor: Editor,
      landing: Landing,
    };
    const Screen = screens[kind];
    const label = kind === "terminal" ? `~/${project.slug} — zsh` : `${project.slug}.app`;
    body = (
      <WindowFrame box={win} label={label}>
        {Screen(ctx)}
      </WindowFrame>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
      focusable="false"
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      <Decor seed={seed} />
      {body}
    </svg>
  );
}

/** CSS background for a project's gradient with a deterministic highlight. */
export function coverBackground(project: Pick<Project, "slug" | "gradient">, variant = 0): string {
  const seed = hashString(`${project.slug}:${variant}`);
  const gx = 15 + (seed % 70);
  const gy = 5 + ((seed >>> 8) % 40);
  const angle = 115 + ((seed >>> 16) % 50);
  const [c1, c2] = project.gradient;
  return `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.35), transparent 55%), linear-gradient(${angle}deg, ${c1}, ${c2})`;
}

/* -------------------------------------------------------------------------- */
/*  ProjectCover                                                               */
/* -------------------------------------------------------------------------- */

interface ProjectCoverProps {
  project: Project;
  className?: string;
  /** Override the generated screen type. */
  screen?: ScreenKind;
  /** When provided, the cover is exposed to assistive tech with this label. Otherwise decorative. */
  alt?: string;
}

/**
 * Generated cover art: layered gradient background, a deterministic pattern
 * and a mock product screen that reflects the project's category.
 * Defaults to a 16:10 aspect ratio unless a height/aspect class is passed.
 */
export function ProjectCover({ project, className, screen, alt }: ProjectCoverProps) {
  const kind = screen ?? coverScreenFor(project);
  const hasSizing = /(^|\s)(aspect-|h-|min-h-|size-)/.test(className ?? "");
  return (
    <div
      role={alt ? "img" : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
      className={cn("relative isolate overflow-hidden bg-surface-2", !hasSizing && "aspect-[16/10]", className)}
      style={{ backgroundImage: coverBackground(project) }}
    >
      <MockScreen kind={kind} project={project} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5" />
    </div>
  );
}
