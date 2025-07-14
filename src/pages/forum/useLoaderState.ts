import { useState } from "react";

export type TLoaderState = "idle" | "fetching" | "success" | "error";
export interface ILoaderHook {
  state: TLoaderState;
  setState: React.Dispatch<React.SetStateAction<TLoaderState>>;
}

/**
 * A simple hook for manage API loading state
 * Consider to using some other lib like @tanstack/react-query
 */
export default function useLoaderState(): ILoaderHook {
  const [state, setState] = useState<TLoaderState>("idle");

  return {
    state: state,
    setState,
  };
}
