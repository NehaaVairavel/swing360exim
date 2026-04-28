import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageUrl';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const fallbackSvg = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23f1f5f9' width='800' height='600'/%3E%3Cpath fill='%23cbd5e1' d='M300 250h200v100H300zM350 200h100v50H350z'/%3E%3Ccircle fill='%2394a3b8' cx='350' cy='350' r='30'/%3E%3Ccircle fill='%2394a3b8' cx='450' cy='350' r='30'/%3E%3Ctext x='400' y='420' font-family='sans-serif' font-size='24' font-weight='bold' fill='%2364748b' text-anchor='middle'%3EMachine Image%3C/text%3E%3C/svg%3E";

const ImageWithLoader = ({ src, alt, isSold }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden">
      {!loaded && !error && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse shimmer-effect" />
      )}
      <img
        src={error || !src ? fallbackSvg : src}
        alt={alt}
        className={`transition-all duration-700 ${isSold ? "grayscale-[0.5]" : "group-hover:scale-105"} ${loaded || error ? 'opacity-100' : 'opacity-0'}`}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!error) {
            setError(true);
            setLoaded(true);
          }
        }}
      />
    </div>
  );
};

const ProductCarousel = ({ images, isSold, name, id }) => {
  // Ensure images is always treated as an array and format the URLs
  let displayImages = [];
  if (Array.isArray(images) && images.length > 0) {
    displayImages = images.map(img => getImageUrl(img)).filter(Boolean);
  } else if (typeof images === 'string' && images.trim() !== '') {
    displayImages = [getImageUrl(images)].filter(Boolean);
  }
  
  if (displayImages.length === 0) {
    displayImages = [fallbackSvg];
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
            <Link to={`/products/${id}`} className="block h-full w-full">
              <ImageWithLoader src={img} alt={`${name || 'Product'} - view ${index + 1}`} isSold={isSold} />
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
