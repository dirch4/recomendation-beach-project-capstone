import { StarRating } from '../atoms/StarRating';
import { Button } from '../atoms/Button';

export const ReviewCard = ({ feedback, isOwner, onEdit, onDelete, isOpen, onToggleDropdown }) => (
  <div className="bg-white border p-6 rounded-md shadow-md h-[220px] flex flex-col justify-between relative">
    {isOwner && (
      <div className="absolute top-4 right-4 z-10">
        <button onClick={onToggleDropdown} className="text-gray-500 hover:text-gray-800 text-xl font-bold">&#x22EF;</button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-10">
            <Button onClick={onEdit} className="block w-full text-left text-sm text-gray-700 hover:bg-gray-100">Edit</Button>
            <Button onClick={onDelete} className="block w-full text-left text-sm text-red-600 hover:bg-gray-100">Delete</Button>
          </div>
        )}
      </div>
    )}
    <div>
      <div className="font-semibold text-lg text-gray-800">{feedback.name}</div>
      <div className="mt-2 mb-2">
        <StarRating rating={feedback.rating} />
      </div>
      <p className="text-gray-600 line-clamp-4">{feedback.comment}</p>
    </div>
  </div>
);