import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {JOST} from '../fonts';

/* ── WHAT WEBGL UNLOCKS ────────────────────────────────────────────────────
   Same section, same badge, same burst — but the things below are all things
   DOM and SVG cannot do at any price, which is why the section has felt
   limited:

     · the burst edge is a NOISE-WARPED signed distance field, so it breaks up
       and undulates instead of being a hard vector scallop
     · CHROMATIC ABERRATION on that edge — red, green and blue sample at
       slightly different radii, which is what makes a transition read as
       optical rather than as a mask
     · the grounds are LIVE fbm flow fields, not CSS gradients — they move
     · the badge is REAL EXTRUDED GEOMETRY under a perspective camera with a
       directional light, so its edge catches and its face shades
     · per-pixel film grain, computed rather than tiled

   All of it deterministic per frame, so it still renders frame-exact and the
   flash sweeps still work. */

const W = 1920, H = 1080;
export const SHADER_DEMO_DUR = 200;

/* the burst edge, the flow fields, the fringing and the grain, in one pass */
const FRAG = `
precision highp float;
uniform float uT;
uniform float uP;
uniform vec2  uRes;
uniform vec3  uA;
uniform vec3  uB;
varying vec2 vUv;

float hash(vec2 p){
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float d = length(p);

  /* the two grounds are moving fields, not flat fills */
  float fa = fbm(p * 1.7 + vec2(uT * 0.0055, uT * 0.0034));
  float fb = fbm(p * 2.2 - vec2(uT * 0.0048, uT * 0.0061));
  vec3 ca = uA * (0.80 + 0.42 * fa);
  vec3 cb = uB * (0.80 + 0.42 * fb);

  /* the burst edge, warped by noise so it breaks up as it travels */
  float warp = fbm(p * 3.4 + uT * 0.02) - 0.5;
  float bite = smoothstep(0.0, 0.22, uP) * (1.0 - smoothstep(0.72, 1.0, uP));
  float r = uP * 1.28 + warp * 0.11 * bite;

  /* chromatic aberration: the channels cross the edge at different radii */
  float w = 0.004 + 0.02 * bite;
  float er = 1.0 - smoothstep(r - w, r + w, d * 0.988);
  float eg = 1.0 - smoothstep(r - w, r + w, d);
  float eb = 1.0 - smoothstep(r - w, r + w, d * 1.012);
  vec3 col = vec3(mix(ca.r, cb.r, er), mix(ca.g, cb.g, eg), mix(ca.b, cb.b, eb));

  /* a bloom-ish lift right on the edge */
  float q = (d - r) * 26.0;
  float ring = exp(-q * q) * bite;
  col += ring * 0.5;

  /* per-pixel grain */
  col += (hash(uv * uRes + uT * 7.3) - 0.5) * 0.035;

  gl_FragColor = vec4(col, 1.0);
}`;

const VERT = `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const hex = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};
/* outgoing → incoming per burst, walking the film's own palette */
const PAIRS: [string, string][] = [
  ['#0A0C0D', '#2743F0'],
  ['#2743F0', '#C33C7A'],
  ['#C33C7A', '#F0AE2E'],
  ['#F0AE2E', '#0A0C0D'],
];
const BURST = 50;

/* the badge, as real extruded geometry rather than an SVG path */
const scallopShape = (R: number, N = 20, depth = 0.045) => {
  const s = new THREE.Shape();
  for (let i = 0; i <= 240; i++) {
    const a = (i / 240) * Math.PI * 2;
    const r = R * (1 + depth * Math.cos(a * N));
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
  }
  return s;
};

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const bi = Math.min(PAIRS.length - 1, Math.floor(f / BURST));
  const p = Math.min(1, (f - bi * BURST) / 26);

  const geo = useMemo(() => new THREE.ExtrudeGeometry(scallopShape(300), {
    depth: 64, bevelEnabled: true, bevelThickness: 10, bevelSize: 9, bevelSegments: 4, curveSegments: 4,
  }), []);

  /* ── THE MATERIAL IS OWNED IMPERATIVELY ─────────────────────────────────
     Passing `uniforms` as a JSX prop hands the object to r3f, which clones it
     into the material at construction — after that, mutating the source
     object goes nowhere, and every frame renders the mount-time values. (The
     still-frame debug hid this: `remotion still` mounts AT the target frame,
     so mount-time values looked live.) Constructing the ShaderMaterial
     ourselves means material.uniforms IS our object, and per-frame mutation
     is genuinely live. */
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uT: {value: 0}, uP: {value: 0}, uRes: {value: new THREE.Vector2(W, H)},
      uA: {value: new THREE.Vector3()}, uB: {value: new THREE.Vector3()},
    },
  }), []);
  mat.uniforms.uT.value = f;
  mat.uniforms.uP.value = p;
  (mat.uniforms.uA.value as THREE.Vector3).copy(hex(PAIRS[bi][0]));
  (mat.uniforms.uB.value as THREE.Vector3).copy(hex(PAIRS[bi][1]));

  /* a real camera move — the badge is geometry, so this is parallax, not scale */
  const yaw = Math.sin(f * 0.021) * 0.20;
  const pitch = Math.cos(f * 0.016) * 0.09;

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[-600, 900, 900]} intensity={3.2} />
      <directionalLight position={[700, -300, 400]} intensity={1.1} color="#83B7D8" />

      {/* the shader ground, sized to fill at its depth */}
      <mesh position={[0, 0, -420]} material={mat}>
        <planeGeometry args={[3100, 1745]} />
      </mesh>

      {/* the badge, extruded, lit, and turning */}
      <mesh geometry={geo} rotation={[pitch, yaw, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#0A0C0D" roughness={0.34} metalness={0.62} />
      </mesh>
    </>
  );
};

export const ShaderDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{background: '#0A0C0D'}}>
      <ThreeCanvas
        width={W}
        height={H}
        camera={{fov: 68, position: [0, 0, 800], near: 1, far: 4000}}
        gl={{antialias: true}}
      >
        <Scene />
      </ThreeCanvas>

      <AbsoluteFill style={{
        alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: JOST, fontWeight: 500, fontSize: 88, color: '#FFFFFF',
          letterSpacing: '-0.02em', textShadow: '0 6px 30px rgba(0,0,0,.5)',
        }}>£2,000,000+</div>
        <div style={{
          marginTop: 18, fontFamily: JOST, fontWeight: 500, fontSize: 26,
          letterSpacing: '0.16em', color: 'rgba(255,255,255,.72)',
        }}>AD SPEND MANAGED</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
