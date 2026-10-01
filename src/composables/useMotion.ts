import { usePreferredReducedMotion } from '@vueuse/core'
export function useReveal(delay = 0) {
  const reduced = usePreferredReducedMotion()
  return {
    initial: {
      opacity: reduced.value === 'reduce' ? 1 : 0,
      y: reduced.value === 'reduce' ? 0 : 28,
    },
    visibleOnce: {
      opacity: 1,
      y: 0,
      transition: { duration: 650, delay, type: 'tween', ease: [0.22, 1, 0.36, 1] },
    },
  }
}
