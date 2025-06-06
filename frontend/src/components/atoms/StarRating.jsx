// components/atoms/StarRating.jsx
export const StarRating = ({ rating, onChange }) => {
  return (
    <div className="flex items-center text-yellow-600">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`text-2xl cursor-pointer ${
            rating >= i + 1 ? 'text-yellow-500' : 'text-gray-300'
          }`}
          onClick={() => onChange && onChange(i + 1)}
        >
          ★
        </span>
      ))}
    </div>
  );
};
