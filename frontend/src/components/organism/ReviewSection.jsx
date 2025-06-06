import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { ReviewCard } from '../layouts/ReviewCard';

export const ReviewsSection = ({ feedbacks, isLoggedIn, user, openDropdownId, setOpenDropdownId, handleEditClick, handleDeleteClick, swiperRef }) => (
  <section className="max-w-6xl mx-auto py-10 px-6 bg-white mt-10 rounded-md shadow-md">
    <h1 className="text-4xl font-bold text-center">Customer Reviews</h1>
    <p className="font-normal mt-3 mb-8 text-center text-gray-600">
      Don't just trust us, trust our customers
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
      onSwiper={(swiper) => (swiperRef.current = swiper)}
      className="mySwiper cursor-pointer shadow-lg"
    >
      {feedbacks.length === 0 ? (
        <SwiperSlide>
          <div className="p-6 text-center text-gray-500">
            There are no reviews for this place yet. Be the first!
          </div>
        </SwiperSlide>
      ) : (
        feedbacks.map((feedback) => (
          <SwiperSlide key={feedback.id}>
            <ReviewCard
              feedback={feedback}
              isOwner={isLoggedIn && user?.name === feedback.name}
              isOpen={openDropdownId === feedback.id}
              onEdit={() => { handleEditClick(feedback); setOpenDropdownId(null); }}
              onDelete={() => { handleDeleteClick(feedback); setOpenDropdownId(null); }}
              onToggleDropdown={() => setOpenDropdownId(openDropdownId === feedback.id ? null : feedback.id)}
            />
          </SwiperSlide>
        ))
      )}
    </Swiper>
  </section>
);