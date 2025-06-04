import React, { useState } from 'react';
import hero from '../../assets/hero.png';
import { Link, useNavigate } from 'react-router-dom';

const Homepage = () => {
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      navigate(`/search?keyword=${encodeURIComponent(trimmed)}`);
    }
  };

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
          <h2 className="text-base sm:text-lg md:text-xl mb-6">
            A Hidden Paradise for Your Perfect Vacation
          </h2>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed">
            Enjoy the stunning natural beauty, soft white sand, and the calming sound of the waves. Dream Beach is the ideal destination to relax, adventure, and create unforgettable memories with family or loved ones.
          </p>

          {/* Search Box */}
          <div className="flex justify-center mt-8 sm:mt-10">
            <div className="relative w-full max-w-md px-2">
				<input
				  type="text"
				  value={inputValue}
				  onChange={(e) => setInputValue(e.target.value)}
				  onKeyDown={(e) => {
				    if (e.key === 'Enter') {
				      handleSearch();
				    }
				  }}
				  placeholder="Find your dream destination..."
				  className="w-full px-6 py-3 pr-20 text-black rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
				/>
              <button
                onClick={handleSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-sky-600 text-white px-4 py-2 rounded-full hover:bg-sky-700 transition text-sm sm:text-base"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Homepage;
