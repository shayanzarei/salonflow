"use client";

import { useState } from "react";

export default function StarRating({
  defaultRating,
  size = "normal",
}: {
  defaultRating?: number;
  size?: "normal" | "large";
}) {
  const [rating, setRating] = useState(defaultRating ?? 0);
  const [hovered, setHovered] = useState(0);

  const starSize = size === "large" ? 48 : 36;

  return (
    <div>
      <input type="hidden" name="rating" value={rating} required />
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            style={{
              fontSize: starSize,
              color: star <= (hovered || rating) ? "#F59E0B" : "#e5e7eb",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
              transition: "color 0.1s, transform 0.1s",
              transform:
                star <= (hovered || rating) ? "scale(1.1)" : "scale(1)",
            }}
          >
            ★
          </button>
        ))}
      </div>
      {rating === 0 && (
        <p
          style={{
            fontSize: 12,
            color: "var(--color-danger-600)",
            margin: "8px 0 0",
            textAlign: "center",
          }}
        >
          Please select a rating
        </p>
      )}
    </div>
  );
}
