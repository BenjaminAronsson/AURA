import { useEffect } from 'react'

/**
 * Keeps `--app-height` in sync with the *visually* available viewport.
 *
 * Mobile browsers make `100%`/`100vh` unreliable: the URL bar is excluded from
 * neither, and — the case that actually breaks us — iOS Safari does not shrink
 * the layout viewport when the on-screen keyboard opens, so the terminal's
 * bottom-anchored input would sit underneath it. `dvh` units fix the URL bar
 * but not the keyboard. `visualViewport` reports the real visible box in both
 * situations, so we mirror it into a custom property and size the app shell
 * off that.
 */
export function useViewportHeight() {
  useEffect(() => {
    const vv = window.visualViewport

    const apply = () => {
      const height = vv?.height ?? window.innerHeight
      document.documentElement.style.setProperty('--app-height', `${height}px`)
    }

    apply()

    if (vv) {
      // `scroll` matters too: iOS shifts the visual viewport rather than
      // resizing it when focus moves between fields with the keyboard open.
      vv.addEventListener('resize', apply)
      vv.addEventListener('scroll', apply)
      return () => {
        vv.removeEventListener('resize', apply)
        vv.removeEventListener('scroll', apply)
      }
    }

    window.addEventListener('resize', apply)
    window.addEventListener('orientationchange', apply)
    return () => {
      window.removeEventListener('resize', apply)
      window.removeEventListener('orientationchange', apply)
    }
  }, [])
}
