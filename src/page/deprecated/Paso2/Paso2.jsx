import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ls } from '@utils/ls';
import { PATHS } from '@utils/routes';

import styles from './Paso2.module.scss';

import { useQuote } from '@/context/QuoteContext';
import { startSanCristobalQuote } from '@/services/quotation';
import StepLayout from '@/layouts/StepLayout/StepLayout';

import btnArrow from '/src/assets/icons/arrow-btn-icon.svg';

export const Paso2 = () => {
  const navigate = useNavigate();
  const { quote, setUser } = useQuote();

  const restoreFromBack = sessionStorage.getItem('restoreFromBack') === '1';
  const canPersistRef = useRef(restoreFromBack);

  // ⬇️ Solo rehidratar desde LS si venís de VOLVER
  const [nombre, setNombre] = useState(restoreFromBack ? (ls.get('userNombre') ?? '') : '');
  const [email, setEmail] = useState(restoreFromBack ? (ls.get('userEmail') ?? '') : '');
  const [telefono, setTelefono] = useState(restoreFromBack ? (ls.get('userTelefono') ?? '') : '');
  const [edad, setEdad] = useState(restoreFromBack ? (ls.get('userEdad') ?? '') : '');

  useEffect(() => {
    if (restoreFromBack) {
      sessionStorage.removeItem('restoreFromBack');
    } else {
      ls.clearQuoteStep2?.();
    }
  }, []);

  useEffect(() => {
    if (!canPersistRef.current) return;
    ls.saveQuoteStep2?.({ nombre, email, telefono, edad });
  }, [nombre, email, telefono, edad]);

  // Validaciones
  const validEmail = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validTelefono = !telefono || /^\d{6,15}$/.test(telefono.replace(/\D/g, ''));
  const validEdad = !edad || (Number(edad) > 0 && Number(edad) >= 18 && Number(edad) <= 100);

  const canContinue =
    nombre.trim() !== '' &&
    email.trim() !== '' &&
    telefono.trim() !== '' &&
    edad.toString().trim() !== '' &&
    validEmail &&
    validTelefono &&
    validEdad;

  const handleContinue = async () => {
    if (!canContinue) return;

    setUser({ nombre, email, telefono, edad });

    try {
      if (quote?.quoteId) {
        await startSanCristobalQuote(
          {
            vehicle: quote.vehicle,
            location: quote.location,
            user: { nombre, email, telefono, edad },
          },
          quote.quoteId
        );
      }
    } catch (error) {
      console.warn('Error starting San Cristobal quote:', error.message);
    }

    navigate(PATHS.paso3);
  };

  return (
    <StepLayout
      stepActual={3}
      footer={
        <div className={styles.footerContainer}>
          <button
            className={styles.BtnContinuar}
            onClick={() => {
              sessionStorage.setItem('restoreFromBack', '1');
              navigate(PATHS.paso1);
            }}
          >
            <span className={styles.textButton}>
              VOLVER
              <img src={btnArrow} alt='' className={styles.btnIcon} />
            </span>
          </button>

          <button
            className={`${styles.BtnContinuar} ${!canContinue ? styles.disable : ''}`}
            disabled={!canContinue}
            onClick={handleContinue}
          >
            <span className={styles.textButton}>
              SEGUIR
              <img src={btnArrow} alt='' className={styles.btnIcon} />
            </span>
          </button>
        </div>
      }
    >
      <div className={styles.selectContainer}>
        <h2>Completá tus datos personales.</h2>

        <div className={styles.selectRow}>
          <div className={styles.inputGroup}>
            <span className={styles.label}>Nombre</span>
            <input
              className={styles.input}
              type='text'
              placeholder='Ej: Juan Pérez'
              value={nombre}
              onChange={e => {
                const v = e.target.value;
                setNombre(v);
                setUser({ nombre: v });
              }}
              id='nombre'
              name='nombre'
            />
          </div>

          <div className={styles.inputGroup}>
            <span className={styles.label}>Email</span>
            <input
              className={styles.input}
              type='email'
              placeholder='ejemplo@email.com'
              value={email}
              onChange={e => {
                const v = e.target.value;
                setEmail(v);
                setUser({ email: v });
              }}
              id='email'
              name='email'
            />
            {!validEmail && <span className={styles.errorMsg}>Ingresá un email válido</span>}
          </div>

          <div className={styles.inputGroup}>
            <span className={styles.label}>Teléfono</span>
            <input
              className={styles.input}
              type='tel'
              placeholder='2211234567'
              value={telefono}
              onChange={e => {
                const v = e.target.value;
                setTelefono(v);
                setUser({ telefono: v });
              }}
              id='telefono'
              name='telefono'
            />
            {!validTelefono && <span className={styles.errorMsg}>Solo números (6–15 dígitos)</span>}
          </div>

          <div className={styles.inputGroup}>
            <span className={styles.label}>Edad</span>
            <input
              className={styles.input}
              type='number'
              placeholder='Ej: 30'
              value={edad}
              onChange={e => {
                const v = e.target.value;
                setEdad(v);
                setUser({ edad: v });
              }}
              min='18'
              max='100'
              id='edad'
              name='edad'
            />
            {edad && Number(edad) > 0 && Number(edad) < 18 && (
              <span className={styles.errorMsg}>Debes ser mayor de edad</span>
            )}
            {edad && Number(edad) > 100 && (
              <span className={styles.errorMsg}>La edad no puede ser mayor a 100 años</span>
            )}
            {edad && Number(edad) <= 0 && (
              <span className={styles.errorMsg}>Ingresá una edad válida</span>
            )}
          </div>
        </div>
      </div>
    </StepLayout>
  );
};

export default Paso2;
