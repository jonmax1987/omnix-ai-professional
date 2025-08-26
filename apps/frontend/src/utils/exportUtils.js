import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column definitions with key and header properties
 * @param {string} filename - Name of the file to download
 */
export const exportToCSV = (data, columns, filename = 'export.csv') => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Generate CSV content
  const headers = columns.map(col => col.header || col.label || col.key);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      columns.map(col => {
        const value = col.accessor ? row[col.accessor] : row[col.key];
        // Escape quotes and wrap in quotes if contains comma or quote
        const stringValue = String(value || '');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

/**
 * Export data to PDF format
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column definitions
 * @param {string} filename - Name of the file to download
 * @param {Object} options - PDF generation options
 */
export const exportToPDF = (data, columns, filename = 'export.pdf', options = {}) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const {
    title = 'Data Export',
    subtitle,
    orientation = 'portrait',
    pageSize = 'a4',
    showTimestamp = true,
    tableStyles = {},
    headerStyles = {},
    bodyStyles = {}
  } = options;

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // Add title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, margin, yPosition);
  yPosition += 10;

  // Add subtitle if provided
  if (subtitle) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(subtitle, margin, yPosition);
    yPosition += 8;
  }

  // Add timestamp if enabled
  if (showTimestamp) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100);
    const timestamp = new Date().toLocaleString();
    pdf.text(`Generated: ${timestamp}`, margin, yPosition);
    yPosition += 10;
  }

  // Prepare table data
  const headers = columns.map(col => col.header || col.label || col.key);
  const tableData = data.map(row => 
    columns.map(col => {
      const value = col.accessor ? row[col.accessor] : row[col.key];
      return formatCellValue(value, col);
    })
  );

  // Generate table
  pdf.autoTable({
    head: [headers],
    body: tableData,
    startY: yPosition,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      ...tableStyles
    },
    headStyles: {
      fillColor: [64, 130, 199],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      ...headerStyles
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      ...bodyStyles
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: generateColumnStyles(columns),
    didDrawPage: (data) => {
      // Add page numbers
      const pageNumber = pdf.internal.getNumberOfPages();
      pdf.setFontSize(8);
      pdf.setTextColor(100);
      pdf.text(
        `Page ${data.pageNumber} of ${pageNumber}`,
        pageWidth - margin - 20,
        pdf.internal.pageSize.getHeight() - 10
      );
    }
  });

  // Save the PDF
  pdf.save(filename);
};

/**
 * Export chart as image
 * @param {HTMLElement} chartElement - Chart DOM element
 * @param {string} filename - Name of the file to download
 * @param {string} format - Image format (png, jpeg, svg)
 * @param {Object} options - Export options
 */
export const exportChartAsImage = (chartElement, filename = 'chart.png', format = 'png', options = {}) => {
  if (!chartElement) {
    console.warn('Chart element not found');
    return;
  }

  const {
    width = 800,
    height = 600,
    backgroundColor = '#ffffff',
    quality = 0.9
  } = options;

  // Check if element is SVG
  const svgElement = chartElement.querySelector('svg');
  if (svgElement) {
    exportSVGAsImage(svgElement, filename, format, { width, height, backgroundColor, quality });
    return;
  }

  // Check if element is Canvas
  const canvasElement = chartElement.querySelector('canvas');
  if (canvasElement) {
    exportCanvasAsImage(canvasElement, filename, format, { quality });
    return;
  }

  // Fallback: use html2canvas for other elements
  import('html2canvas').then(html2canvas => {
    html2canvas(chartElement, {
      width,
      height,
      backgroundColor,
      scale: 2 // Higher resolution
    }).then(canvas => {
      exportCanvasAsImage(canvas, filename, format, { quality });
    });
  }).catch(error => {
    console.error('Failed to export chart:', error);
  });
};

/**
 * Export dashboard as PDF report
 * @param {Object} dashboardData - Dashboard data including metrics, charts, alerts
 * @param {string} filename - Name of the file to download
 * @param {Object} options - PDF generation options
 */
export const exportDashboardReport = (dashboardData, filename = 'dashboard-report.pdf', options = {}) => {
  const {
    title = 'OMNIX AI Dashboard Report',
    includeMetrics = true,
    includeCharts = true,
    includeAlerts = true,
    includeTimestamp = true
  } = options;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // Add header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, margin, yPosition);
  yPosition += 15;

  if (includeTimestamp) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100);
    const timestamp = new Date().toLocaleString();
    pdf.text(`Generated: ${timestamp}`, margin, yPosition);
    yPosition += 15;
  }

  // Add metrics section
  if (includeMetrics && dashboardData.metrics) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0);
    pdf.text('Key Metrics', margin, yPosition);
    yPosition += 8;

    dashboardData.metrics.forEach(metric => {
      if (yPosition > pdf.internal.pageSize.getHeight() - 30) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${metric.title}:`, margin, yPosition);
      
      pdf.setFont('helvetica', 'normal');
      const value = formatMetricValue(metric.value, metric.valueFormat);
      pdf.text(value, margin + 50, yPosition);
      
      if (metric.change) {
        const changeText = `${metric.change > 0 ? '+' : ''}${metric.change}%`;
        pdf.setTextColor(metric.change > 0 ? [0, 128, 0] : [255, 0, 0]);
        pdf.text(changeText, margin + 100, yPosition);
        pdf.setTextColor(0);
      }
      
      yPosition += 6;
    });
    yPosition += 10;
  }

  // Add alerts section
  if (includeAlerts && dashboardData.alerts) {
    if (yPosition > pdf.internal.pageSize.getHeight() - 50) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recent Alerts', margin, yPosition);
    yPosition += 8;

    dashboardData.alerts.forEach(alert => {
      if (yPosition > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        yPosition = margin;
      }

      // Set color based on severity
      const severityColor = getSeverityColor(alert.severity);
      pdf.setTextColor(severityColor);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`[${alert.severity.toUpperCase()}]`, margin, yPosition);
      
      pdf.setTextColor(0);
      pdf.setFont('helvetica', 'normal');
      pdf.text(alert.title, margin + 25, yPosition);
      yPosition += 5;
      
      if (alert.message) {
        pdf.setFontSize(9);
        pdf.text(alert.message, margin + 5, yPosition);
        yPosition += 5;
      }
      
      yPosition += 3;
    });
  }

  pdf.save(filename);
};

// Helper functions
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const formatCellValue = (value, column) => {
  if (value === null || value === undefined) return '';
  
  if (column.format) {
    switch (column.format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      case 'percentage':
        return `${value}%`;
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'datetime':
        return new Date(value).toLocaleString();
      default:
        return String(value);
    }
  }
  
  return String(value);
};

const formatMetricValue = (value, format) => {
  if (!format || format === 'number') {
    return new Intl.NumberFormat().format(value);
  }
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    case 'percentage':
      return `${value}%`;
    case 'compact':
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toString();
    default:
      return String(value);
  }
};

const generateColumnStyles = (columns) => {
  const styles = {};
  columns.forEach((col, index) => {
    if (col.align) {
      styles[index] = { halign: col.align };
    }
    if (col.width) {
      styles[index] = { ...styles[index], cellWidth: col.width };
    }
  });
  return styles;
};

const exportSVGAsImage = (svgElement, filename, format, options) => {
  const { width, height, backgroundColor, quality } = options;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  
  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  const img = new Image();
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);
  
  img.onload = () => {
    ctx.drawImage(img, 0, 0, width, height);
    exportCanvasAsImage(canvas, filename, format, { quality });
    URL.revokeObjectURL(url);
  };
  
  img.src = url;
};

const exportCanvasAsImage = (canvas, filename, format, options) => {
  const { quality = 0.9 } = options;
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, mimeType, quality);
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'error':
      return [220, 38, 38];
    case 'warning':
      return [217, 119, 6];
    case 'success':
      return [34, 197, 94];
    case 'info':
    default:
      return [59, 130, 246];
  }
};