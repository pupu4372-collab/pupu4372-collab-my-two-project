"use client";

import {
  ensureTimezoneInList,
  formatTimezoneLabel,
  listIanaTimeZones,
} from "@/lib/saju/timezone";
import { useEffect, useMemo, useRef, useState } from "react";

type TimezoneSelectProps = {
  value: string;
  onChange: (timezone: string) => void;
  className?: string;
  inputClassName?: string;
  listClassName?: string;
  id?: string;
  "aria-label"?: string;
  placeholder?: string;
};

const DEFAULT_PLACEHOLDER = "Search timezone…";

export function TimezoneSelect({
  value,
  onChange,
  className,
  inputClassName,
  listClassName,
  id,
  "aria-label": ariaLabel,
  placeholder = DEFAULT_PLACEHOLDER,
}: TimezoneSelectProps) {
  const allZones = useMemo(() => ensureTimezoneInList(listIanaTimeZones(), value), [value]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open, value]);

  useEffect(() => {
    function onDocPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocPointer);
    return () => document.removeEventListener("mousedown", onDocPointer);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const source = allZones;
    if (!q) {
      const favorites = source.filter((tz) =>
        [
          "Asia/Seoul",
          "Asia/Tokyo",
          "America/New_York",
          "America/Los_Angeles",
          "America/Chicago",
          "Europe/London",
          "Europe/Paris",
          "Australia/Sydney",
        ].includes(tz)
      );
      const rest = source.filter((tz) => !favorites.includes(tz)).slice(0, 40);
      return [...favorites, ...rest];
    }
    return source
      .filter(
        (tz) =>
          tz.toLowerCase().includes(q) ||
          formatTimezoneLabel(tz).toLowerCase().includes(q)
      )
      .slice(0, 80);
  }, [allZones, query]);

  const display = open ? query : formatTimezoneLabel(value);

  return (
    <div ref={rootRef} className={className ?? "relative mt-2"}>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={id ? `${id}-listbox` : undefined}
        aria-label={ariaLabel}
        autoComplete="off"
        spellCheck={false}
        value={display}
        placeholder={placeholder}
        className={inputClassName}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onChange={(e) => {
          setOpen(true);
          setQuery(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
      {open ? (
        <ul
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          className={
            listClassName ??
            "absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-2xl border border-plum/15 bg-white py-1 text-left shadow-lg"
          }
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-xs text-outline">No matches</li>
          ) : (
            filtered.map((tz) => (
              <li key={tz} role="option" aria-selected={tz === value}>
                <button
                  type="button"
                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-sand/80 ${
                    tz === value ? "bg-mint/30 font-semibold text-ink" : "text-ink"
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(tz);
                    setOpen(false);
                  }}
                >
                  {formatTimezoneLabel(tz)}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
