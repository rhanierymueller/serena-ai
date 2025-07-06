export function isTabletDevice(): boolean {

  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent || window.navigator.vendor || (window as any).opera;
  const tabletRegex = /iPad|Android(?!.*Mobile)/i;
  const isTabletWidth = window.innerWidth >= 768 && window.innerWidth <= 1024;
  return tabletRegex.test(userAgent) || isTabletWidth;
}