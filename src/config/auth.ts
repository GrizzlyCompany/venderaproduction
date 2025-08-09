// Configuración de autenticación y seguridad

export const AUTH_CONFIG = {
  // Tiempo de inactividad antes del auto-logout (en milisegundos)
  IDLE_TIME: 15 * 60 * 1000, // 15 minutos
  
  // Tiempo de advertencia antes del logout (en segundos)
  WARNING_TIME: 60, // 60 segundos
  
  // Eventos que se consideran como actividad del usuario
  ACTIVITY_EVENTS: [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
    'keydown',
    'focus',
    'blur'
  ],
  
  // Páginas donde el auto-logout está deshabilitado
  EXCLUDED_PATHS: [
    '/login',
    '/signup',
    '/landing',
    '/about',
    '/contact',
    '/terms'
  ],
  
  // Configuración de sesión
  SESSION: {
    // Tiempo máximo de sesión (en milisegundos) - 8 horas
    MAX_DURATION: 8 * 60 * 60 * 1000,
    
    // Renovar token automáticamente
    AUTO_REFRESH: true,
    
    // Persistir sesión en localStorage
    PERSIST_SESSION: true
  }
} as const;

// Función para verificar si una ruta está excluida del auto-logout
export function isPathExcluded(pathname: string): boolean {
  return AUTH_CONFIG.EXCLUDED_PATHS.some(path => 
    pathname.startsWith(path)
  );
}

// Función para obtener la configuración de idle time basada en el entorno
export function getIdleTimeConfig() {
  // En desarrollo, usar un tiempo más corto para testing
  if (process.env.NODE_ENV === 'development') {
    return {
      idleTime: 2 * 60 * 1000, // 2 minutos en desarrollo
      warningTime: 30 // 30 segundos de advertencia
    };
  }
  
  return {
    idleTime: AUTH_CONFIG.IDLE_TIME,
    warningTime: AUTH_CONFIG.WARNING_TIME
  };
}