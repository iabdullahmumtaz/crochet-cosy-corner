import { PALETTES, type Motif, type PaletteId } from "@/lib/domain";
import { cn } from "@/lib/cn";

export function ProductArt({
  motif,
  palette,
  className,
}: {
  motif: Motif;
  palette: PaletteId;
  className?: string;
}) {
  const tone = PALETTES[palette] ?? PALETTES.cream;
  return (
    <div className={cn("relative aspect-[4/5] overflow-hidden", className)} style={{ background: tone.bg }}>
      <svg viewBox="0 0 240 300" className="h-full w-full" aria-hidden>
        <circle cx="188" cy="52" r="46" fill="#fff" opacity="0.55" />
        <ellipse cx="78" cy="210" rx="34" ry="22" fill={tone.floor} />
        <ellipse cx="120" cy="168" rx="86" ry="78" fill={tone.rug} />
        <ellipse cx="156" cy="214" rx="28" ry="16" fill="#fff" opacity="0.18" />
        <Motif motif={motif} yarn={tone.yarn} accent={tone.accent} detail={tone.detail} />
      </svg>
    </div>
  );
}

function Motif({
  motif,
  yarn,
  accent,
  detail,
}: {
  motif: Motif;
  yarn: string;
  accent: string;
  detail: string;
}) {
  switch (motif) {
    case "gloves":
      return (
        <g>
          <rect x="78" y="108" width="34" height="78" rx="12" fill={yarn} />
          <rect x="128" y="108" width="34" height="78" rx="12" fill={accent} />
          {[0, 1, 2, 3].map((row) => (
            <g key={row}>
              <path d={`M86 ${124 + row * 12}h18`} stroke={detail} strokeWidth="2" />
              <path d={`M136 ${124 + row * 12}h18`} stroke={detail} strokeWidth="2" />
            </g>
          ))}
        </g>
      );
    case "paws":
      return (
        <g>
          <path d="M86 150c0-28 22-40 28-18 8-24 34-16 30 14 8 4 10 22-2 30-10 16-46 18-56 2-8-8-8-20 0-28z" fill={yarn} />
          <path d="M132 154c2-26 24-36 28-14 10-20 32-8 26 18 6 6 4 20-8 26-14 14-42 12-48-4-4-8-2-18 2-26z" fill={accent} />
          <circle cx="96" cy="132" r="5" fill={detail} />
          <circle cx="112" cy="126" r="5" fill={detail} />
          <circle cx="150" cy="132" r="5" fill={detail} />
          <circle cx="166" cy="140" r="5" fill={detail} />
        </g>
      );
    case "scarf":
      return (
        <g>
          <rect x="104" y="78" width="36" height="150" rx="10" fill={yarn} transform="rotate(8 122 150)" />
          <path d="M108 214l6 16M120 220l4 16M132 214l6 16" stroke={accent} strokeWidth="3" strokeLinecap="round" />
          <path d="M112 110h24M114 126h24M116 142h22" stroke={detail} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case "arms":
      return (
        <g>
          <rect x="70" y="96" width="40" height="110" rx="16" fill={yarn} />
          <rect x="130" y="96" width="40" height="110" rx="16" fill={yarn} />
          <path d="M78 118h24M148 118h24M80 136h22M150 136h22" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case "bunny":
      return (
        <g>
          <ellipse cx="104" cy="108" rx="10" ry="28" fill={yarn} />
          <ellipse cx="136" cy="108" rx="10" ry="28" fill={yarn} />
          <ellipse cx="104" cy="112" rx="5" ry="16" fill={accent} />
          <ellipse cx="136" cy="112" rx="5" ry="16" fill={accent} />
          <ellipse cx="120" cy="168" rx="36" ry="40" fill={yarn} />
          <circle cx="108" cy="160" r="2.4" fill={detail} />
          <circle cx="132" cy="160" r="2.4" fill={detail} />
          <path d="M120 176c4 4 8 4 10 0" stroke={detail} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M114 188c6 8 14 8 18-2 2 8-8 12-12 8-6 6-12 2-6-6z" fill={accent} />
        </g>
      );
    case "couple":
      return (
        <g>
          <Bunny x={78} yarn={yarn} accent={accent} detail={detail} />
          <Bunny x={132} yarn={accent} accent={yarn} detail={detail} />
        </g>
      );
    case "miffy":
      return (
        <g>
          <ellipse cx="96" cy="150" rx="28" ry="34" fill={yarn} />
          <ellipse cx="146" cy="156" rx="26" ry="32" fill={accent} />
          <ellipse cx="86" cy="112" rx="7" ry="18" fill={yarn} />
          <ellipse cx="108" cy="110" rx="7" ry="18" fill={yarn} />
          <ellipse cx="136" cy="118" rx="7" ry="16" fill={accent} />
          <ellipse cx="156" cy="120" rx="7" ry="16" fill={accent} />
          <circle cx="90" cy="150" r="2" fill={detail} />
          <circle cx="106" cy="150" r="2" fill={detail} />
          <circle cx="140" cy="156" r="2" fill={detail} />
          <circle cx="154" cy="156" r="2" fill={detail} />
        </g>
      );
    case "keychain":
      return (
        <g>
          <circle cx="120" cy="96" r="16" fill="none" stroke={detail} strokeWidth="4" />
          <path d="M120 112v16" stroke={detail} strokeWidth="3" />
          <circle cx="120" cy="168" r="32" fill={yarn} />
          <circle cx="108" cy="162" r="3" fill={detail} />
          <circle cx="132" cy="162" r="3" fill={detail} />
          <path d="M112 176c6 6 12 6 16 0" stroke={detail} strokeWidth="2" fill="none" />
          <circle cx="120" cy="148" r="8" fill={accent} />
        </g>
      );
    case "flower":
      return (
        <g>
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <ellipse
              key={angle}
              cx="120"
              cy="132"
              rx="14"
              ry="28"
              fill={yarn}
              transform={`rotate(${angle} 120 132)`}
            />
          ))}
          <circle cx="120" cy="132" r="12" fill={accent} />
          <path d="M120 160v62" stroke={detail} strokeWidth="4" strokeLinecap="round" />
          <path d="M120 190c16 8 22 18 16 24" stroke={detail} strokeWidth="3" fill="none" />
        </g>
      );
    case "bouquet":
      return (
        <g>
          <path d="M92 176h56l-8 48h-40z" fill={accent} />
          <circle cx="100" cy="132" r="18" fill={yarn} />
          <circle cx="124" cy="118" r="18" fill={detail} />
          <circle cx="146" cy="136" r="16" fill={yarn} />
          <circle cx="120" cy="146" r="16" fill={accent} />
          <circle cx="108" cy="132" r="5" fill="#5c4030" />
          <circle cx="132" cy="122" r="5" fill="#5c4030" />
          <circle cx="146" cy="136" r="4" fill="#5c4030" />
        </g>
      );
    case "bag":
      return (
        <g>
          <path d="M86 118c10-28 58-28 68 0" fill="none" stroke={detail} strokeWidth="5" strokeLinecap="round" />
          <rect x="78" y="124" width="84" height="78" rx="18" fill={yarn} />
          <path d="M78 146h84" stroke={accent} strokeWidth="8" />
          <circle cx="120" cy="168" r="6" fill={detail} />
        </g>
      );
    case "frog":
      return (
        <g>
          <ellipse cx="120" cy="168" rx="46" ry="40" fill={yarn} />
          <circle cx="96" cy="128" r="16" fill={yarn} />
          <circle cx="144" cy="128" r="16" fill={yarn} />
          <circle cx="96" cy="128" r="7" fill="#fff" />
          <circle cx="144" cy="128" r="7" fill="#fff" />
          <circle cx="98" cy="129" r="3" fill={detail} />
          <circle cx="146" cy="129" r="3" fill={detail} />
          <path d="M108 166c8 8 16 8 24 0" stroke={detail} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M92 150h12M136 150h12" stroke={accent} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case "kit":
      return (
        <g>
          <circle cx="92" cy="150" r="28" fill="#e7a3b0" />
          <circle cx="132" cy="138" r="30" fill={yarn} />
          <circle cx="156" cy="168" r="24" fill={accent} />
          <path d="M70 196c20-8 80-8 104 6" stroke={detail} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M168 188l16 8-8 6" stroke={detail} strokeWidth="3" fill="none" />
        </g>
      );
    case "clip":
      return (
        <g>
          {[0, 50, 100, 150, 200, 250].map((angle) => (
            <ellipse key={angle} cx="120" cy="150" rx="12" ry="24" fill={yarn} transform={`rotate(${angle} 120 150)`} />
          ))}
          <circle cx="120" cy="150" r="10" fill={accent} />
          <rect x="108" y="176" width="24" height="10" rx="4" fill={detail} />
        </g>
      );
    case "phone":
      return (
        <g>
          <rect x="96" y="96" width="52" height="96" rx="12" fill={yarn} />
          <rect x="102" y="108" width="40" height="64" rx="6" fill={accent} />
          <circle cx="122" cy="132" r="8" fill={detail} />
          <path d="M122 124c8 4 10 12 4 16" stroke={yarn} strokeWidth="2" fill="none" />
          <circle cx="122" cy="180" r="3" fill={detail} />
        </g>
      );
    case "bow":
      return (
        <g>
          <ellipse cx="96" cy="150" rx="28" ry="18" fill={yarn} />
          <ellipse cx="146" cy="150" rx="28" ry="18" fill={yarn} />
          <circle cx="120" cy="150" r="8" fill={accent} />
          <path d="M112 156l-10 28M128 156l10 28" stroke={yarn} strokeWidth="8" strokeLinecap="round" />
        </g>
      );
    case "pins":
      return (
        <g>
          <rect x="78" y="124" width="28" height="28" rx="8" fill={yarn} transform="rotate(-8 92 138)" />
          <circle cx="132" cy="132" r="16" fill={accent} />
          <path d="M156 150l16 18-20 4z" fill={detail} />
          <path d="M92 168h8M132 164v10M160 146v8" stroke="#5c4030" strokeWidth="2" />
        </g>
      );
    case "turtle":
      return (
        <g>
          <ellipse cx="120" cy="162" rx="40" ry="28" fill={yarn} />
          <circle cx="156" cy="150" r="12" fill={accent} />
          <path d="M88 170c-8 10-6 16 2 14M112 188c2 10 10 12 12 4M140 190c6 8 14 4 10-4" stroke={detail} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M104 150h32M112 162h28" stroke={detail} strokeWidth="2" />
        </g>
      );
    default:
      return null;
  }
}

function Bunny({
  x,
  yarn,
  accent,
  detail,
}: {
  x: number;
  yarn: string;
  accent: string;
  detail: string;
}) {
  return (
    <g transform={`translate(${x} 108)`}>
      <ellipse cx="14" cy="0" rx="6" ry="16" fill={yarn} />
      <ellipse cx="32" cy="0" rx="6" ry="16" fill={yarn} />
      <ellipse cx="23" cy="36" rx="20" ry="24" fill={yarn} />
      <circle cx="16" cy="32" r="1.8" fill={detail} />
      <circle cx="30" cy="32" r="1.8" fill={detail} />
      <path d="M18 48c4 5 8 4 10-1" fill={accent} />
    </g>
  );
}
