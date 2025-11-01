// src/pages/HomeSplash.tsx
import React from "react";
import { motion } from "framer-motion";

const ORANGE = "#FF785A";

export const HomeSplash: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased flex flex-col relative">
      {/* Logo (exact same position & size as WaitlistPage) */}
      <div className="absolute top-4 left-4 md:top-6 md:left-10">
        <img
          src="/logo.png"
          alt="ARZ Logo"
          className="h-20 md:h-28 lg:h-32 object-contain drop-shadow-lg"
        />
      </div>

      <main className="flex-1 flex items-center justify-center px-6 lg:px-16 pt-28 md:pt-32 pb-12">
        <div className="w-full max-w-5xl text-center relative">
          {/* Background image as before */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url('/home-splash.png')`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              opacity: 1,
            }}
          />

          {/* Animated overlay content (framer-motion) */}
          <motion.div
            className="relative z-10 py-24 px-4 sm:px-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-lg text-slate-700 mb-4"> </h2>

            <motion.h1
              className="text-3xl md:text-4xl font-medium leading-tight"
              initial={{ scale: 0.995 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <span className="text-slate-900">Introducing </span>
              <span style={{ color: ORANGE }} className="font-semibold">
                new gen
              </span>
              <span className="text-slate-900"> ticketing platform.</span>
            </motion.h1>

            <motion.div
              className="mt-12 text-sm text-slate-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              follow us here for new updates
              <div className="mt-4 flex items-center justify-center">
                <a
                  href="https://www.instagram.com/arzkaro?igsh=MWNjbDh5OG9saDg2bw%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-slate-700 hover:text-orange-500 transition-colors"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                  </svg>
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-slate-500">
        <strong className="text-black">ARZ</strong>
      </footer>
    </div>
  );
};

export default HomeSplash;
