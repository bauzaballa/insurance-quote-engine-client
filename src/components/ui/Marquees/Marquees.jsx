import { useState, useEffect, useRef } from 'react';

import MarqueeVertical from '../Marquee/MarqueeVertical';

import styles from './Marquees.module.scss';

// Import images from different carousel folders
import carousel1_1 from '@/assets/images/carousel-1/1.webp';
import carousel1_2 from '@/assets/images/carousel-1/2.webp';
import carousel1_3 from '@/assets/images/carousel-1/3.webp';
import carousel1_4 from '@/assets/images/carousel-1/4.webp';
import carousel2_1 from '@/assets/images/carousel-2/1.webp';
import carousel2_2 from '@/assets/images/carousel-2/2.webp';
import carousel2_3 from '@/assets/images/carousel-2/3.webp';
import carousel2_4 from '@/assets/images/carousel-2/4.webp';
import carousel2_5 from '@/assets/images/carousel-2/5.webp';
import carousel3_2 from '@/assets/images/carousel-3/2.png';
import carousel3_3 from '@/assets/images/carousel-3/3.webp';
import carousel3_4 from '@/assets/images/carousel-3/4.webp';
import carousel4_1 from '@/assets/images/carousel-4/1.webp';
import carousel4_2 from '@/assets/images/carousel-4/2.webp';
// import carousel4_3 from '@/assets/images/carousel-4/3.webp';
import carousel4_4 from '@/assets/images/carousel-4/4.webp';

const CAROUSEL_1_IMAGES = [
  { src: carousel1_1, alt: 'Carousel 1 - Image 1' },
  { src: carousel1_2, alt: 'Carousel 1 - Image 2' },
  { src: carousel1_3, alt: 'Carousel 1 - Image 3' },
  { src: carousel1_4, alt: 'Carousel 1 - Image 4' },
];

const CAROUSEL_2_IMAGES = [
  { src: carousel2_1, alt: 'Carousel 2 - Image 1' },
  { src: carousel2_2, alt: 'Carousel 2 - Image 2' },
  { src: carousel2_3, alt: 'Carousel 2 - Image 3' },
  { src: carousel2_4, alt: 'Carousel 2 - Image 4' },
  { src: carousel2_5, alt: 'Carousel 2 - Image 5' },
  { src: carousel2_1, alt: 'Carousel 2 - Image 1' },
  { src: carousel2_2, alt: 'Carousel 2 - Image 2' },
  { src: carousel2_3, alt: 'Carousel 2 - Image 3' },
  { src: carousel2_4, alt: 'Carousel 2 - Image 4' },
  { src: carousel2_5, alt: 'Carousel 2 - Image 5' },
];

const CAROUSEL_3_IMAGES = [
  // { src: carousel3_1, alt: 'Carousel 3 - Image 1' },
  { src: carousel1_3, alt: 'Carousel 3 - Image 1' },
  { src: carousel3_2, alt: 'Carousel 3 - Image 2' },
  { src: carousel3_3, alt: 'Carousel 3 - Image 3' },
  { src: carousel3_4, alt: 'Carousel 3 - Image 4' },
];

const CAROUSEL_4_IMAGES = [
  { src: carousel4_1, alt: 'Carousel 4 - Image 1' },
  { src: carousel4_2, alt: 'Carousel 4 - Image 2' },
  { src: carousel1_4, alt: 'Carousel 4 - Image 3' },
  { src: carousel4_4, alt: 'Carousel 4 - Image 4' },
  { src: carousel4_1, alt: 'Carousel 4 - Image 1' },
  { src: carousel4_2, alt: 'Carousel 4 - Image 2' },
  { src: carousel1_4, alt: 'Carousel 4 - Image 3' },
  { src: carousel4_4, alt: 'Carousel 4 - Image 4' },
];

const Marquees = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const containerRef = useRef(null);

  // Initialize animations after component mounts
  useEffect(() => {
    // Check if we're on mobile for additional delay
    const isMobile = window.innerWidth <= 1023;
    const initDelay = isMobile ? 300 : 100; // Longer delay on mobile

    // Small delay to ensure DOM is ready and prevent freezing on first load
    const initTimer = setTimeout(() => {
      setIsInitialized(true);
    }, initDelay);

    return () => clearTimeout(initTimer);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only update visibility if component is initialized
        if (isInitialized) {
          setIsVisible(entry.isIntersecting);
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '50px', // Start observing 50px before element enters viewport
      }
    );

    observer.observe(containerRef.current);

    // Check initial visibility after observer is set up
    const checkInitialVisibility = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
        if (isInViewport && isInitialized) {
          setIsVisible(true);
        }
      }
    };

    // Check initial visibility after a short delay
    const visibilityTimer = setTimeout(checkInitialVisibility, 200);

    return () => {
      observer.disconnect();
      clearTimeout(visibilityTimer);
    };
  }, [isInitialized]);

  return (
    <div
      ref={containerRef}
      className={`${styles.marquees} ${className} ${!isVisible || !isInitialized ? styles.paused : ''}`}
    >
      {/* Gradient fade at the top */}
      <div className={styles.topFade} />
      {/* Main marquee container */}
      <div className={styles.marqueeGrid}>
        <MarqueeVertical images={CAROUSEL_1_IMAGES} isInitialized={isInitialized} />
        <MarqueeVertical images={CAROUSEL_2_IMAGES} reverse isInitialized={isInitialized} />
        <MarqueeVertical images={CAROUSEL_3_IMAGES} isInitialized={isInitialized} />
        <MarqueeVertical images={CAROUSEL_4_IMAGES} reverse isInitialized={isInitialized} />
      </div>
      {/* Gradient fade at the bottom */}
      <div className={styles.bottomFade} />
    </div>
  );
};

export default Marquees;
