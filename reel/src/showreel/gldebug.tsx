import React, {useMemo, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';

/* Isolation: three planes side by side.
     left   — ShaderMaterial, hardcoded solid red
     middle — ShaderMaterial, colour from a uniform
     right  — MeshBasicMaterial, plain blue
   Whichever goes black names the broken link. */

const RED = `void main(){ gl_FragColor = vec4(1.0, 0.1, 0.1, 1.0); }`;
const UNI = `uniform vec3 uC; void main(){ gl_FragColor = vec4(uC, 1.0); }`;
const V = `void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

export const GlDebug: React.FC = () => {
  const f = useCurrentFrame();
  const uni = useMemo(() => ({uC: {value: new THREE.Color('#2743F0')}}), []);
  uni.uC.value = new THREE.Color(f >= 5 ? '#00FF00' : '#FF0000');
  return (
    <AbsoluteFill style={{background: '#333'}}>
      <ThreeCanvas width={1920} height={1080}
        camera={{fov: 60, position: [0, 0, 800], near: 1, far: 4000}}>
        <mesh position={[-360, 0, 0]}>
          <planeGeometry args={[300, 600]} />
          <shaderMaterial vertexShader={V} fragmentShader={RED} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[300, 600]} />
          <shaderMaterial vertexShader={V} fragmentShader={UNI} uniforms={uni} />
        </mesh>
        <mesh position={[360, 0, 0]}>
          <planeGeometry args={[300, 600]} />
          <meshBasicMaterial color="#2743F0" />
        </mesh>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
