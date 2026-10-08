import { createContext, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { APPEARANCE_PALETTES } from "../config/appearancePalettes";

type ColorMode = "light" | "dark";
export const PRIMARY_COLORS = APPEARANCE_PALETTES.map((palette) => palette.id);
type PrimaryColor = typeof PRIMARY_COLORS[number];
type ColorModeContextValue = { mode: ColorMode; isDark: boolean; toggleMode: () => void; primaryColor: PrimaryColor; setPrimaryColor: (color: PrimaryColor) => void };
const ColorModeContext = createContext<ColorModeContextValue | null>(null);

const getInitialMode = (): ColorMode => {
  const stored = localStorage.getItem("asqa-color-mode");
  return stored === "dark" ? "dark" : "light";
};
const getInitialColor = (): PrimaryColor => {
  const stored = localStorage.getItem("asqa-primary-color") as PrimaryColor | null;
  return stored && PRIMARY_COLORS.includes(stored) ? stored : "default";
};

export const ColorModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ColorMode>(getInitialMode);
  const [primaryColor, setPrimaryColor] = useState<PrimaryColor>(getInitialColor);
  useLayoutEffect(() => {
    localStorage.setItem("asqa-color-mode", mode);
  }, [mode]);
  useLayoutEffect(() => {
    localStorage.setItem("asqa-primary-color", primaryColor);
  }, [primaryColor]);
  const value = useMemo(() => ({ mode, isDark: mode === "dark", toggleMode: () => setMode((current) => current === "dark" ? "light" : "dark"), primaryColor, setPrimaryColor }), [mode, primaryColor]);
  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
};

export const useColorMode = () => {
  const context = useContext(ColorModeContext);
  if (!context) throw new Error("useColorMode must be used inside ColorModeProvider");
  return context;
};
