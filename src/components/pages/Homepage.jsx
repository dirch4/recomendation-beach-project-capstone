import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import hero from '../../assets/hero.png';
import { FiNavigation } from 'react-icons/fi'; // pastikan react-icons terinstal

const Homepage = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchKeyword)}`);
    }
  };

  const handleNearby = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        navigate(`/search?nearby=true&lat=${latitude}&lon=${longitude}`);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Failed to get your location. Please allow location access.');
      }
    );
  };

  const suggestions = [
    { label: 'Nearby', onClick: handleNearby },
  ];

  return (
    <section className="relative min-h-screen">
      <img
        src={hero}
        alt="heroImage"
        className="absolute inset-0 w-full h-full object-cover brightness-75"
      />
      <div className="relative z-10 flex items-center justify-center min-h-screen text-white text-center px-4 sm:px-6 md:px-10">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
            Find your dream beach
          </h1>
          <h2 className="text-base sm:text-lg md:text-xl mb-4">
            A Hidden Paradise for Your Perfect Vacation
          </h2>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed">
            Enjoy the stunning natural beauty, soft white sand, and the calming sound of the waves. Dream Beach is the ideal destination to relax, adventure, and create unforgettable memories with family or loved ones.
          </p>

          {/* Search Box */}
          <div className="flex justify-center mt-4 sm:mt-5">
            <div className="relative w-full max-w-md px-2">
              <input
                type="text"
                placeholder="Find your dream destination..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                className="w-full px-4 py-2 sm:py-2.5 md:py-3 pr-20 text-black rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
              <button
                onClick={handleSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-sky-600 text-white px-4 py-2 rounded-full hover:bg-sky-700 transition text-sm sm:text-base"
              >
                Search
              </button>

              {/* Dropdown Suggestions */}
              {(focused || searchKeyword.length > 0) && (
                <div className="absolute top-full mt-2 left-0 w-full bg-white rounded-full shadow-lg border border-gray-200 z-10">
                  {suggestions.map((item, index) => (
                    <div
                      key={index}
                      onMouseDown={item.onClick}
                      className="flex items-center gap-4 p-2 bg-gray-100 hover:bg-gray-200 cursor-pointer rounded-full"
                    >
                      <div className="bg-white p-2 rounded-md border border-gray-300">
                        <FiNavigation className="h-6 w-6 text-gray-800" />
                      </div>
                      <div className="text-black font-semibold text-base">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Homepage;
