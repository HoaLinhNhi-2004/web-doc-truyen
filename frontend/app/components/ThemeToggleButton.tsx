"use client";

import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative rounded-full bg-muted/50 p-2.5 text-foreground hover:bg-muted transition-all duration-300 hover:scale-110"
      aria-label="Đổi theme"
    >
      <Sun
        className={`h-5 w-5 absolute inset-0 m-auto transition-all duration-500 ${
          theme === "dark" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
        }`}
      />
      <Moon
        className={`h-5 w-5 absolute inset-0 m-auto transition-all duration-500 ${
          theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
    </button>
  );
}