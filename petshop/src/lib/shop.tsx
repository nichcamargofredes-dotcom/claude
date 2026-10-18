import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

type Toast = { id: number; message: string }

type ShopState = {
  cartCount: number
  favorites: ReadonlySet<string>
  /** Increments on every add so the cart badge can replay its bump animation. */
  cartPulse: number
  toast: Toast | null
  addToCart: (name: string) => void
  toggleFavorite: (id: string, name: string) => void
}

const ShopContext = createContext<ShopState | null>(null)

// The hero spec shows 4 favourites and 1 item in the cart.
const INITIAL_FAVORITES = ['cozy-cat-house', 'salmon-treats', 'feather-wand', 'cooling-mat']

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(1)
  const [cartPulse, setCartPulse] = useState(0)
  const [favorites, setFavorites] = useState<ReadonlySet<string>>(() => new Set(INITIAL_FAVORITES))
  const [toast, setToast] = useState<Toast | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const notify = useCallback((message: string) => {
    window.clearTimeout(timer.current)
    setToast({ id: Date.now(), message })
    timer.current = window.setTimeout(() => setToast(null), 2600)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const addToCart = useCallback(
    (name: string) => {
      setCartCount((c) => c + 1)
      setCartPulse((p) => p + 1)
      notify(`${name} added to your cart`)
    },
    [notify],
  )

  const toggleFavorite = useCallback(
    (id: string, name: string) => {
      const adding = !favorites.has(id)
      setFavorites((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
      notify(adding ? `${name} saved to favorites` : `${name} removed from favorites`)
    },
    [favorites, notify],
  )

  const value = useMemo(
    () => ({ cartCount, favorites, cartPulse, toast, addToCart, toggleFavorite }),
    [cartCount, favorites, cartPulse, toast, addToCart, toggleFavorite],
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used inside <ShopProvider>')
  return ctx
}
