export const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center text-yellow-600">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`text-2xl ${rating >= i + 1 ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
      ))}
    </div>
  );
};