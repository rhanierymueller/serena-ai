/**
 * Utilitário para detectar se o dispositivo atual é um dispositivo móvel
 */

/**
 * Verifica se o dispositivo atual é um tablet
 * @returns {boolean} true se for um tablet, false caso contrário
 */
export function isTabletDevice(): boolean {
  
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent || window.navigator.vendor || (window as any).opera;

  
  const tabletRegex = /iPad|Android(?!.*Mobile)/i;

  
  const isTabletWidth = window.innerWidth >= 768 && window.innerWidth <= 1024;

  return tabletRegex.test(userAgent) || isTabletWidth;
}

/**
 * Verifica se o dispositivo atual é um dispositivo móvel ou tablet
 * @returns {boolean} true se for um dispositivo móvel ou tablet, false caso contrário
 */
