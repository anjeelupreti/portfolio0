/** Fade-up-on-scroll framer-motion variant, used across most section reveals. */
export const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  }),
}

/** Simple fade-in framer-motion variant (no vertical movement). */
export const fadeIn = {
  hidden: { opacity: 0 },
  show: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, delay },
  }),
}

/** Staggers child animations for lists/grids animated with fadeUp/fadeIn. */
export const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
}

/** Default `whileInView` viewport options — animate once, when 20% visible. */
export const viewportOnce = { once: true, amount: 0.2 }
