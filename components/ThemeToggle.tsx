"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("deepseek-theme");
    const prefersLight = window.matchMedia(
      "(prefers-color-scheme: light)",
    ).matches;
    const nextLight = saved ? saved === "light" : prefersLight;
    setLight(nextLight);
    document.documentElement.dataset.theme = nextLight ? "light" : "dark";
  }, []);

  function toggle() {
    const nextLight = !light;
    setLight(nextLight);
    document.documentElement.dataset.theme = nextLight ? "light" : "dark";
    window.localStorage.setItem("deepseek-theme", nextLight ? "light" : "dark");
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${light ? "dark" : "light"} mode`}
    >
      <span aria-hidden="true">{light ? "☾" : "☼"}</span>
      <span>{light ? "Dark" : "Light"}</span>
    </button>
  );
}
