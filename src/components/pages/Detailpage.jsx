import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import cleaned_data from '../../data/cleaned_data-asli_formatted.json';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Navigation, Pagination } from 'swiper/modules';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import gambar marker secara langsung
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Perbaikan masalah icon marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DetailPage = () => {
  const swiperRef = useRef(null);
  const recommendationSwiperRef = useRef(null);
  const { placeId } = useParams();
  const [newFeedback, setNewFeedback] = useState({
    rating: 0,
    comment: '',
  });

  // Fungsi untuk parsing koordinat dengan error handling
  const parseCoordinates = (coordString) => {
    if (!coordString || typeof coordString !== 'string') {
      console.error('Invalid coordinate string:', coordString);
      return [-6.2088, 106.8456]; // Default coordinates (Jakarta)
    }

    try {
      const [latStr, lngStr] = coordString.split(',');
      const lat = parseFloat(latStr.trim());
      const lng = parseFloat(lngStr.trim());
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinate values');
      }

      return [lat, lng];
    } catch (error) {
      console.error('Error parsing coordinates:', error);
      return [-6.2088, 106.8456]; // Fallback coordinates
    }
  };

  const handleStarClick = (rating) => {
    setNewFeedback({
      ...newFeedback,
      rating,
    });
  };
  
  useEffect(() => {
    window.scrollTo(0, 0); 
  }, [placeId]);

  // Temukan tempat wisata berdasarkan ID
  const place = cleaned_data.find(p => p.place_id === placeId);
  
  // Rekomendasi tempat wisata lainnya
  const recommendedPlaces = cleaned_data
    .filter(p => p.place_id !== placeId)
    .slice(0, 10); 

  // Data feedback dummy
  const [feedbacks, setFeedbacks] = useState([
    {
      name: 'Dimas',
      rating: 4,
      comment: 'Tempatnya sangat bagus dan bersih. Pelayanan juga ramah.',
    },
    {
      name: 'Rina',
      rating: 5,
      comment: 'Pemandangan indah, cocok untuk liburan keluarga.',
    },
    {
      name: 'Adi',
      rating: 4,
      comment: 'Fasilitas lengkap dan harga terjangkau.',
    },
  ]);

  if (!place) {
    return <div className="p-6 text-center text-red-500">Tempat wisata tidak ditemukan.</div>;
  }

  // Parse koordinat untuk peta
  const coordinates = parseCoordinates(place.coordinates);

  return (
    <div className="p-6 bg-gradient-to-b from-[#dcefff] to-white max-w-7xl mx-auto">
      {/* Bagian Detail Tempat Wisata */}
      <section className="max-w-6xl mx-auto p-6 bg-white rounded-md shadow-md mt-8">
        <img
          src={place.featured_image}
          alt={place.name}
          className="w-full h-3/4 object-cover rounded-xl mb-4"
          onError={(e) => {
            e.target.src = '/placeholder-image.jpg';
          }}
        />
        <h1 className="text-4xl font-bold text-gray-800">{place.name}</h1>
        <p className="text-lg text-gray-600 mt-2">{place.description}</p>
        
        <div className="flex items-center mt-2">
          <span className="text-yellow-500 text-xl">⭐ {place.rating}</span>
          <span className="text-gray-500 ml-2">({place.reviews} ulasan)</span>
        </div>

        {/* Bagian Peta Leaflet */}
        <div className="mt-8">
          <h2 className="text-3xl font-bold mb-4 text-center">Lokasi</h2>
          <div className="h-[450px] w-full rounded-lg overflow-hidden">
            <MapContainer 
              center={coordinates} 
              zoom={15} 
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={coordinates}>
                <Popup>
                  <div className="max-w-xs">
                    <h3 className="font-bold text-lg">{place.name}</h3>
                    <p className="text-sm text-gray-600">{place.address}</p>
                    <a 
                      href={place.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Buka di Google Maps
                    </a>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            <span className="font-semibold">Alamat:</span> {place.address}
          </p>
        </div>
      </section>

      {/* Bagian Feedback Pelanggan */}
      <section className="max-w-6xl mx-auto py-10 px-6 bg-white mt-10 rounded-md shadow-md">
        <h1 className="text-4xl font-bold text-center">Ulasan Pelanggan</h1>
        <p className="font-normal mt-3 mb-8 text-center text-gray-600">
          Jangan percaya kata kami, percaya pelanggan kami
        </p>

        <Swiper
          loop={true}
          modules={[Navigation, Pagination]}
          slidesPerView={1}
          spaceBetween={20}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          className="mySwiper cursor-pointer"
        >
          {feedbacks.map((feedback, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white border p-6 rounded-md shadow-md mb-6 h-full">
                <div className="font-semibold text-lg text-gray-800">{feedback.name}</div>
                <div className="flex items-center text-yellow-600 mt-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className={`text-2xl ${feedback.rating >= i + 1 ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-gray-600">{feedback.comment}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Form Feedback */}
      <section className="max-w-6xl mx-auto px-6 py-8 bg-white rounded-md shadow-md mt-8 mb-8">
        <h1 className="text-4xl font-bold text-center">Beri Ulasan Anda</h1>
        <p className="font-normal mt-5 mb-10 text-center text-gray-600">
          Bagikan pengalaman Anda mengunjungi tempat ini
        </p>
        
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newFeedback.comment && newFeedback.rating > 0) {
              setFeedbacks([
                ...feedbacks,
                {
                  name: 'Pengunjung',
                  rating: newFeedback.rating,
                  comment: newFeedback.comment,
                },
              ]);
              setNewFeedback({ rating: 0, comment: '' });
            }
          }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex justify-center space-x-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className={`text-4xl ${newFeedback.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                onClick={() => handleStarClick(star)}
              >
                ★
              </button>
            ))}
          </div>
          
          <div className="mb-6">
            <textarea
              placeholder="Tulis ulasan Anda di sini..."
              value={newFeedback.comment}
              onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="5"
              required
            />
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Kirim Ulasan
            </button>
          </div>
        </form>
      </section>

      {/* Rekomendasi Tempat Lain */}
      <section className="max-w-6xl mx-auto py-10 px-6 mt-10">
        <h1 className="text-4xl font-bold text-center">Rekomendasi Untuk Anda</h1>
        <p className="font-normal mt-5 mb-10 text-center text-gray-600">
          Tempat wisata lain yang mungkin Anda sukai
        </p>

        <Swiper
          loop={true}
          modules={[Navigation, Pagination]}
          slidesPerView={1}
          spaceBetween={20}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          onSwiper={(swiper) => (recommendationSwiperRef.current = swiper)}
          className="mySwiper cursor-pointer"
        >
          {recommendedPlaces.map((recPlace) => (
            <SwiperSlide key={recPlace.place_id}>
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <img
                  src={recPlace.featured_image}
                  alt={recPlace.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                
                <div className="p-6 flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{recPlace.name}</h3>
                  
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-500">⭐ {recPlace.rating}</span>
                    <span className="text-gray-500 ml-2">({recPlace.reviews} ulasan)</span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {recPlace.description || 'Deskripsi tidak tersedia'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {recPlace.review_keywords && 
                      recPlace.review_keywords.split(', ').slice(0, 3).map((keyword, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                        >
                          {keyword}
                        </span>
                      ))
                    }
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <a
                      href={recPlace.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Lihat Peta
                    </a>
                    <Link
                      to={`/detail/${recPlace.place_id}`}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </div>
  );
};

export default DetailPage;