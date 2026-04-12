import styles from './marquee.module.scss';

// Import all brand SVGs as React components
import ProvinciaLogo from '@/assets/brands/provincia-seguros.svg?react';
import MercantilLogo from '@/assets/brands/mercantil-seguros.svg?react';
import AtmLogo from '@/assets/brands/atm-seguros.svg?react';
import SanCristobalLogo from '@/assets/brands/san-cristobal.svg?react';
import FedpatCarouselLogo from '@/assets/brands/fedpat-carousel.svg?react';

const BRANDS = [
  { name: 'Provincia', Logo: ProvinciaLogo },
  { name: 'Mercantil Andina', Logo: MercantilLogo },
  { name: 'ATM', Logo: AtmLogo },
  { name: 'Federacion Patronal', Logo: FedpatCarouselLogo },
  { name: 'San Cristóbal', Logo: SanCristobalLogo },
];

const Marquee = ({ className = '' }) => {
  return (
    <div className={`${styles.marqueeContainer} ${className}`}>
      <div className={styles.marquee}>
        <div className={styles.marqueeContent}>
          {BRANDS.concat(BRANDS).map((brand, index) => {
            const LogoComponent = brand.Logo;
            return (
              <div key={`${brand.name}-${index}`} className={styles.brandItem}>
                <LogoComponent
                  className={styles.brandLogo}
                  title={`${brand.name} logo`}
                  fill='#001514'
                />
              </div>
            );
          })}
        </div>
        <div className={styles.marqueeContent}>
          {BRANDS.concat(BRANDS).map((brand, index) => {
            const LogoComponent = brand.Logo;
            return (
              <div key={`${brand.name}-duplicate-${index}`} className={styles.brandItem}>
                <LogoComponent
                  className={styles.brandLogo}
                  title={`${brand.name} logo`}
                  fill='#001514'
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Marquee;
