"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Points, PointMaterial } from "@react-three/drei";
import { motion, useReducedMotion } from "framer-motion";
import type { Group } from "three";

type HUDCoreProps = {
  pointer: { x: number; y: number };
  reducedMotion: boolean;
  mobile: boolean;
};

function HUDCore({ pointer, reducedMotion, mobile }: HUDCoreProps) {
  const groupRef = useRef<Group | null>(null);
  const ringA = useRef<Group | null>(null);
  const ringB = useRef<Group | null>(null);
  const ringC = useRef<Group | null>(null);

  const points = useMemo(() => {
    const count = reducedMotion ? 420 : mobile ? 520 : 850;
    const arr: number[] = [];
    for (let i = 0; i < count; i += 1) {
      const radius = 1.35 + Math.random() * 1.1;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
      );
    }
    return new Float32Array(arr);
  }, [mobile, reducedMotion]);

  useFrame((state, delta) => {
    if (!groupRef.current || !ringA.current || !ringB.current || !ringC.current) return;

    const baseFactor = reducedMotion ? 0.1 : mobile ? 0.55 : 1;
    ringA.current.rotation.z += delta * 0.22 * baseFactor;
    ringB.current.rotation.z -= delta * 0.35 * baseFactor;
    ringC.current.rotation.x += delta * 0.18 * baseFactor;
    ringC.current.rotation.y -= delta * 0.2 * baseFactor;

    groupRef.current.rotation.x = pointer.y * (mobile ? 0.18 : 0.25);
    groupRef.current.rotation.y = pointer.x * (mobile ? 0.24 : 0.35);

    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.2) * (mobile ? 0.02 : 0.03);
    groupRef.current.scale.setScalar(pulse);
  });

  const Body = reducedMotion ? "group" : Float;
  const bodyProps = reducedMotion
    ? {}
    : ({
        speed: mobile ? 0.65 : 0.9,
        rotationIntensity: mobile ? 0.28 : 0.45,
        floatIntensity: mobile ? 0.2 : 0.3,
      } as const);

  return (
    <Body {...bodyProps}>
      <group ref={groupRef}>
        <group ref={ringA}>
          <mesh>
            <torusGeometry args={[1.35, 0.035, 22, 160]} />
            <meshBasicMaterial color="#8b5cf6" transparent opacity={0.86} />
          </mesh>
        </group>
        <group ref={ringB} rotation={[Math.PI / 3, 0, 0]}>
          <mesh>
            <torusGeometry args={[1.02, 0.028, 20, 130]} />
            <meshBasicMaterial color="#d946ef" transparent opacity={0.8} />
          </mesh>
        </group>
        <group ref={ringC} rotation={[Math.PI / 2.5, Math.PI / 6, 0]}>
          <mesh>
            <torusGeometry args={[0.72, 0.02, 18, 115]} />
            <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} />
          </mesh>
        </group>

        <mesh>
          <sphereGeometry args={[0.24, 32, 32]} />
          <meshBasicMaterial color="#f7f2ff" transparent opacity={0.16} />
        </mesh>

        <Points positions={points} stride={3}>
          <PointMaterial size={mobile ? 0.017 : 0.02} color="#a8c7ff" transparent opacity={0.4} />
        </Points>
      </group>
    </Body>
  );
}

export function HeroHUD() {
  const shouldReduceMotion = useReducedMotion();
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const sync = () => {
      setIsMobile(window.innerWidth < 768);
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15 }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        setPointer({ x: px, y: py });
      }}
      onMouseLeave={() => setPointer({ x: 0, y: 0 })}
      className="hud-grid relative mx-auto h-[300px] w-full max-w-[760px] overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.2),rgba(3,7,20,0.5)_45%,rgba(2,6,23,0.95)_80%)] shadow-[0_30px_90px_rgba(6,12,28,0.6)] sm:h-[360px] lg:h-[430px]"
    >
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 48 }}
        className="absolute inset-0"
        dpr={[1, isMobile ? 1.15 : 1.5]}
      >
        <ambientLight intensity={0.75} />
        <directionalLight intensity={0.6} position={[2, 2, 2]} color="#d0bcff" />
        <HUDCore pointer={pointer} reducedMotion={Boolean(shouldReduceMotion)} mobile={isMobile} />
      </Canvas>

      <div className="scan-line" />

      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22d3ee] shadow-[0_0_22px_rgba(34,211,238,0.9)]"
        animate={shouldReduceMotion ? {} : { scale: [1, 1.6, 1], opacity: [1, 0.45, 1] }}
        transition={{ duration: isMobile ? 3 : 2.3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      {[0, 120, 240].map((deg, idx) => (
        <motion.span
          key={deg}
          className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/85 shadow-[0_0_14px_rgba(255,255,255,0.8)]"
          animate={
            shouldReduceMotion
              ? { x: Math.cos((deg * Math.PI) / 180) * 80, y: Math.sin((deg * Math.PI) / 180) * 80 }
              : {
                  x: [
                    Math.cos((deg * Math.PI) / 180) * (isMobile ? 78 : 96),
                    Math.cos(((deg + 360) * Math.PI) / 180) * (isMobile ? 78 : 96),
                  ],
                  y: [
                    Math.sin((deg * Math.PI) / 180) * (isMobile ? 78 : 96),
                    Math.sin(((deg + 360) * Math.PI) / 180) * (isMobile ? 78 : 96),
                  ],
                }
          }
          transition={{
            duration: (isMobile ? 10 : 8) + idx * 1.6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}
    </motion.div>
  );
}
