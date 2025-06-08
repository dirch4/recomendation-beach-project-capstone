import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import cleaned_data from '../../data/data_forDB_pretty.json';

const Spinner = () => (
  <div className="flex justify-center my-8">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const SearchPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialKeyword = queryParams.get('search') || '';
  const isNearby = queryParams.get('nearby') === 'true';
  const userLat = parseFloat(queryParams.get('lat'));
  const userLon = parseFloat(queryParams.get('lon'));

  const [searchTerm, setSearchTerm] = useState(initialKeyword);
  const [debouncedTerm, setDebouncedTerm] = useState(initialKeyword);
  const [selectedTags, setSelectedTags] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [showAllTags, setShowAllTags] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(6);

  useEffect(() => {
    setIsLoading(true);
    const debounceTimer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 200);

    const fakeLoadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(debounceTimer);
      clearTimeout(fakeLoadingTimer);
    };
  }, [searchTerm]);

  useEffect(() => {
    setDisplayCount(20);
  }, [debouncedTerm, selectedTags, minRating]);

  const allTags = Array.from(
    new Set(
      cleaned_data.flatMap((place) =>
        place.review_keywords?.split(',').map((tag) => tag.trim())
      )
    )
  );

  const filterPlaces = () => {
    const filtered = cleaned_data.filter((place) => {
      const matchesKeyword = debouncedTerm
        ? place.place_name?.toLowerCase().includes(debouncedTerm.toLowerCase()) ||
          place.address?.toLowerCase().includes(debouncedTerm.toLowerCase()) ||
          place.description?.toLowerCase().includes(debouncedTerm.toLowerCase())
        : true;

      const matchesRating = place.rating >= minRating;

      const matchesTags = selectedTags.length
        ? selectedTags.every((tag) =>
            place.review_keywords?.toLowerCase().includes(tag.toLowerCase())
          )
        : true;

      return matchesKeyword && matchesRating && matchesTags;
    });

    if (isNearby && userLat && userLon) {
      return filtered
        .filter((place) => place.coordinates)
        .map((place) => {
          const [latStr, lonStr] = place.coordinates.split(',').map((x) => x.trim());
          const lat = parseFloat(latStr);
          const lon = parseFloat(lonStr);
          return {
            ...place,
            latitude: lat,
            longitude: lon,
            distance: haversineDistance(userLat, userLon, lat, lon),
          };
        })
        .sort((a, b) => a.distance - b.distance);
    }

    return filtered;
  };

  const results = filterPlaces();
  const displayedResults = results.slice(0, displayCount);
  const hasMoreResults = displayCount < results.length;

  const toggleTag = (tag) => {
    const tagLower = tag.toLowerCase();
    const currentWords = searchTerm.toLowerCase().split(' ').filter(Boolean);

    if (currentWords.includes(tagLower)) {
      const newWords = currentWords.filter((word) => word !== tagLower);
      setSearchTerm(newWords.join(' '));
    } else {
      setSearchTerm((prev) => (prev + ' ' + tag).trim());
    }

    setSelectedTags([]);
  };

  const loadMore = () => {
    setDisplayCount((prev) => prev + 6);
  };

  const handleNearbySearch = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        window.location.href = `/search?nearby=true&lat=${lat}&lon=${lon}`;
      },
      (error) => {
        alert("Failed to get your location.");
      }
    );
  };

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 bg-inherit w-full max-w-screen-lg mx-auto">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6">
        {isNearby && !debouncedTerm ? (
          <>Showing destinations near your location</>
        ) : debouncedTerm ? (
          <>Showing results for <span className="text-blue-600">"{debouncedTerm}"</span></>
        ) : (
          <>Explore destinations by selecting tags below</>
        )}
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Search for beach or location..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSelectedTags([]);
          }}
          className="flex-1 p-3 border rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
        />
        <select
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="p-3 border rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
        >
          <option value={0}>Any rating</option>
          <option value={4}>Minimum 4.0</option>
          <option value={4.5}>Minimum 4.5</option>
        </select>
        {!isNearby && (
          <button
            onClick={handleNearbySearch}
            className="p-3 bg-sky-800 text-sky-200 rounded-md text-sm md:text-base hover:bg-sky-600 transition whitespace-nowrap"
          >
            Find Nearby
          </button>
        )}
      </div>

      {!debouncedTerm && !isNearby && (
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {(showAllTags ? allTags : allTags.slice(0, 15)).map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="px-3 py-1 rounded-full text-sm border bg-transparent text-gray-700 hover:bg-blue-100 hover:text-blue-700"
              >
                #{tag}
              </button>
            ))}
          </div>
          {allTags.length > 15 && (
            <button
              onClick={() => setShowAllTags(!showAllTags)}
              className="text-blue-600 text-sm mt-1 hover:underline self-start mb-6"
            >
              {showAllTags ? 'Show Fewer Tags' : 'Show More Tags'}
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <Spinner />
      ) : !debouncedTerm && !isNearby ? null : displayedResults.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {displayedResults.map((place) => (
              <Card key={place.place_id} place={place} />
            ))}
          </div>
          {hasMoreResults && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                className="text-sky-200 bg-sky-800 px-4 p-2 rounded-lg hover:bg-sky-200 hover:text-sky-800 mb-8"
              >
                Show More
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-600 text-center mt-10 text-base">
          No results found for your search.
        </p>
      )}
    </div>
  );
};

const Card = ({ place }) => {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col lg:flex-row bg-[#dcefff] rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-[1.01] hover:shadow-lg h-full">
        <div className="w-full lg:w-2/5 h-48 lg:h-auto">
          <img
            src={place.featured_image?.[0]}
            alt={place.place_name}
            onClick={() => setModalOpen(true)}
            onError={(e) => (e.target.src = '/fallback-image.jpg')}
            className="object-cover w-full h-full rounded-lg hover:scale-[1.05] transition-transform cursor-pointer"
          />
        </div>
        <div className="w-full lg:w-3/5 flex flex-col justify-between bg-sky-50 p-4 md:p-5 h-full">
          <div className="flex-1">
            <h2 className="text-lg md:text-xl font-bold text-sky-800 mb-2 line-clamp-1">{place.place_name}</h2>
            <p className="text-sm md:text-base text-gray-700 mb-3 line-clamp-2">
              {place.description && place.description !== '-' ? place.description : 'No description available.'}
            </p>
            <p className="text-sm md:text-base text-yellow-600 mb-2">
              ⭐ {place.rating} ({place.reviews.toLocaleString()} reviews)
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {place.review_keywords.split(', ').slice(0, 3).map((keyword, index) => (
                <span
                  key={index}
                  className="bg-yellow-100 text-yellow-800 text-xs md:text-sm px-2 py-1 rounded-full"
                >
                  #{keyword}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500 mb-2">
              <strong>Address:</strong> {place.address}
            </p>
          </div>

          <div className="mt-4 flex justify-center gap-4">
            <a
              href={place.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-sky-600 text-sky-600 text-sm px-6 py-2 rounded-md hover:bg-sky-100 transition w-40 text-center"
            >
              Maps
            </a>
            <a
              href={`/detail/${place.place_id}`}
              className="bg-[#00859B] text-white text-sm px-6 py-2 rounded-md hover:bg-[#016577] transition w-40 text-center"
            >
              Details
            </a>
          </div>
        </div>
      </div>

      {/* Modal for image preview */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
          onClick={() => setModalOpen(false)}
        >
          <img
            src={place.featured_image?.[0]}
            alt={place.place_name}
            className="max-w-full max-h-full rounded-lg shadow-lg"
          />
        </div>
      )}
    </>
  );
};

export default SearchPage;
