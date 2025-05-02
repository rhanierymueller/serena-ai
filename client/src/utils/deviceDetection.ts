/**
 * Utilitário para detectar se o dispositivo atual é um dispositivo móvel
 */

/**
 * Verifica se o dispositivo atual é um dispositivo móvel
 * @returns {boolean} true se for um dispositivo móvel, false caso contrário
 */
export function isMobileDevice(): boolean {
  // Verifica se o objeto window existe (para evitar erros durante SSR)
  if (typeof window === 'undefined') {
    return false;
  }

  // Verifica se o userAgent contém strings comuns de dispositivos móveis
  const userAgent = window.navigator.userAgent || window.navigator.vendor || (window as any).opera;

  // Regex para detectar dispositivos móveis comuns
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

  // Verifica se a largura da tela é típica de um dispositivo móvel (menos de 768px)
  const isMobileWidth = window.innerWidth < 768;

  return mobileRegex.test(userAgent) || isMobileWidth;
}

/**
 * Verifica se o dispositivo atual é um tablet
 * @returns {boolean} true se for um tablet, false caso contrário
 */
export function isTabletDevice(): boolean {
  // Verifica se o objeto window existe (para evitar erros durante SSR)
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent || window.navigator.vendor || (window as any).opera;

  // Regex para detectar tablets comuns
  const tabletRegex = /iPad|Android(?!.*Mobile)/i;

  // Verifica se a largura da tela é típica de um tablet (entre 768px e 1024px)
  const isTabletWidth = window.innerWidth >= 768 && window.innerWidth <= 1024;

  return tabletRegex.test(userAgent) || isTabletWidth;
}

/**
 * Verifica se o dispositivo atual é um dispositivo móvel ou tablet
 * @returns {boolean} true se for um dispositivo móvel ou tablet, false caso contrário
 */
export function isMobileOrTablet(): boolean {
  return isMobileDevice() || isTabletDevice();
}
