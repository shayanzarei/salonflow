'use client';

import { useState } from 'react';

export default function StarRating({ defaultRating }: { defaultRating?: number }) {
  const [rating, setRating] = useState(defaultRating ?? 0);
  const [hovered, setHovered] = useState(0);

  return (
    <div>
      <input type="hidden" name="rating" value={rating} required />
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="text-4xl transition-transform hover:scale-110 focus:outline-none"
            style={{
              color: star <= (hovered || rating) ? '#F59E0B' : '#D1D5DB',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ★
          </button>
        ))}
      </div>
      {rating === 0 && (
        <p className="text-xs text-red-400 mt-2">Please select a rating</p>
      )}
    </div>
  );
}