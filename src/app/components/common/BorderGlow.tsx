import {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  useCallback,
  useRef,
} from 'react';
import './BorderGlow.css';

type GlowStyle = CSSProperties & Record<`--${string}`, string | number>;

interface BorderGlowProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  edgeSensitivity?: number;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  coneSpread?: number;
  fillOpacity?: number;
  colors?: [string, string, string];
}

export function getEdgeProximity(
  width: number,
  height: number,
  x: number,
  y: number,
) {
  const cx = width / 2;
  const cy = height / 2;
  const dx = Math.abs(x - cx) / cx;
  const dy = Math.abs(y - cy) / cy;

  return Math.min(Math.max(Math.max(dx, dy), 0), 1);
}

export function getCursorAngle(
  width: number,
  height: number,
  x: number,
  y: number,
) {
  const dx = x - width / 2;
  const dy = y - height / 2;

  if (dx === 0 && dy === 0) return 0;

  const degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  return degrees < 0 ? degrees + 360 : degrees;
}

export default function BorderGlow({
  children,
  className = '',
  edgeSensitivity = 6,
  backgroundColor = 'var(--portfolio-card-bg)',
  borderRadius = 12,
  glowRadius = 18,
  coneSpread = 12,
  fillOpacity = 0,
  colors = [
    'var(--portfolio-card-glow-strong)',
    'var(--portfolio-card-glow-medium)',
    'var(--portfolio-card-glow-faint)',
  ],
  onPointerMove,
  ...props
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const card = cardRef.current;

      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const edge = getEdgeProximity(rect.width, rect.height, x, y);
      const angle = getCursorAngle(rect.width, rect.height, x, y);

      card.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
      card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
      onPointerMove?.(event);
    },
    [onPointerMove],
  );
  const style: GlowStyle = {
    '--card-bg': backgroundColor,
    '--edge-sensitivity': edgeSensitivity,
    '--border-radius': `${borderRadius}px`,
    '--glow-padding': `${glowRadius}px`,
    '--cone-spread': coneSpread,
    '--fill-opacity': fillOpacity,
    '--glow-strong': colors[0],
    '--glow-medium': colors[1],
    '--glow-faint': colors[2],
  };

  return (
    <div
      {...props}
      ref={cardRef}
      className={`border-glow-card ${className}`.trim()}
      style={{ ...style, ...props.style }}
      onPointerMove={handlePointerMove}
    >
      <span className="edge-light" aria-hidden="true" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}
