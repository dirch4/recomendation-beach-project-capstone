import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import cleaned_data from '../../data/cleaned_data-asli_formatted.json';

const Spinner = () => (
  <div className="flex justify-center my-8">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const SearchPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialKeyword = queryParams.get('keyword') || '';

  const [searchTerm, setSearchTerm] = useState(initialKeyword);
  const [debouncedTerm, setDebouncedTerm] = useState(initialKeyword);
  const [selectedTags, setSelectedTags] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [showAllTags, setShowAllTags] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(6); // State untuk jumlah data yang ditampilkan

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

  // Reset display count ketika search term berubah
  useEffect(() => {
    setDisplayCount(6);
  }, [debouncedTerm, selectedTags]);

  const keywordFiltered = debouncedTerm.trim()
    ? cleaned_data.filter((place) => {
        const keyword = debouncedTerm.toLowerCase();
        return (
          (place.name?.toLowerCase().includes(keyword) ||
            place.address?.toLowerCase().includes(keyword) ||
            place.description?.toLowerCase().includes(keyword)) &&
          place.rating >= minRating
        );
      })
    : [];

  const allTags = Array.from(
    new Set(
      cleaned_data.flatMap((place) =>
        place.review_keywords?.split(',').map((tag) => tag.trim())
      )
    )
  );

  const tagFiltered = selectedTags.length
    ? cleaned_data.filter((place) =>
        selectedTags.every((tag) =>
          place.review_keywords?.toLowerCase().includes(tag.toLowerCase())
        )
      )
    : [];

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

  // Fungsi untuk menambah jumlah data yang ditampilkan
  const loadMore = () => {
    setDisplayCount(prevCount => prevCount + 6);
  };

  // Data yang akan ditampilkan (hanya sesuai displayCount)
  const displayedKeywordResults = keywordFiltered.slice(0, displayCount);
  const displayedTagResults = tagFiltered.slice(0, displayCount);

  // Cek apakah masih ada data yang belum ditampilkan
  const hasMoreKeywordResults = displayCount < keywordFiltered.length;
  const hasMoreTagResults = displayCount < tagFiltered.length;

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 bg-gray-50 min-h-screen max-w-screen-xl mx-auto">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6">
        {debouncedTerm ? (
          <>
            Menampilkan hasil untuk <span className="text-blue-600">"{debouncedTerm}"</span>
          </>
        ) : (
          <>Jelajahi destinasi dengan memilih tag di bawah ini</>
        )}
      </h1>

      {/* Search Input & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Cari pantai atau lokasi..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSelectedTags([]);
          }}
          className="flex-1 p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
        />
        <select
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
        >
          <option value={0}>Rating berapa saja</option>
          <option value={4}>Minimal 4.0</option>
          <option value={4.5}>Minimal 4.5</option>
        </select>
      </div>

      {/* Tags */}
      {searchTerm.trim() === '' && (
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {(showAllTags ? allTags : allTags.slice(0, 15)).map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="px-3 py-1 rounded-full text-sm border bg-white text-gray-700 hover:bg-blue-100 hover:text-blue-700"
              >
                #{tag}
              </button>
            ))}
          </div>
          {allTags.length > 15 && (
            <button
              onClick={() => setShowAllTags(!showAllTags)}
              className="text-blue-600 text-sm mt-1 hover:underline self-start"
            >
              {showAllTags ? 'Tampilkan Lebih Sedikit' : 'Tag Selengkapnya'}
            </button>
          )}
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading ? (
        <Spinner />
      ) : debouncedTerm && displayedKeywordResults.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedKeywordResults.map((place) => (
              <Card key={place.place_id} place={place} />
            ))}
          </div>
          {hasMoreKeywordResults && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Tampilkan Lebih Banyak
              </button>
            </div>
          )}
        </>
      ) : debouncedTerm && keywordFiltered.length === 0 ? (
        <p className="text-gray-600 text-center mt-10 text-base">
          Tidak ditemukan hasil untuk <strong>{debouncedTerm}</strong>.
        </p>
      ) : null}

      {!debouncedTerm && selectedTags.length > 0 && displayedTagResults.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedTagResults.map((place) => (
              <Card key={place.place_id} place={place} />
            ))}
          </div>
          {hasMoreTagResults && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                className="bg-sky-800 text-white px-6 py-2 rounded-md hover:bg-sky-500 transition"
              >
                Tampilkan Lebih Banyak
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Card component tetap sama
const Card = ({ place }) => (
  <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-md overflow-hidden transition-transform hover:scale-[1.01] hover:shadow-lg h-full">
    {/* Gambar */}
    <div className="w-full lg:w-1/2 h-64 lg:h-auto">
      <img
        src={place.featured_image}
        alt={place.name}
        onError={(e) => (e.target.src = '/fallback-image.jpg')}
        className="object-cover w-full h-full lg:h-full"
      />
    </div>

    {/* Konten */}
    <div className="w-full lg:w-1/2 flex flex-col justify-between bg-sky-50 p-4 md:p-6 h-full">
      <div className="flex-1">
        <h2 className="text-lg md:text-xl font-bold text-sky-800 mb-2">{place.name}</h2>
        <p className="text-sm md:text-base text-gray-700 mb-3 line-clamp-3">
          {place.description && place.description !== '-'
            ? place.description
            : 'Belum ada deskripsi tersedia.'}
        </p>
        <p className="text-sm md:text-base text-yellow-600 mb-2">
          ⭐ {place.rating} ({place.reviews.toLocaleString()} ulasan)
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {place.review_keywords.split(', ').map((keyword, index) => (
            <span
              key={index}
              className="bg-yellow-100 text-yellow-800 text-xs md:text-sm px-2 py-1 rounded-full"
            >
              #{keyword}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-500 mb-2">
          <strong>Alamat:</strong> {place.address}
        </p>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <a
          href={place.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-600 hover:underline text-sm"
        >
          Lihat di Google Maps
        </a>
        <a
          href={`/detail/${place.place_id}`}
          className="bg-[#00859D] text-white text-sm px-4 py-2 rounded-md hover:bg-sky-700 transition"
        >
          Detail
        </a>
      </div>
    </div>
  </div>
);

export default SearchPage;