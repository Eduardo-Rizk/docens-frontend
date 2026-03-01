"use client";

import { motion } from "framer-motion";

export function AuthDecor3D() {
  return (
    <div
      className="relative w-full flex items-center justify-center"
      style={{ height: 320, perspective: "700px" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 320,
          height: 320,
          inset: 0,
          margin: "auto",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 65%)",
        }}
      />

      {/* -- Ring 1 -- outer, spins on Y -- */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 240,
          height: 240,
          inset: 0,
          margin: "auto",
          border: "1px solid rgba(255,255,255,0.28)",
        }}
        animate={{ rotateY: 360 }}
        transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
      >
        {/* Orbital dot */}
        <div
          className="absolute rounded-full bg-white"
          style={{
            width: 10,
            height: 10,
            top: "50%",
            left: -5,
            transform: "translateY(-50%)",
            boxShadow: "0 0 18px 5px rgba(255,255,255,0.35)",
          }}
        />
        <div
          className="absolute rounded-full bg-white/40"
          style={{
            width: 6,
            height: 6,
            top: "50%",
            right: -3,
            transform: "translateY(-50%)",
          }}
        />
      </motion.div>

      {/* -- Ring 2 -- middle, spins on X -- */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 170,
          height: 170,
          inset: 0,
          margin: "auto",
          border: "1.5px solid rgba(255,255,255,0.5)",
        }}
        animate={{ rotateX: 360 }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="absolute rounded-full bg-white"
          style={{
            width: 10,
            height: 10,
            top: -5,
            left: "50%",
            transform: "translateX(-50%)",
            boxShadow: "0 0 14px 4px rgba(255,255,255,0.45)",
          }}
        />
        <div
          className="absolute rounded-full bg-white/30"
          style={{
            width: 6,
            height: 6,
            bottom: -3,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      </motion.div>

      {/* -- Ring 3 -- inner, spins on Y inverted -- */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 100,
          height: 100,
          inset: 0,
          margin: "auto",
          border: "2px solid rgba(255,255,255,0.7)",
        }}
        animate={{ rotateY: -360 }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="absolute rounded-full bg-white"
          style={{
            width: 7,
            height: 7,
            bottom: -3.5,
            left: "50%",
            transform: "translateX(-50%)",
            opacity: 0.9,
          }}
        />
      </motion.div>

      {/* -- Center orb -- */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 20,
          height: 20,
          inset: 0,
          margin: "auto",
          background: "white",
          boxShadow:
            "0 0 0 4px rgba(255,255,255,0.15), 0 0 40px 12px rgba(255,255,255,0.18)",
        }}
        animate={{ scale: [1, 1.35, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* -- Outer halo -- */}
      <motion.div
        className="absolute rounded-full border pointer-events-none"
        style={{
          width: 290,
          height: 290,
          inset: 0,
          margin: "auto",
          borderColor: "rgba(255,255,255,0.07)",
        }}
        animate={{ scale: [1, 1.04, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
