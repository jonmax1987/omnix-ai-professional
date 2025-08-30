import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html {
    height: 100%;
    font-size: 16px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  body {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: ${props => props.theme?.typography?.fontFamily?.sans?.join(', ') || 'Inter, system-ui, sans-serif'};
    font-size: ${props => props.theme?.typography?.fontSize?.base || props.theme?.typography?.sizes?.base || '16px'};
    font-weight: ${props => props.theme?.typography?.fontWeight?.normal || props.theme?.typography?.weights?.normal || '400'};
    line-height: ${props => props.theme?.typography?.lineHeight?.relaxed || '1.6'};
    color: ${props => props.theme?.colors?.text?.primary || '#0f172a'};
    background-color: ${props => props.theme?.colors?.background?.primary || '#ffffff'};
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme?.colors?.background?.secondary || '#f1f5f9'};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme?.colors?.border?.default || '#e2e8f0'};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme?.colors?.border?.strong || '#cbd5e1'};
  }

  /* Firefox scrollbar styling */
  * {
    scrollbar-width: thin;
    scrollbar-color: ${props => props.theme?.colors?.border?.default || '#e2e8f0'} ${props => props.theme?.colors?.background?.secondary || '#f1f5f9'};
  }

  /* Focus styles */
  button:focus,
  input:focus,
  textarea:focus,
  select:focus {
    outline: 2px solid ${props => props.theme?.colors?.primary?.[500] || '#3b82f6'};
    outline-offset: 2px;
  }

  /* Selection styles */
  ::selection {
    background-color: ${props => props.theme?.colors?.primary?.[100] || 'rgba(59, 130, 246, 0.1)'};
    color: ${props => props.theme?.colors?.primary?.[800] || '#1e40af'};
  }

  ::-moz-selection {
    background-color: ${props => props.theme?.colors?.primary?.[100] || 'rgba(59, 130, 246, 0.1)'};
    color: ${props => props.theme?.colors?.primary?.[800] || '#1e40af'};
  }

  /* Print styles */
  @media print {
    * {
      background: transparent !important;
      color: black !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }

    body {
      font-size: 12pt;
      line-height: 1.4;
      color: black !important;
    }

    /* Typography */
    h1, h2, h3, h4, h5, h6 {
      color: black !important;
      break-after: avoid;
      break-inside: avoid;
      margin-top: 24pt;
      margin-bottom: 12pt;
    }

    h1 { font-size: 20pt; }
    h2 { font-size: 18pt; }
    h3 { font-size: 16pt; }
    h4 { font-size: 14pt; }
    h5 { font-size: 12pt; }
    h6 { font-size: 11pt; }

    p, blockquote {
      break-inside: avoid;
      margin-bottom: 12pt;
    }

    /* Tables */
    table {
      border-collapse: collapse !important;
      width: 100% !important;
      margin-bottom: 20pt;
      font-size: 10pt;
    }

    thead {
      display: table-header-group;
    }

    th {
      background: #f5f5f5 !important;
      color: black !important;
      border: 1px solid #999 !important;
      padding: 8pt !important;
      font-weight: bold;
      text-align: left;
    }

    td {
      border: 1px solid #ccc !important;
      padding: 6pt !important;
      color: black !important;
    }

    tr {
      break-inside: avoid;
    }

    tbody tr:nth-child(even) {
      background: #f9f9f9 !important;
    }

    /* Images and Charts */
    img, canvas, svg {
      max-width: 100% !important;
      height: auto !important;
      break-inside: avoid;
      margin: 12pt 0;
    }

    /* Hide non-essential elements for printing */
    .no-print,
    .print-hide,
    button:not(.print-show),
    .sidebar,
    .navigation,
    nav,
    [role="navigation"],
    .search-bar,
    .filters,
    .bulk-actions,
    .pagination-controls,
    .floating-action,
    .modal-overlay,
    .tooltip {
      display: none !important;
    }

    /* Dashboard specific */
    .dashboard-grid {
      display: block !important;
    }

    .metric-card {
      display: inline-block !important;
      width: 48% !important;
      margin: 0 1% 16pt 1% !important;
      padding: 12pt !important;
      border: 1px solid #ccc !important;
      page-break-inside: avoid;
    }

    .chart-container {
      page-break-inside: avoid;
      margin-bottom: 20pt;
      border: 1px solid #ccc !important;
      padding: 12pt !important;
    }

    .alert-card {
      margin-bottom: 8pt !important;
      padding: 8pt !important;
      border: 1px solid #ccc !important;
      page-break-inside: avoid;
    }

    /* Data tables - specific handling */
    .data-table .table-header {
      border-bottom: 2px solid #333 !important;
      margin-bottom: 12pt;
    }

    .data-table .table-footer {
      display: none !important;
    }

    /* Forms for printing */
    input, textarea, select {
      border: 1px solid #999 !important;
      background: white !important;
      color: black !important;
      -webkit-appearance: none;
    }

    input[type="checkbox"]:checked:after {
      content: '✓';
      display: block;
      text-align: center;
      font-size: 10pt;
      line-height: 1;
    }

    /* Links */
    a {
      color: black !important;
      text-decoration: underline !important;
    }

    a[href]:after {
      content: " (" attr(href) ")";
      font-size: 9pt;
      color: #666;
    }

    a[href^="#"]:after,
    a[href^="javascript:"]:after {
      content: "";
    }

    /* Badges and status indicators */
    .badge {
      border: 1px solid #333 !important;
      padding: 2pt 4pt !important;
      font-size: 9pt !important;
      color: black !important;
    }

    /* Page layout */
    @page {
      margin: 0.5in;
      size: A4;
    }

    @page :first {
      margin-top: 1in;
    }

    /* Force page breaks */
    .page-break-before {
      page-break-before: always;
    }

    .page-break-after {
      page-break-after: always;
    }

    .page-break-inside-avoid {
      page-break-inside: avoid;
    }

    /* RTL (Right-to-Left) Support for Hebrew */
    [dir="rtl"] {
      text-align: right;
    }

    [dir="rtl"] h1, [dir="rtl"] h2, [dir="rtl"] h3, [dir="rtl"] h4, [dir="rtl"] h5, [dir="rtl"] h6 {
      text-align: right;
    }

    [dir="rtl"] p, [dir="rtl"] div, [dir="rtl"] span {
      text-align: right;
    }

    [dir="rtl"] .icon-chevron {
      transform: scaleX(-1);
    }

    /* Flex and grid adjustments for RTL */
    [dir="rtl"] .flex-row {
      flex-direction: row-reverse;
    }

    [dir="rtl"] .justify-start {
      justify-content: flex-end;
    }

    [dir="rtl"] .justify-end {
      justify-content: flex-start;
    }

    [dir="rtl"] .badge {
      margin-left: 0;
      margin-right: 8px;
    }

    [dir="rtl"] .flex-gap {
      flex-direction: row-reverse;
    }

    [dir="rtl"] .text-left {
      text-align: right;
    }

    [dir="rtl"] .text-right {
      text-align: left;
    }

    [dir="rtl"] .ml-auto {
      margin-left: 0;
      margin-right: auto;
    }

    [dir="rtl"] .mr-auto {
      margin-right: 0;
      margin-left: auto;
    }

  /* Print-specific utility classes */
    .print-only {
      display: block !important;
    }

    .print-flex {
      display: flex !important;
    }

    .print-inline {
      display: inline !important;
    }

    .print-inline-block {
      display: inline-block !important;
    }

    /* Header for printed pages */
    .print-header {
      position: fixed;
      top: -0.5in;
      left: 0;
      right: 0;
      height: 0.5in;
      text-align: center;
      font-size: 10pt;
      color: #666;
    }

    /* Footer for printed pages */
    .print-footer {
      position: fixed;
      bottom: -0.5in;
      left: 0;
      right: 0;
      height: 0.5in;
      text-align: center;
      font-size: 9pt;
      color: #666;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    * {
      border-color: currentColor !important;
    }
  }

  /* Dark mode system preference support */
  @media (prefers-color-scheme: dark) {
    /* This will be handled by the theme provider */
  }

  /* PWA specific styles */
  @media all and (display-mode: standalone) {
    body {
      -webkit-user-select: none;
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }
  }

  /* Loading skeleton animation */
  @keyframes skeleton-loading {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }

  .skeleton {
    background: linear-gradient(90deg, 
      ${props => props.theme?.colors?.background?.secondary || '#f1f5f9'} 0px, 
      ${props => props.theme?.colors?.border?.subtle || '#f8fafc'} 50px, 
      ${props => props.theme?.colors?.background?.secondary || '#f1f5f9'} 100px
    );
    background-size: 200px 100%;
    animation: skeleton-loading 1.5s infinite linear;
  }

  /* Utility classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

export default GlobalStyles;