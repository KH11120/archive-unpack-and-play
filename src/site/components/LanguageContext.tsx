import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

type Language = 'en' | 'hi'

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (english: string, hindi: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

/** Where the chosen language is remembered (this browser only). */
export const LANGUAGE_STORAGE_KEY = 'aptcoder-language'

function readSavedLanguage(): Language {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'hi' ? 'hi' : 'en'
  } catch {
    return 'en'
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Pages are first rendered in English (as on the server), then switch to the saved choice.
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    setLanguage(readSavedLanguage())
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const chooseLanguage = useCallback((next: Language) => {
    setLanguage(next)
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, next)
    } catch {
      // Private browsing etc.: the choice simply isn't remembered.
    }
  }, [])

  const value = useMemo(
    () => ({
      language,
      setLanguage: chooseLanguage,
      t: (english: string, hindi: string) => (language === 'hi' ? hindi : english),
    }),
    [language, chooseLanguage],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
