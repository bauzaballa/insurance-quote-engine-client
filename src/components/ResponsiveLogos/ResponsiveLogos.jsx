import logosHome from '/src/assets/images/conjunto-iconos-seguros.svg';
import logosHomeMobile from '/src/assets/images/conjunto-iconos-seguros-mobile.svg';
import logosHomeTablet from '/src/assets/images/conjunto-iconos-seguros-tablet.svg';

export default function ResponsiveLogos({ className, showTablet = false }) {
  return (
    <div className={className}>
      <picture>
        {!showTablet && <source media='(max-width: 767px)' srcSet={logosHomeMobile} />}
        <source media='(max-width: 1023px)' srcSet={logosHomeTablet} />
        <img src={logosHome} alt='aseguradoras' className={className} />
      </picture>
    </div>
  );
}
