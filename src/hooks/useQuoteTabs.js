import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useQuoteStore } from '@/stores/quoteStore';

/**
 * Hook para manejar las tabs basadas en el progreso de la cotización
 * Mapea las secciones completadas a tabs que se pueden cerrar
 */
export function useQuoteTabs() {
  const { quote, resetUser, resetLocation, getCompletedSections, setVehicle } = useQuoteStore();

  const { tipoVehiculo } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Mapeo de rutas a secciones
  const routeToSection = {
    anio: 'vehicle',
    marca: 'vehicle',
    modelo: 'vehicle',
    version: 'vehicle',
    provincia: 'location',
    localidad: 'location',
    'datos-personales': 'user',
    email: 'user',
    telefono: 'user',
    edad: 'user',
  };

  // Mapeo de campos a rutas para navegación
  const fieldToRoute = {
    marca: 'marca',
    anio: 'anio',
    modelo: 'modelo',
    version: 'version',
    provincia: 'provincia',
    localidad: 'localidad',
    nombre: 'datos-personales',
  };

  // Determinar sección actual basada en la ruta
  const currentPath = location.pathname.split('/').pop();
  const currentSection = routeToSection[currentPath] || null;

  // Calcular qué secciones están completas basado en datos existentes
  const completedSections = useMemo(() => {
    return getCompletedSections();
  }, [getCompletedSections, quote]);

  // Definir el orden de los pasos según las rutas
  const stepOrder = [
    'tipo-vehiculo',
    'anio',
    'marca',
    'modelo',
    'version',
    'provincia',
    'localidad',
    'datos-personales',
    'email',
    'telefono',
    'edad',
  ];

  // Generar tabs basados en la ruta actual y secciones completadas
  const { tabs, tabFieldMap } = useMemo(() => {
    const result = [];
    const mapping = [];

    // Determinar hasta qué paso mostrar tabs basado en la ruta actual
    const currentStepIndex = stepOrder.indexOf(currentPath);
    if (currentStepIndex === -1) {
      return { tabs: result, tabFieldMap: mapping };
    }

    // Obtener los pasos completados hasta el paso actual
    const stepsToShow = stepOrder.slice(0, currentStepIndex);

    // Determinar qué campo corresponde a la ruta actual para excluirlo
    const currentField = Object.keys(fieldToRoute).find(
      field => fieldToRoute[field] === currentPath
    );

    // Mapear cada paso completado a su sección correspondiente (mantener orden del flujo)
    const sectionsInOrder = [];
    stepsToShow.forEach(step => {
      const section = routeToSection[step];
      if (section && !sectionsInOrder.includes(section)) {
        sectionsInOrder.push(section);
      }
    });

    // Generar tabs solo para las secciones que están en el flujo hasta el paso actual
    sectionsInOrder.forEach(section => {
      if (completedSections.includes(section)) {
        switch (section) {
          case 'vehicle': {
            // Solo agregar tabs para los steps que están antes del actual
            const vehicleTabs = [];
            const vehicleMapping = [];

            stepsToShow.forEach(step => {
              if (routeToSection[step] === 'vehicle') {
                const field = Object.keys(fieldToRoute).find(key => fieldToRoute[key] === step);
                if (field && field !== currentField) {
                  const value = quote.vehicle[field];
                  if (value) {
                    vehicleTabs.push({ field, value });
                    vehicleMapping.push({ field, section: 'vehicle', value });
                  }
                }
              }
            });

            // Ordenar los tabs de vehicle en orden cronológico: año → marca → modelo → versión
            const order = ['anio', 'marca', 'modelo', 'version'];
            vehicleTabs.sort((a, b) => order.indexOf(a.field) - order.indexOf(b.field));

            vehicleTabs.forEach(tab => {
              result.push(tab.value);
              mapping.push(vehicleMapping.find(m => m.field === tab.field));
            });
            break;
          }
          case 'location': {
            // Solo agregar tabs para los steps que están antes del actual
            stepsToShow.forEach(step => {
              if (routeToSection[step] === 'location') {
                const field = Object.keys(fieldToRoute).find(key => fieldToRoute[key] === step);
                if (field && field !== currentField) {
                  const value = quote.location[field];
                  if (value) {
                    result.push(value);
                    mapping.push({ field, section: 'location', value });
                  }
                }
              }
            });
            break;
          }
        }
      }
    });

    return { tabs: result, tabFieldMap: mapping };
  }, [completedSections, quote, currentPath, routeToSection, stepOrder, fieldToRoute]);

  // Función para cerrar tabs desde un índice hacia adelante (incluyendo el índice)
  const handleCloseTab = index => {
    // Obtener el tab que se está cerrando
    const tabToClose = tabFieldMap[index];
    if (!tabToClose) return;

    // Navegar a la ruta del tab que se está cerrando
    const routeToNavigate = fieldToRoute[tabToClose.field];
    if (routeToNavigate) {
      navigate(`/${tipoVehiculo}/${routeToNavigate}`);
    }

    // Determinar qué tabs resetear (desde el índice hacia adelante)
    const tabsToReset = tabFieldMap.slice(index);

    // Agrupar campos a resetear por sección
    const fieldsToResetBySection = {};
    tabsToReset.forEach(tab => {
      if (!fieldsToResetBySection[tab.section]) {
        fieldsToResetBySection[tab.section] = new Set();
      }
      fieldsToResetBySection[tab.section].add(tab.field);
    });

    // Reset vehicle fields
    if (fieldsToResetBySection.vehicle) {
      const vehicleResets = {};
      ['marca', 'anio', 'modelo', 'version', 'codInfoAuto'].forEach(field => {
        if (fieldsToResetBySection.vehicle.has(field)) {
          vehicleResets[field] = '';
        }
      });
      if (Object.keys(vehicleResets).length > 0) {
        setVehicle(vehicleResets);
      }
    }

    // Reset location fields
    if (fieldsToResetBySection.location) {
      resetLocation();
    }

    // Reset user si se está reseteando algún campo de user
    if (fieldsToResetBySection.user) {
      resetUser();
    }
  };

  return {
    tabs,
    onCloseTab: handleCloseTab,
    completedSections,
    currentSection,
  };
}
