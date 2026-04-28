import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ProductCarousel = ({ images, isSold, name, id }) => {
  // Check if images is an array, or if it's a single string, or fallback to an empty array
  let displayImages = [];
  if (Array.isArray(images) && images.length > 0) {
    displayImages = images.filter(Boolean);
  } else if (typeof images === 'string' && images.trim() !== '') {
    displayImages = [images];
  }
  
  if (displayImages.length === 0) {
    displayImages = ["https://images.unsplash.com/photo-1541888009187-54b38dcd2b31?auto=format&fit=crop&q=80&w=800"];
  }

  return (
    <div className="relative h-full w-full group/carousel">
      <Swiper
        modules={[Navigation, Pagination]}
        navigation={{
          prevEl: '.swiper-button-prev-custom',
          nextEl: '.swiper-button-next-custom',
        }}
        pagination={{ clickable: true }}
        loop={displayImages.length > 1}
        className="h-full w-full"
      >
        {displayImages.map((img, index) => (
          <SwiperSlide key={index}>
            <Link to={`/products/${id}`} className="block h-full w-full bg-slate-100 flex items-center justify-center">
              <img
                src={img}
                alt={`${name || 'Product'} - view ${index + 1}`}
                className={`w-full h-full object-cover transition-transform duration-700 ${isSold ? "grayscale-[0.5]" : "group-hover:scale-105"}`}
                loading="lazy"
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      
      {displayImages.length > 1 && (
        <>
          <button className="swiper-button-prev-custom absolute left-3 top-1/2 -translate-y-1/2 z-10 w-[42px] h-[42px] rounded-full bg-white/95 shadow-[0_8px_18px_rgba(0,0,0,0.10)] flex items-center justify-center text-slate-800 opacity-0 group-hover/carousel:opacity-100 transition-all duration-[350ms] ease-in-out hover:scale-[1.08] disabled:opacity-0 hidden md:flex cursor-pointer">
            <ChevronLeft size={24} />
          </button>
          <button className="swiper-button-next-custom absolute right-3 top-1/2 -translate-y-1/2 z-10 w-[42px] h-[42px] rounded-full bg-white/95 shadow-[0_8px_18px_rgba(0,0,0,0.10)] flex items-center justify-center text-slate-800 opacity-0 group-hover/carousel:opacity-100 transition-all duration-[350ms] ease-in-out hover:scale-[1.08] disabled:opacity-0 hidden md:flex cursor-pointer">
            <ChevronRight size={24} />
          </button>
        </>
      )}
      {/* Dark overlay gradient at bottom of image for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-[5]" />
    </div>
  );
};

export default ProductCarousel;
