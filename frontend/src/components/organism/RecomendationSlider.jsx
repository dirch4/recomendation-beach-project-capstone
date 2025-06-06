import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import 'swiper/css';

export const RecommendationSlider = ({ recommendedPlaces }) => {
  // Filter unique place_id
  const uniquePlaces = Array.from(
    new Map(recommendedPlaces.map(item => [item.place_id, item])).values()
  );

  return (
    <section className="max-w-6xl mx-auto py-10 px-6 mt-10">
      <h1 className="text-4xl font-bold text-center">Recommended For You</h1>
      <p className="font-normal mt-5 mb-10 text-center text-gray-600">
        Other tourist spots you might like
      </p>
      <Swiper
        loop
        modules={[Autoplay]}
        slidesPerView={1}
        spaceBetween={20}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="mySwiper cursor-pointer shadow-lg"
      >
        {uniquePlaces.map((recPlace) => (
          <SwiperSlide key={recPlace.place_id} className="h-full">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col min-h-[600px]">
              <img
                src={recPlace.featured_image}
                alt={recPlace.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{recPlace.name}</h3>
                <div className="flex items-center mb-2">
                  <span className="text-yellow-500">⭐ {recPlace.rating}</span>
                  <span className="text-gray-500 ml-2">
                    ({recPlace.reviews} reviews)
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {recPlace.description || 'Description not available'}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {recPlace.review_keywords &&
                    recPlace.review_keywords
                      .split(', ')
                      .slice(0, 6)
                      .map((keyword, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
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
                    View Map
                  </a>
                  <Link
                    to={`/detail/${recPlace.place_id}`}
                    className="bg-sky-900 text-sky-100 hover:bg-sky-700 px-4 py-2 rounded-md transition-colors text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};
