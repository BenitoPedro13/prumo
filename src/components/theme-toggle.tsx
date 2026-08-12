"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type Choice = "system" | "light" | "dark";

const NEXT: Record<Choice, Choice> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const LABEL: Record<Choice, string> = {
  system: "Tema do sistema",
  light: "Tema claro",
  dark: "Tema escuro",
};

/**
 * An instrument on /sistema, not a site feature. The three theme states are a token contract
 * (docs/design-handoff.md §03) and this is how they get checked by hand. Whether the finished
 * site offers a theme control at all is a design decision that has not been made.
 */
export function ThemeToggle() {
  const [choice, setChoice] = useState<Choice>("system");

  useEffect(() => {
    const root = document.documentElement;
    if (choice === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", choice);
    }
  }, [choice]);

  return (
    <Button variant="outline" size="sm" onClick={() => setChoice(NEXT[choice])}>
      {LABEL[choice]}
    </Button>
  );
}
