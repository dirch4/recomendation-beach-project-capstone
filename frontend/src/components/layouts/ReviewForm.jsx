import { StarRating } from '../atoms/StarRating';
import { Button } from '../atoms/Button';

export const ReviewForm = ({ isLoggedIn, newFeedback, setNewFeedback, onSubmit, onStarClick }) => (
  <form onSubmit={onSubmit} className="max-w-2xl mx-auto">
    <div className="flex justify-center space-x-2 mb-6">
      {[1, 2, 3, 4, 5].map((star) => (
        <Button
          type="button"
          key={star}
          className={`text-4xl ${newFeedback.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
          onClick={() => onStarClick(star)}
        >
          ★
        </Button>
      ))}
    </div>

    <div className="mb-6">
      <textarea
        placeholder={isLoggedIn ? "Write your review here..." : "Login untuk menulis review..."}
        value={newFeedback.comment}
        onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        rows="5"
        required
        disabled={!isLoggedIn}
      />
    </div>

    <div className="flex justify-center">
      <Button
        type="submit"
        disabled={!isLoggedIn}
        className={
          isLoggedIn
            ? 'bg-sky-900 text-sky-100 hover:bg-sky-700 focus:ring-blue-500'
            : 'bg-gray-400 text-gray-700 cursor-not-allowed'
        }
      >
        {isLoggedIn ? 'Submit Review' : 'Login untuk Submit Review'}
      </Button>
    </div>
  </form>
);
