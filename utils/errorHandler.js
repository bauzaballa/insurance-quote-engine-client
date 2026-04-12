// utils/errorHandler.js

/**
 * Maneja errores de API de forma consistente
 */
export function handleApiError(error, context = '') {
  const errorInfo = {
    context,
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    timestamp: new Date().toISOString(),
  };

  // Log para desarrollo
  if (import.meta.env.DEV) {
    console.error(`[${context}] API Error:`, errorInfo);
  }

  // Determinar mensaje de usuario
  let userMessage = 'Ocurrió un error inesperado';

  if (error.response?.status === 400) {
    userMessage = 'Datos inválidos. Por favor verifica la información ingresada.';
  } else if (error.response?.status === 404) {
    userMessage = 'Servicio no encontrado. Intenta nuevamente más tarde.';
  } else if (error.response?.status === 500) {
    userMessage = 'Error del servidor. Intenta nuevamente más tarde.';
  } else if (error.code === 'NETWORK_ERROR') {
    userMessage = 'Error de conexión. Verifica tu conexión a internet.';
  }

  return {
    ...errorInfo,
    userMessage,
  };
}

/**
 * Wrapper para llamadas de API con manejo de errores
 */
export async function safeApiCall(apiCall, context = '') {
  try {
    return await apiCall();
  } catch (error) {
    const errorInfo = handleApiError(error, context);
    throw new Error(errorInfo.userMessage);
  }
}
