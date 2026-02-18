'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
];

export function NavBar() {
  const { scrollY } = useScroll();
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 0.85]);

  return (
    <motion.nav
      id="navbar"
      style={{
        borderBottomColor: borderOpacity.get() ? `rgba(255,255,255,${borderOpacity.get() * 0.1})` : 'transparent',
      }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-transparent"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black backdrop-blur-md"
        style={{ opacity: bgOpacity }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: Logo */}
          <motion.a
            href="/"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2.5 flex-shrink-0"
          >
            <Image
              src="/uksnote.png"
              alt="uksnote logo"
              width={42}
              height={42}
              className="object-contain invert"
            />
            <span className="text-white font-semibold text-sm tracking-widest uppercase">
              uksnote
            </span>
          </motion.a>

          {/* Center: Nav Links */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:flex items-center gap-8"
          >
            {navLinks.map((link, index) => (
              <motion.a
                key={link.label}
                href={link.href}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 + index * 0.08 }}
                whileHover={{ color: '#ffffff' }}
                className="text-white/50 text-sm tracking-widest uppercase transition-colors hover:text-white"
              >
                {link.label}
              </motion.a>
            ))}
          </motion.div>

          {/* Right: Get Started Button */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <motion.a
              href="#get-started"
              whileHover={{ scale: 1.04, backgroundColor: '#ffffff', color: '#000000' }}
              whileTap={{ scale: 0.96 }}
              className="hidden sm:inline-flex items-center px-5 py-2 bg-white text-black text-xs font-semibold tracking-widest uppercase transition-colors"
            >
              Get Started
            </motion.a>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="md:hidden text-white/50 hover:text-white transition-colors"
              aria-label="menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </motion.button>
          </motion.div>

        </div>
      </div>
    </motion.nav>
  );
}
