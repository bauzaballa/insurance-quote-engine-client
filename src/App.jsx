import { BrowserRouter, Route, Routes, Navigate, useParams } from 'react-router-dom';

import '@/styles/index.css';
import { Paso0 } from './page/Paso0/Paso0';
import { Paso1 } from './page/Paso1/Paso1';
import { Paso2 } from './page/Paso2/Paso2';
import { Paso3 } from './page/Paso3/Paso3';
import { Paso4 } from './page/Paso4/Paso4';
import { Paso5 } from './page/Paso5/Paso5';
import { Paso6 } from './page/Paso6/Paso6';
import { Paso7 } from './page/Paso7/Paso7';
import { Paso8 } from './page/Paso8/Paso8';
import { Paso9 } from './page/Paso9/Paso9';
import { Paso10 } from './page/Paso10/Paso10';
import { Paso11 } from './page/Paso11/Paso11';
import { Paso12 } from './page/Paso12/Paso12';
import { Paso13 } from './page/Paso13/Paso13';

// Component wrapper to validate tipoVehiculo parameter
function ValidTipoVehiculoRoute({ children }) {
  const { tipoVehiculo } = useParams();

  // Valid vehicle types
  const validTypes = ['auto', 'moto'];

  // If tipoVehiculo is not valid, redirect to same route with 'auto' as fallback
  if (!validTypes.includes(tipoVehiculo)) {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    // Replace invalid tipoVehiculo with 'auto'
    pathParts[1] = 'auto';
    const newPath = pathParts.join('/');
    return <Navigate to={newPath} replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Paso0 />} />
        <Route path='/tipo-vehiculo' element={<Paso1 />} />
        <Route
          path='/:tipoVehiculo/anio'
          element={
            <ValidTipoVehiculoRoute>
              <Paso2 />
            </ValidTipoVehiculoRoute>
          }
        />
        <Route
          path='/:tipoVehiculo/marca'
          element={
            <ValidTipoVehiculoRoute>
              <Paso3 />
            </ValidTipoVehiculoRoute>
          }
        />
        <Route
          path='/:tipoVehiculo/modelo'
          element={
            <ValidTipoVehiculoRoute>
              <Paso4 />
            </ValidTipoVehiculoRoute>
          }
        />
        <Route
          path='/:tipoVehiculo/version'
          element={
            <ValidTipoVehiculoRoute>
              <Paso5 />
            </ValidTipoVehiculoRoute>
          }
        />
        <Route
          path='/:tipoVehiculo/provincia'
          element={
            <ValidTipoVehiculoRoute>
              <Paso6 />
            </ValidTipoVehiculoRoute>
          }
        />
        <Route
          path='/:tipoVehiculo/localidad'
          element={
            <ValidTipoVehiculoRoute>
              <Paso7 />
            </ValidTipoVehiculoRoute>
          }
        />
        <Route
          path='/:tipoVehiculo/datos-personales'
          element={
            <ValidTipoVehiculoRoute>
              <Paso8 />
            </ValidTipoVehiculoRoute>
          }
        />
        <Route
          path='/:tipoVehiculo/email'
          element={
            <ValidTipoVehiculoRoute>
              <Paso9 />
            </ValidTipoVehiculoRoute>
          }
        />
        <Route
          path='/:tipoVehiculo/telefono'
          element={
            <ValidTipoVehiculoRoute>
              <Paso10 />
            </ValidTipoVehiculoRoute>
          }
        />
        <Route
          path='/:tipoVehiculo/edad'
          element={
            <ValidTipoVehiculoRoute>
              <Paso11 />
            </ValidTipoVehiculoRoute>
          }
        />
        <Route
          path='/:tipoVehiculo/resultados'
          element={
            <ValidTipoVehiculoRoute>
              <Paso12 />
            </ValidTipoVehiculoRoute>
          }
        />
        <Route
          path='/:tipoVehiculo/finalizar'
          element={
            <ValidTipoVehiculoRoute>
              <Paso13 />
            </ValidTipoVehiculoRoute>
          }
        />

        {/* Catch-all route */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
