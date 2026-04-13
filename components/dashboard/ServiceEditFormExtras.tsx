"use client";

import { useEffect, useState, type ReactNode } from "react";

const DURATION_PILLS = [30, 45, 60, 90, 120];

export function ServiceDurationField({
  initial,
  brand,
  quickSelectionTitle = "Quick select",
  pillSuffix = " min",
  required: fieldRequired = true,
  onMinutesChangeAction,
  labelText = "Duration (min)",
  inputSuffix,
  borderedRow = false,
}: {
  initial: number;
  brand: string;
  quickSelectionTitle?: string | null;
  pillSuffix?: string;
  required?: boolean;
  onMinutesChangeAction?: (minutes: number) => void;
  /** Pass `null` to hide the label (parent supplies its own). */
  labelText?: string | null;
  inputSuffix?: ReactNode;
  /** Wrap the number input (+ optional suffix) in a single bordered row. */
  borderedRow?: boolean;
}) {
  const [mins, setMins] = useState(initial);

  useEffect(() => {
    onMinutesChangeAction?.(mins);
  }, [mins, onMinutesChangeAction]);

  const numberInput = (
    <input
      type="number"
      min={5}
      step={5}
      required={fieldRequired}
      value={mins}
      onChange={(e) => setMins(parseInt(e.target.value, 10) || 0)}
      style={{
        width: borderedRow ? undefined : "100%",
        flex: borderedRow ? 1 : undefined,
        minWidth: borderedRow ? 0 : undefined,
        border: borderedRow ? "none" : "1px solid #e5e7eb",
        borderRadius: borderedRow ? 0 : 10,
        padding: borderedRow ? "11px 12px" : "10px 14px",
        fontSize: 14,
        color: "#111",
        background: borderedRow ? "transparent" : "white",
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  );

  return (
    <div>
      {labelText ? (
        <label
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 600,
            color: "#aaa",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 8,
          }}
        >
          {labelText}
        </label>
      ) : null}
      <input type="hidden" name="duration_mins" value={mins} />
      {borderedRow ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            overflow: "hidden",
            background: "white",
          }}
        >
          {numberInput}
          {inputSuffix != null ? (
            <span
              style={{
                padding: "0 12px",
                fontSize: 13,
                color: "#888",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {inputSuffix}
            </span>
          ) : null}
        </div>
      ) : (
        numberInput
      )}
      {quickSelectionTitle ? (
        <>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#aaa",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "12px 0 8px",
            }}
          >
            {quickSelectionTitle}
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {DURATION_PILLS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setMins(d)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  background: mins === d ? brand : "white",
                  color: mins === d ? "white" : "#666",
                  border:
                    mins === d ? `2px solid ${brand}` : "1px solid #e5e7eb",
                }}
              >
                {d}
                {pillSuffix}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function ServiceActiveToggle({
  initial,
  brand,
  title = "Active status",
  subtitle = "Service visible to clients",
  onActiveChangeAction,
}: {
  initial: boolean;
  brand: string;
  title?: string;
  subtitle?: string;
  onActiveChangeAction?: (active: boolean) => void;
}) {
  const [on, setOn] = useState(initial);

  useEffect(() => {
    onActiveChangeAction?.(on);
  }, [on, onActiveChangeAction]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        paddingTop: 4,
      }}
    >
      <div>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#111",
            margin: "0 0 2px",
          }}
        >
          {title}
        </p>
        <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{subtitle}</p>
      </div>
      <input type="hidden" name="is_active" value={on ? "true" : "false"} />
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn((v) => !v)}
        style={{
          width: 48,
          height: 28,
          borderRadius: 14,
          border: "none",
          cursor: "pointer",
          background: on ? brand : "#e5e7eb",
          position: "relative",
          flexShrink: 0,
          transition: "background 0.15s ease",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: on ? 24 : 3,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
            transition: "left 0.15s ease",
          }}
        />
      </button>
    </div>
  );
}
