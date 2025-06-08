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
                placeholder="Find your dream beach..."
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
      <section className="bg-gradient-to-b from-sky-50 to-white py-24 px-4 sm:px-6 lg:px-8 min-h-screen">
        <h3 className="text-4xl font-extrabold mb-16 text-center text-gray-800 flex items-center justify-center gap-3">
          <Info className="w-10 h-10 text-sky-600" />
          About This Website
        </h3>
                  
        <div className="max-w-6xl mx-auto flex flex-col gap-16">
          {/* Why This Project */}
          <div className="flex flex-col md:flex-row items-center gap-10 group">
            <div className="md:w-1/2">
              <img
                src="https://undraw.co/api/illustrations/focused_work.svg"
                alt="why"
                className="w-full h-auto"
              />
            </div>
            <div className="md:w-1/2 bg-white p-8 rounded-2xl shadow-xl border-l-4 border-sky-500 transition-transform group-hover:scale-[1.02]">
              <h4 className="text-2xl font-bold mb-4 text-sky-700 flex items-center gap-2">
                <Info className="w-6 h-6" />
                Why This Project?
              </h4>
              <p className="text-gray-700 text-lg leading-relaxed">
                Indonesia has thousands of beautiful beaches, but finding one that matches your personal preferences can be tricky.
                This project helps tourists explore hidden gems through review analysis and personalized filtering — not just trends.
              </p>
            </div>
          </div>
                  
          {/* Goal */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-10 group">
            <div className="md:w-1/2">
              <img
                src="https://undraw.co/api/illustrations/data_processing.svg"
                alt="goal"
                className="w-full h-auto"
              />
            </div>
            <div className="md:w-1/2 bg-white p-8 rounded-2xl shadow-xl border-r-4 border-emerald-500 transition-transform group-hover:scale-[1.02]">
              <h4 className="text-2xl font-bold mb-4 text-emerald-700 flex items-center gap-2">
                🎯 What Is the Goal?
              </h4>
              <p className="text-gray-700 text-lg leading-relaxed">
                This platform uses machine learning to recommend beaches based on user reviews and metadata such as ratings and tags.
                Our goal is to deliver a smarter, more personalized discovery experience for beach lovers.
              </p>
            </div>
          </div>
                  
          {/* Research Question */}
          <div className="text-center bg-sky-100 p-10 rounded-2xl shadow-md border border-sky-300">
            <h4 className="text-2xl font-semibold text-sky-800 mb-4">💡 Research Question</h4>
            <p className="text-lg italic text-gray-800 max-w-3xl mx-auto">
              “How to build a relevant and personalized beach recommendation system for users based on review data and beach metadata?”
            </p>
          </div>
                  
          {/* Design & Methodology */}
          <div className="flex flex-col md:flex-row items-center gap-10 group">
            <div className="md:w-1/2">
              <img
                src="https://undraw.co/api/illustrations/design_process.svg"
                alt="method"
                className="w-full h-auto"
              />
            </div>
            <div className="md:w-1/2 bg-white p-8 rounded-2xl shadow-xl border-l-4 border-purple-500 transition-transform group-hover:scale-[1.02]">
              <h4 className="text-2xl font-bold mb-4 text-purple-700 flex items-center gap-2">
                🧩 Design & Methodology
              </h4>
              <p className="text-gray-700 text-lg leading-relaxed">
                Built using a design thinking approach — this system identifies user needs, prototypes ideas, and iterates.
                The recommendation engine analyzes keywords, crowd levels, and other metadata to match the right beach to the right user.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Homepage;
