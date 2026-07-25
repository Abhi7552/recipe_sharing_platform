export default function RatingStars({ value = 0, size = 16, interactive = false, onChange }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => {
        const filled = star <= Math.round(value);
        return (
          <button
            type="button"
            key={star}
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={filled ? '#E4A628' : 'none'}
              stroke={filled ? '#B8830F' : '#2B2420'}
              strokeOpacity={filled ? 1 : 0.25}
              strokeWidth="1.3"
            >
              <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.2 1.3-6.6-4.9-4.6 6.6-.8L12 2.5z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
