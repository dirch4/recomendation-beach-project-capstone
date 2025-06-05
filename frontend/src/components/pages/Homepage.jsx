import React, { useState, useRef } from 'react';
import hero from '../../assets/hero.png';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';

const tagOptions = ['Sepi', 'Ramai', 'Bersih', 'Banana Boat', 'Surfing', 'Snorkeling'];

const Homepage = () => {
  const [inputValue, setInputValue] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef();

  const handleSearch = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    navigate(`/search?search=${encodeURIComponent(trimmed)}`);
  };

  const handleTagClick = (tag) => {
    const currentWords = inputValue.trim().split(/\s+/);
    if (!currentWords.includes(tag)) {
      const newInput = (inputValue + ' ' + tag).trim().replace(/\s+/g, ' ');
      setInputValue(newInput);
    }
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Hero Section */}
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
              Enjoy the stunning natural beauty, soft white sand, and the calming sound of the waves.
              Dream Beach is the ideal destination to relax, adventure, and create unforgettable
              memories with family or loved ones.
            </p>

            {/* Search Box */}
            <div className="relative w-full max-w-md mx-auto mt-10">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setDropdownVisible(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Find your dream destination..."
                className="w-full px-4 py-3 pr-24 text-black rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={handleSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-sky-600 text-white px-4 py-2 rounded-full hover:bg-sky-700 transition text-sm"
              >
                Search
              </button>

              {/* Dropdown Tags */}
              {dropdownVisible && (
                <div
                  className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg p-4 text-left z-20"
                  onMouseLeave={() => setDropdownVisible(false)}
                >
                  <h3 className="text-sm font-semibold mb-2 text-gray-700">Popular Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {tagOptions.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className="px-3 py-1 rounded-full text-sm border bg-gray-100 text-gray-700 hover:bg-sky-100"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-[#dcefff] py-20 px-4 sm:px-6 lg:px-8 min-h-screen">
        <h3 className="text-3xl font-bold mb-10 text-center text-gray-800 flex items-center justify-center gap-2">
          <Info className="w-8 h-8 text-sky-600" />
          About This Website
        </h3>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 text-gray-800">
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-transform hover:scale-[1.04]">
            <h4 className="text-xl font-semibold mb-4 text-sky-700">Why this project?</h4>
            <p className="text-justify text-lg leading-relaxed">
              Indonesia has thousands of beautiful beaches, but finding one that matches your personal preferences
              (quiet, clean, crowded, etc.) can be a challenge. Tourists often rely on viral trends
              instead of authentic, personalized reviews.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-transform hover:scale-[1.04]">
            <h4 className="text-xl font-semibold mb-4 text-sky-700">What is the goal?</h4>
            <p className="text-justify text-lg leading-relaxed">
              This system uses machine learning (TensorFlow) to recommend beaches based on user reviews
              and metadata such as ratings, tags, and crowd levels. The goal is to make beach discovery
              more personal and data-driven.
            </p>
          </div>

          <div className="md:col-span-2 bg-sky-100 p-6 rounded-2xl shadow-md transition-transform hover:scale-[1.04]">
            <h4 className="text-xl font-semibold mb-3 text-center text-sky-800">
              🎯 Research Question
            </h4>
            <p className="text-center text-lg italic text-gray-700">
              “How to build a relevant and personalized beach recommendation system for users based on review data and beach metadata?”
            </p>
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-transform hover:scale-[1.04]">
            <h4 className="text-xl font-semibold mb-4 text-sky-700">Design & Methodology</h4>
            <p className="text-justify text-lg leading-relaxed">
              Built through a design thinking process — identifying user needs, prototyping,
              and iteratively improving. The system analyzes review keywords and uses filtering
              based on crowd levels, ratings, and personal preferences to match the right beach for the right user.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Homepage;
