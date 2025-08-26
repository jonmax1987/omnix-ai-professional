/**
 * Mobile-First Viewport Detection Utility
 * Follows OMNIX AI Mobile First principle from CLAUDE.md
 */

// Mobile-first breakpoint (matches theme breakpoints)
// Mobile = <= 1024px, Desktop = > 1024px  
const MOBILE_BREAKPOINT = 1024;

/**
 * Detects if current viewport is mobile (SSR-safe)
 * Handles both real mobile devices and browser DevTools mobile simulation
 * @returns {boolean} true if mobile, false if desktop
 */
export const getInitialIsMobile = () => {
  // SSR-safe: assume mobile first
  if (typeof window === 'undefined') {
    return true;
  }
  
  // Method 1: Check actual viewport width
  const viewportWidth = window.innerWidth;
  
  // Method 2: Check if browser is simulating mobile (DevTools)
  const isSimulatingMobile = window.navigator.userAgentData?.mobile || 
                           /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);
  
  // Method 3: Check visual viewport (better for DevTools simulation)
  const visualViewport = window.visualViewport?.width || window.innerWidth;
  
  // Method 4: Check device pixel ratio and screen size
  const isLikelyMobile = window.devicePixelRatio > 1 && window.screen.width < MOBILE_BREAKPOINT;
  
  // Priority-based mobile detection:
  // 1. If simulating mobile, prioritize visual viewport and simulation flags  
  // 2. Otherwise use standard viewport width check
  // Note: Use <= 1024 so that 1024px exactly is mobile, 1025+ is desktop
  const isMobile = isSimulatingMobile ? 
                   (visualViewport <= MOBILE_BREAKPOINT || isSimulatingMobile) :
                   (viewportWidth <= MOBILE_BREAKPOINT || isLikelyMobile);
  
  
  return isMobile;
};

/**
 * Creates a resize listener for mobile state changes
 * @param {Function} callback - Called when mobile state changes
 * @returns {Function} cleanup function
 */
export const createMobileListener = (callback) => {
  if (typeof window === 'undefined') {
    return () => {}; // No-op for SSR
  }

  let currentIsMobile = getInitialIsMobile();
  
  const handleResize = () => {
    // Use the same comprehensive detection as getInitialIsMobile
    const viewportWidth = window.innerWidth;
    const isSimulatingMobile = window.navigator.userAgentData?.mobile || 
                             /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);
    const visualViewport = window.visualViewport?.width || window.innerWidth;
    const isLikelyMobile = window.devicePixelRatio > 1 && window.screen.width < MOBILE_BREAKPOINT;
    
    // Use same priority logic as getInitialIsMobile  
    const newIsMobile = isSimulatingMobile ? 
                       (visualViewport <= MOBILE_BREAKPOINT || isSimulatingMobile) :
                       (viewportWidth <= MOBILE_BREAKPOINT || isLikelyMobile);
    
    // Only call callback if state actually changed
    if (newIsMobile !== currentIsMobile) {
      currentIsMobile = newIsMobile;
      callback(newIsMobile);
    }
  };

  window.addEventListener('resize', handleResize, { passive: true });
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
};

/**
 * Hook-like utility for getting current mobile state
 * Used for initial store setup
 */
export const getMobileState = () => {
  return {
    isMobile: getInitialIsMobile(),
    createListener: createMobileListener
  };
};