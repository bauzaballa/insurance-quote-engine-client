import styles from './marquee-vertical.module.scss';

const MarqueeVertical = ({
  images = [],
  className = '',
  reverse = false,
  isInitialized = true,
}) => {
  // Duplicate images for seamless infinite scroll
  const duplicatedImages = [...images, ...images];

  return (
    <div
      className={`${styles.marqueeContainer} ${reverse ? styles.reverse : ''} ${isInitialized ? styles.initialized : ''} ${className}`}
    >
      <div className={styles.marquee}>
        <div className={styles.marqueeContent}>
          {duplicatedImages.map((image, index) => (
            <div key={`${image.src}-${index}`} className={styles.imageItem}>
              <img src={image.src} alt={image.alt || `Image ${index + 1}`} loading='lazy' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarqueeVertical;
