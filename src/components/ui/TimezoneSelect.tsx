"use client";

import {
  ensureTimezoneInList,
  formatTimezoneLabel,
  listCuratedTimeZones,
  listIanaTimeZones,
  timezoneMatchesQuery,
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
const SEARCH_RESULT_LIMIT = 200;

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
  const curated = useMemo(() => listCuratedTimeZones(allZones), [allZones]);
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

  const q = query.trim();
  const isSearching = q.length > 0;

  const searchHits = useMemo(() => {
    if (!isSearching) return [];
    return allZones.filter((tz) => timezoneMatchesQuery(tz, q)).slice(0, SEARCH_RESULT_LIMIT);
  }, [allZones, isSearching, q]);

  const showDetected =
    Boolean(value) && !isSearching && !curated.includes(value);

  const display = open ? query : formatTimezoneLabel(value);

  function renderOption(tz: string) {
    return (
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
    );
  }

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
            "absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-2xl border border-plum/15 bg-white py-1 text-left shadow-lg"
          }
        >
          {isSearching ? (
            searchHits.length === 0 ? (
              <li className="px-3 py-2 text-xs text-outline">No matches</li>
            ) : (
              searchHits.map((tz) => renderOption(tz))
            )
          ) : (
            <>
              {showDetected ? (
                <>
                  <li
                    className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-outline"
                    role="presentation"
                  >
                    Detected
                  </li>
                  <li role="option" aria-selected={true}>
                    <button
                      type="button"
                      className="block w-full bg-mint/20 px-3 py-2 text-left text-sm font-semibold text-ink hover:bg-sand/80"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onChange(value);
                        setOpen(false);
                      }}
                    >
                      Detected: {formatTimezoneLabel(value)}
                    </button>
                  </li>
                </>
              ) : null}
              <li
                className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-outline"
                role="presentation"
              >
                Suggested regions
              </li>
              {curated.map((tz) => renderOption(tz))}
              <li
                className="sticky bottom-0 border-t border-plum/10 bg-white px-3 py-2 text-xs leading-5 text-outline"
                role="presentation"
              >
                Type to search all {allZones.length} timezones…
              </li>
            </>
          )}
        </ul>
      ) : null}
    </div>
  );
}
