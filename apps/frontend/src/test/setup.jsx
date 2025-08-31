import '@testing-library/jest-dom'
import 'jest-axe/extend-expect'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  callback
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock canvas context for chart testing
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn().mockReturnValue({
    data: new Array(4 * 1 * 1)
  }),
  putImageData: vi.fn(),
  createImageData: vi.fn().mockReturnValue([]),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn().mockReturnValue({ width: 0 }),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
}));

// Mock performance observer
global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  callback
}));

// Mock navigator connection API
Object.defineProperty(window.navigator, 'connection', {
  writable: true,
  value: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false
  }
});

// Mock Performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    ...window.performance,
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
    mark: vi.fn(),
    measure: vi.fn(),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
    now: vi.fn(() => Date.now())
  }
});

// Mock HTML2Canvas for export functionality
vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toBlob: vi.fn().mockImplementation((callback) => {
      callback(new Blob())
    })
  })
}));

// Mock jsPDF for export functionality
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    text: vi.fn(),
    addImage: vi.fn(),
    save: vi.fn(),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    autoTable: vi.fn()
  }))
}));

// Mock framer-motion for testing
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    span: 'span',
    path: 'path',
    circle: 'circle',
    svg: 'svg',
    g: 'g',
    input: 'input',
    form: 'form',
    section: 'section',
    article: 'article',
    header: 'header',
    footer: 'footer',
    main: 'main',
    nav: 'nav',
    aside: 'aside'
  },
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn()
  })
}));

// Mock styled-components theme
const mockTheme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8'
    },
    success: {
      500: '#10b981',
      600: '#059669'
    },
    warning: {
      500: '#f59e0b',
      600: '#d97706'
    },
    error: {
      500: '#ef4444',
      600: '#dc2626'
    },
    info: {
      500: '#3b82f6',
      600: '#2563eb'
    },
    gray: {
      100: '#f3f4f6',
      200: '#e5e7eb',
      500: '#6b7280',
      600: '#4b5563'
    },
    red: {
      500: '#ef4444',
      600: '#dc2626'
    },
    green: {
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46'
    },
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      elevated: '#ffffff',
      hover: '#f9fafb'
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      inverse: '#ffffff'
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    border: {
      default: '#e5e7eb',
      hover: '#d1d5db',
      subtle: '#f3f4f6'
    }
  },
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    6: '24px'
  },
  typography: {
    fontSize: {
      sm: '14px',
      base: '16px',
      lg: '18px'
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    },
    // Variant-specific typography
    caption: {
      fontSize: '12px'
    },
    body2: {
      fontSize: '14px'
    }
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },
  animation: {
    duration: {
      fast: '0.15s',
      normal: '0.3s',
      slow: '0.5s'
    },
    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
};

// Mock I18n provider
const mockI18n = {
  t: (key, params = {}) => {
    let translation = key;
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{{${param}}}`, params[param]);
    });
    return translation;
  },
  language: 'en',
  changeLanguage: vi.fn()
};

export const useI18n = () => mockI18n;

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockI18n.t,
    i18n: mockI18n
  }),
  I18nextProvider: ({ children }) => children
}));

// Theme provider wrapper for tests
import React from 'react';
import { ThemeProvider } from 'styled-components';

const I18nProvider = ({ children }) => children;

export const TestWrapper = ({ children }) => (
  <I18nProvider>
    <ThemeProvider theme={mockTheme}>
      {children}
    </ThemeProvider>
  </I18nProvider>
);

// Custom render function
import { render } from '@testing-library/react';

export const renderWithTheme = (component, options = {}) => {
  return render(component, {
    wrapper: TestWrapper,
    ...options
  });
};