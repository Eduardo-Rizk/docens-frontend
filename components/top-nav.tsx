"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { Menu, X, ArrowUpRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const publicItems = [
  { href: "/", label: "Inicio" },
  { href: "/explorar", label: "Explorar" },
];

const studentItems = [
  { href: "/aluno/meus-auloes", label: "Minha Agenda" },
  { href: "/aluno/perfil", label: "Meu Perfil" },
];

const teacherItems = [
  { href: "/professor/auloes", label: "Prof." },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

const SCROLL_THRESHOLD = 50;

export function TopNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > SCROLL_THRESHOLD);
  });

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems = [
    ...publicItems,
    ...(user?.role === "STUDENT" || user?.role === "TEACHER" ? studentItems : []),
    ...(user?.role === "TEACHER" ? teacherItems : []),
  ];

  return (
    <>
      <div className="sticky top-0 z-50 w-full flex justify-center">
        {/* Wrapper that animates between full-width and island via CSS transitions */}
        <div
          className={cn(
            "relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
            isScrolled
              ? "w-[min(calc(100%-2rem),48rem)] mt-3 rounded-2xl shadow-2xl shadow-black/30 border border-white/[0.08]"
              : "w-full mt-0 rounded-none shadow-none border-b border-white/[0.06]"
          )}
          style={{
            background: isScrolled
              ? "#0f172a"
              : undefined,
          }}
        >
          {/* Gradient background — visible when NOT scrolled */}
          <motion.div
            animate={{ opacity: isScrolled ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#0f172a]"
          />

          {/* Scrolled background — visible when scrolled */}
          <motion.div
            animate={{ opacity: isScrolled ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 -z-10 bg-[#0f172a]/90"
          />

          {/* Shimmer beam top — fades out on scroll */}
          <motion.div
            animate={{ opacity: isScrolled ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ea580c]/60 to-transparent overflow-hidden"
          >
            <div className="absolute inset-0 animate-shimmer-beacon bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/3" />
          </motion.div>

          {/* Main content */}
          <motion.div
            animate={{
              paddingTop: isScrolled ? 10 : 20,
              paddingBottom: isScrolled ? 10 : 20,
            }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
            className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 sm:px-8"
          >
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center bg-white rounded">
                <span className="font-sans text-xs font-black text-[#0f172a] tracking-tighter">
                  DS
                </span>
              </div>
              <AnimatePresence mode="wait">
                {!isScrolled && (
                  <motion.div
                    key="full-logo"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col"
                  >
                    <span className="font-sans text-base font-bold tracking-tight text-white leading-none">
                      DOCENS
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#ea580c] leading-none mt-0.5">
                      live classes
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg",
                      active
                        ? "text-white"
                        : "text-white/60 hover:text-white hover:bg-white/[0.08]"
                    )}
                  >
                    {item.label}
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#ea580c] rounded-full"
                        transition={{
                          type: "spring",
                          bounce: 0.15,
                          duration: 0.5,
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {!isLoading && !user && (
                <Link
                  href="/login"
                  className="hidden md:flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-[#ea580c] to-[#dc2626] hover:from-[#c2410c] hover:to-[#b91c1c] transition-all duration-300 shadow-lg shadow-[#ea580c]/20 hover:shadow-[#ea580c]/30"
                >
                  Entrar
                  <ArrowUpRight size={14} />
                </Link>
              )}

              {!isLoading && user && (
                <div className="hidden md:flex items-center gap-3">
                  <span className="text-sm text-white/60">{user.name}</span>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white border border-white/15 hover:border-white/30 transition-all duration-200 rounded-lg hover:bg-white/[0.05]"
                  >
                    <LogOut size={12} />
                    Sair
                  </button>
                </div>
              )}

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
                aria-label="Menu"
              >
                <AnimatePresence mode="wait">
                  {mobileOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X size={22} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu size={22} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </motion.div>

          {/* Bottom gradient border — fades on scroll */}
          <motion.div
            animate={{ opacity: isScrolled ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="h-[1px] bg-gradient-to-r from-transparent via-[#ea580c]/30 to-transparent"
          />
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-xl"
              onClick={() => setMobileOpen(false)}
            />

            {/* Menu content */}
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.05, duration: 0.25 }}
              className="relative flex flex-col items-center justify-center min-h-screen gap-2 px-8"
            >
              {navItems.map((item, i) => {
                const active = isActive(pathname, item.href);
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.25 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block text-2xl font-display font-bold py-3 px-6 rounded-xl transition-all duration-200",
                        active
                          ? "text-white bg-white/10"
                          : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                      )}
                    >
                      {item.label}
                      {active && (
                        <div className="mt-1.5 h-[2px] w-8 bg-[#ea580c] rounded-full mx-auto" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{
                  delay: 0.05 + navItems.length * 0.05,
                  duration: 0.25,
                }}
                className="mt-6"
              >
                {!user ? (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-xl bg-gradient-to-r from-[#ea580c] to-[#dc2626] shadow-lg shadow-[#ea580c]/20"
                  >
                    Entrar
                    <ArrowUpRight size={16} />
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2 px-8 py-4 text-base font-semibold text-white/60 border border-white/15 rounded-xl hover:text-white hover:border-white/30 transition-all"
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                )}
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
