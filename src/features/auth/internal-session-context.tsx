"use client";

import { createContext, PropsWithChildren, useContext } from "react";

import { useSession } from "@/hooks/use-session";

type InternalSessionContextValue = ReturnType<typeof useSession>;

const InternalSessionContext = createContext<InternalSessionContextValue | null>(null);

export function InternalSessionProvider({ children }: PropsWithChildren) {
  const sessionQuery = useSession();

  return (
    <InternalSessionContext.Provider value={sessionQuery}>
      {children}
    </InternalSessionContext.Provider>
  );
}

export function useInternalSession() {
  const value = useContext(InternalSessionContext);

  if (!value) {
    throw new Error("useInternalSession must be used within InternalSessionProvider.");
  }

  return value;
}
