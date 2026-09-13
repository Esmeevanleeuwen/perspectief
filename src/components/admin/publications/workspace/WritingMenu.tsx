"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Native disclosure with Escape and outside-click dismissal. */
export default function WritingMenu({
  label,
  ariaLabel,
  className = "",
  children,
}: {
  label: ReactNode;
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (ref.current?.open && !ref.current.contains(event.target as Node))
        ref.current.open = false;
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);
  return (
    <details
      ref={ref}
      className={`writing-popup ${className}`}
      onKeyDown={(event) => {
        if (event.key === "Escape" && event.currentTarget.open) {
          event.preventDefault();
          event.stopPropagation();
          event.currentTarget.open = false;
          event.currentTarget.querySelector("summary")?.focus();
        }
      }}
      onClick={(event) => {
        if ((event.target as Element).closest("[data-close-menu]"))
          event.currentTarget.open = false;
      }}
    >
      <summary aria-label={ariaLabel}>{label}</summary>
      <div className="writing-popup-content">{children}</div>
    </details>
  );
}
