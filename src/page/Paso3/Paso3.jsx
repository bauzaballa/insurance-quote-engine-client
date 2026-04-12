import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './Paso3.module.scss';

import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { StepLayout, FormLayout } from '@/layouts';
import { getMarcas } from '@/services/vehicle';
import { useQuoteStore } from '@/stores/quoteStore';
import { useQuoteTabs } from '@/hooks/useQuoteTabs';
import Toyota from '@/assets/brands/cars/toyota.svg?react';
import Volkswagen from '@/assets/brands/cars/volkswagen.svg?react';
import Citroen from '@/assets/brands/cars/citroen.svg?react';
import Peugeot from '@/assets/brands/cars/peugeot.svg?react';
import ChevroletSvg from '@/assets/brands/cars/chevrolet.svg?react';
import Renault from '@/assets/brands/cars/renault.svg?react';
import Ford from '@/assets/brands/cars/ford.svg?react';
import fiatPng from '@/assets/brands/cars/fiat.png';
import Ducati from '@/assets/brands/motorcycles/ducati.svg?react';
import Triumph from '@/assets/brands/motorcycles/triump.svg?react';
import Honda from '@/assets/brands/motorcycles/honda.svg?react';
import Bajaj from '@/assets/brands/motorcycles/bajaj.svg?react';
import Yamaha from '@/assets/brands/motorcycles/yamaha.svg?react';
import Ktm from '@/assets/brands/motorcycles/ktm.svg?react';
import Kawasaki from '@/assets/brands/motorcycles/kawasaki.svg?react';
import Bmw from '@/assets/brands/motorcycles/bmw.svg?react';
import { Card } from '@/components/ui';

// Create car brands list
const carBrands = [
  { name: 'Fiat', logo: fiatPng, width: 41, height: 27, isPng: true },
  { name: 'Ford', logo: Ford, width: 76, height: 27 },
  { name: 'Renault', logo: Renault, width: 92, height: 72 },
  { name: 'Chevrolet', logo: ChevroletSvg, width: 57, height: 20 },
  { name: 'Peugeot', logo: Peugeot, width: 41, height: 37 },
  { name: 'Citroen', logo: Citroen, width: 40, height: 35 },
  { name: 'Volkswagen', logo: Volkswagen, width: 57, height: 47 },
  { name: 'Toyota', logo: Toyota, width: 47, height: 32 },
];

// Create motorcycle brands list
const motorcycleBrands = [
  { name: 'BMW', logo: Bmw, width: 55, height: 55 },
  { name: 'Kawasaki', logo: Kawasaki, width: 72, height: 36 },
  { name: 'KTM', logo: Ktm, width: 60, height: 50 },
  { name: 'Yamaha', logo: Yamaha, width: 65, height: 45 },
  { name: 'Bajaj', logo: Bajaj, width: 55, height: 55 },
  { name: 'Triumph', logo: Triumph, width: 70, height: 38 },
  { name: 'Honda', logo: Honda, width: 58, height: 58 },
  { name: 'Ducati', logo: Ducati, width: 68, height: 40 },
];

const valOf = x => (x && typeof x === 'object' ? x.value : (x ?? ''));

export function Paso3() {
  const navigate = useNavigate();
  const { tipoVehiculo } = useParams();
  const { quote, setVehicle } = useQuoteStore();
  const { tabs, onCloseTab } = useQuoteTabs();
  const [marca, setMarca] = React.useState('');
  const [marcas, setMarcas] = React.useState([]);
  const [loadingMarcas, setLoadingMarcas] = React.useState(false);

  const marcaRef = React.useRef(null);

  // Initialize marca from context if available
  React.useEffect(() => {
    if (quote.vehicle.marca) {
      setMarca(quote.vehicle.marca);
    }
  }, [quote.vehicle.marca]);

  // Handle brand image click
  const handleBrandClick = brandName => {
    // Find the brand in marcas array by name (case insensitive)
    const selectedBrand = marcas.find(
      marca =>
        marca.name.toLowerCase() === brandName.toLowerCase() ||
        marca.label?.toLowerCase() === brandName.toLowerCase()
    );

    if (selectedBrand) {
      setMarca(selectedBrand.value || selectedBrand.id);
      setVehicle({
        marca: selectedBrand.name || selectedBrand.label,
      });
      navigate(`/${tipoVehiculo}/modelo`);
    }
  };

  // Load brands filtered by year from context
  React.useEffect(() => {
    const year = quote.vehicle.anio;
    if (!year) return;

    let mounted = true;
    (async () => {
      setLoadingMarcas(true);
      try {
        const ms = await getMarcas({ year, pageSize: 100 });
        if (!mounted) return;
        setMarcas(ms);
      } catch (error) {
        console.error('Error loading brands:', error);
      } finally {
        if (mounted) setLoadingMarcas(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [quote.vehicle.anio]);
  return (
    <StepLayout>
      <FormLayout
        stepActual={1}
        title='Empecemos a buscar el mejor precio de seguro en 3 simples pasos'
        subtitle='¡Buenísimo! Ahora indicanos su marca.'
        tabs={tabs}
        onCloseTab={onCloseTab}
      >
        <SearchSelect
          ref={marcaRef}
          label={`¿Qué marca es tu ${tipoVehiculo}?`}
          value={marca}
          onChange={val => {
            const opt = marcas.find(o => String(valOf(o)) === String(valOf(val)));
            setVehicle({
              marca: opt?.name ?? opt?.label ?? String(valOf(val)),
            });
            if (val && val !== '') {
              navigate(`/${tipoVehiculo}/modelo`);
            }
          }}
          options={marcas}
          placeholder='Seleccioná marca'
          defaultOption={{ label: 'Seleccioná marca', value: '' }}
          loading={loadingMarcas}
          disabled={!quote.vehicle.anio || loadingMarcas}
          searchPlaceholder='Buscar marca'
        />
        <div className={styles.gridContainer}>
          {(tipoVehiculo === 'auto' ? carBrands : motorcycleBrands)
            .slice(0, 8) // Limit to 8 items max
            .map(brand => (
              <Card
                key={brand.name}
                className={`${styles.brandItem} ${brand.name === 'Renault' ? styles['brandItem--renault'] : ''}`}
                onClick={() => handleBrandClick(brand.name)}
              >
                {brand.isPng ? (
                  <img
                    src={brand.logo}
                    width={brand.width}
                    height={brand.height}
                    alt={brand.name}
                  />
                ) : (
                  <brand.logo width={brand.width} height={brand.height} />
                )}
              </Card>
            ))}
        </div>
      </FormLayout>
    </StepLayout>
  );
}
