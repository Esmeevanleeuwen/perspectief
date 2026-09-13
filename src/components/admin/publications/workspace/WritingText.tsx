"use client";
import { useLayoutEffect, useRef, type TextareaHTMLAttributes } from "react";

/** Grow with the page instead of creating a scrollbox per section. */
export default function WritingText(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const field = ref.current;
    if (!field) return;
    const resize = () => {
      if (!field.clientWidth) return;
      field.style.height = "auto";
      field.style.height = `${field.scrollHeight}px`;
    };
    resize();
    if (typeof ResizeObserver === "undefined") return;
    let width = field.clientWidth;
    const observer = new ResizeObserver(() => {
      if (field.clientWidth !== width) {
        width = field.clientWidth;
        resize();
      }
    });
    observer.observe(field);
    return () => observer.disconnect();
  }, [props.value]);
  return <textarea {...props} ref={ref} />;
}
