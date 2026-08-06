import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {ACC, INK, WHITE} from '../theme';
import {JOST} from '../fonts';

/* The ride-hailing beat: pin drops, route draws, the cab runs it, the booking
   lands. A taxi story told in taxi grammar — this is the National Taxi section
   of the reel. Light ground, per the reference. */

export const MAP_DUR = 132;

const ROUTE: Array<[number, number]> = [
  [330, 880],
  [330, 560],
  [760, 560],
  [760, 300],
  [1210, 300],
  [1210, 700],
  [1560, 700],
];

const useRoute = () => {
  return useMemo(() => {
    const segs: Array<{from: [number, number]; to: [number, number]; len: number}> = [];
    let total = 0;
    for (let i = 0; i < ROUTE.length - 1; i++) {
      const [x1, y1] = ROUTE[i];
      const [x2, y2] = ROUTE[i + 1];
      const len = Math.hypot(x2 - x1, y2 - y1);
      segs.push({from: ROUTE[i], to: ROUTE[i + 1], len});
      total += len;
    }
    const pointAt = (t: number) => {
      let d = Math.max(0, Math.min(1, t)) * total;
      for (const s of segs) {
        if (d <= s.len) {
          const p = s.len === 0 ? 0 : d / s.len;
          return {
            x: s.from[0] + (s.to[0] - s.from[0]) * p,
            y: s.from[1] + (s.to[1] - s.from[1]) * p,
            angle:
              (Math.atan2(s.to[1] - s.from[1], s.to[0] - s.from[0]) * 180) /
              Math.PI,
          };
        }
        d -= s.len;
      }
      const last = segs[segs.length - 1];
      return {
        x: last.to[0],
        y: last.to[1],
        angle:
          (Math.atan2(last.to[1] - last.from[1], last.to[0] - last.from[0]) *
            180) /
          Math.PI,
      };
    };
    return {pointAt, d: 'M' + ROUTE.map(([x, y]) => `${x} ${y}`).join(' L ')};
  }, []);
};

const Pin: React.FC<{fill: string}> = ({fill}) => (
  <svg width={54} height={72} viewBox="0 0 54 72">
    <path
      d="M27 0C12 0 0 12 0 27c0 20 27 45 27 45s27-25 27-45C54 12 42 0 27 0Z"
      fill={fill}
    />
    <circle cx={27} cy={26} r={10} fill={WHITE} />
  </svg>
);

const Cab: React.FC = () => (
  <svg width={58} height={30} viewBox="0 0 58 30">
    <rect x={1} y={1} width={56} height={28} rx={9} fill={INK} />
    <rect x={12} y={4.5} width={7} height={21} rx={2.5} fill="#E8ECEF" />
    <rect x={38} y={4.5} width={7} height={21} rx={2.5} fill="#E8ECEF" />
    <rect x={25.5} y={10} width={7} height={10} rx={2} fill={ACC} />
  </svg>
);

export const MapRide: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {pointAt, d} = useRoute();

  const gridIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // pin drop — springs in from above with a real bounce
  const drop = spring({frame: frame - 10, fps, config: {damping: 11, stiffness: 140}});
  const pinY = interpolate(drop, [0, 1], [-150, 0]);

  const draw = interpolate(frame, [24, 66], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const run = interpolate(frame, [60, 112], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const car = pointAt(run);

  const destPop = spring({frame: frame - 66, fps, config: {damping: 12, stiffness: 170}});
  const chip = spring({frame: frame - 106, fps, config: {damping: 13, stiffness: 160}});

  const [sx, sy] = ROUTE[0];
  const [dx2, dy2] = ROUTE[ROUTE.length - 1];

  return (
    <AbsoluteFill style={{background: WHITE}}>
      {/* the town: quiet grid + a park block, nothing shouting */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        style={{opacity: gridIn}}
      >
        {[240, 480, 720, 960, 1200, 1440, 1680].map((x) => (
          <line key={`v${x}`} x1={x} y1={-20} x2={x} y2={1100} stroke="#EAEBED" strokeWidth={16} />
        ))}
        {[180, 420, 660, 900].map((y) => (
          <line key={`h${y}`} x1={-20} y1={y} x2={1940} y2={y} stroke="#EAEBED" strokeWidth={16} />
        ))}
        <line x1={-20} y1={560} x2={1940} y2={560} stroke="#E2E4E7" strokeWidth={30} />
        <line x1={1210} y1={-20} x2={1210} y2={1100} stroke="#E2E4E7" strokeWidth={30} />
        <rect x={1310} y={80} width={430} height={300} rx={26} fill="#E9F3E9" />
        <rect x={130} y={120} width={340} height={230} rx={26} fill="#F2F3F5" />

        {/* the route draws itself */}
        <path
          d={d}
          pathLength={1000}
          fill="none"
          stroke={ACC}
          strokeWidth={16}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={1000}
          strokeDashoffset={1000 - draw * 1000}
        />
      </svg>

      {/* start pin drops in */}
      <div style={{position: 'absolute', left: sx - 27, top: sy - 66 + pinY, opacity: drop}}>
        <Pin fill={INK} />
      </div>

      {/* destination pin pops once the route lands */}
      <div
        style={{
          position: 'absolute',
          left: dx2 - 27,
          top: dy2 - 66,
          transform: `scale(${destPop})`,
          transformOrigin: '50% 100%',
        }}
      >
        <Pin fill={ACC} />
      </div>

      {/* the cab runs the route */}
      <div
        style={{
          position: 'absolute',
          left: car.x,
          top: car.y,
          transform: `translate(-50%, -50%) rotate(${car.angle}deg)`,
          opacity: run > 0 && run < 1 ? 1 : run >= 1 ? 1 : 0,
        }}
      >
        <Cab />
      </div>

      {/* the point of the whole story */}
      <div
        style={{
          position: 'absolute',
          left: dx2 - 150,
          top: dy2 + 40,
          transform: `scale(${chip})`,
          transformOrigin: '20% 0%',
          background: WHITE,
          border: '1px solid rgba(21,22,26,.14)',
          borderRadius: 999,
          padding: '16px 30px',
          boxShadow: '0 22px 60px -20px rgba(0,0,0,.28)',
          fontFamily: JOST,
          fontWeight: 500,
          fontSize: 30,
          color: INK,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <span
          style={{width: 14, height: 14, borderRadius: 7, background: ACC, display: 'inline-block'}}
        />
        Booking confirmed
      </div>
    </AbsoluteFill>
  );
};
