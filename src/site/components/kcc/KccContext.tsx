import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import KccJoinModal from "./KccJoinModal";

/**
 * Site-wide "Join KCC" popup: rendered once in the root layout, so any page or the footer can
 * open it with `useKccJoin()()`.
 */
const KccJoinContext = createContext<() => void>(() => {});

export function KccJoinProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openPopup = useCallback(() => setOpen(true), []);
  return (
    <KccJoinContext.Provider value={openPopup}>
      {children}
      <KccJoinModal open={open} onOpenChange={setOpen} />
    </KccJoinContext.Provider>
  );
}

/** Returns a function that opens the KCC registration popup. */
export const useKccJoin = () => useContext(KccJoinContext);
