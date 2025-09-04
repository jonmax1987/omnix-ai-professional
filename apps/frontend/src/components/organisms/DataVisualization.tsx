import React, { useRef, useEffect, useState, useMemo, useCallback, CSSProperties } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line, Bar, Doughnut, Radar, Scatter, Bubble } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler
);

// Types
export interface DataPoint {
  x: number | string;
  y: number;
  r?: number; // For bubble charts
  label?: string;
  color?: string;
  metadata?: any;
}

export interface Dataset {
  label: string;
  data: DataPoint[] | number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'doughnut' | 'radar' | 'scatter' | 'bubble' | 'area' | 'mixed';
  data: {
    labels?: string[];
    datasets: Dataset[];
  };
  options?: ChartOptions;
  height?: number;
  responsive?: boolean;
  animate?: boolean;
  interactive?: boolean;
}

export interface VisualizationProps {
  config: ChartConfig;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  error?: Error | null;
  onDataPointClick?: (point: DataPoint, datasetIndex: number) => void;
  onChartReady?: (chart: ChartJS) => void;
  className?: string;
  style?: CSSProperties;
  showLegend?: boolean;
  showGrid?: boolean;
  darkMode?: boolean;
  exportable?: boolean;
  realtime?: boolean;
  updateInterval?: number;
}

// Styled Components
const VisualizationContainer = styled(motion.div)<{ darkMode?: boolean }>`
  background: ${props => props.darkMode ? '#1f2937' : '#ffffff'};
  border-radius: 16px;
  padding: 24px;
  box-shadow: ${props => props.darkMode 
    ? '0 10px 40px rgba(0, 0, 0, 0.3)' 
    : '0 10px 40px rgba(0, 0, 0, 0.1)'};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
    opacity: 0.8;
  }
`;

const Header = styled.div`
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h3<{ darkMode?: boolean }>`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.darkMode ? '#f3f4f6' : '#1f2937'};
  margin: 0 0 4px 0;
`;

const Subtitle = styled.p<{ darkMode?: boolean }>`
  font-size: 14px;
  color: ${props => props.darkMode ? '#9ca3af' : '#6b7280'};
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: 8px;
`;

const ControlButton = styled(motion.button)<{ darkMode?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid ${props => props.darkMode ? '#374151' : '#e5e7eb'};
  background: ${props => props.darkMode ? '#374151' : '#ffffff'};
  color: ${props => props.darkMode ? '#f3f4f6' : '#6b7280'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.darkMode ? '#4b5563' : '#f3f4f6'};
    color: ${props => props.darkMode ? '#ffffff' : '#1f2937'};
  }
`;

const ChartWrapper = styled.div<{ height?: number }>`
  position: relative;
  height: ${props => props.height ? `${props.height}px` : 'auto'};
  min-height: 300px;
`;

const LoadingOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const LoadingSpinner = styled(motion.div)`
  width: 48px;
  height: 48px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
`;

const ErrorContainer = styled.div`
  padding: 32px;
  text-align: center;
  color: #ef4444;
`;

const NoDataContainer = styled.div<{ darkMode?: boolean }>`
  padding: 48px;
  text-align: center;
  color: ${props => props.darkMode ? '#9ca3af' : '#6b7280'};
`;

const RealtimeIndicator = styled(motion.div)`
  position: absolute;
  top: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid #22c55e;
  border-radius: 20px;
  font-size: 12px;
  color: #22c55e;
  z-index: 5;
`;

const PulseDot = styled(motion.div)`
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
`;

// Utility functions
const generateGradient = (ctx: CanvasRenderingContext2D, color1: string, color2: string) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
};

const getDefaultOptions = (darkMode: boolean, showGrid: boolean): ChartOptions => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: {
        color: darkMode ? '#f3f4f6' : '#1f2937',
        padding: 16,
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        }
      }
    },
    tooltip: {
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      titleColor: darkMode ? '#f3f4f6' : '#1f2937',
      bodyColor: darkMode ? '#d1d5db' : '#4b5563',
      borderColor: darkMode ? '#374151' : '#e5e7eb',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('en-US').format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    x: {
      display: showGrid,
      grid: {
        display: showGrid,
        color: darkMode ? '#374151' : '#e5e7eb',
        drawBorder: false
      },
      ticks: {
        color: darkMode ? '#9ca3af' : '#6b7280',
        font: {
          size: 11,
          family: "'Inter', sans-serif"
        }
      }
    },
    y: {
      display: showGrid,
      grid: {
        display: showGrid,
        color: darkMode ? '#374151' : '#e5e7eb',
        drawBorder: false
      },
      ticks: {
        color: darkMode ? '#9ca3af' : '#6b7280',
        font: {
          size: 11,
          family: "'Inter', sans-serif"
        },
        callback: function(value: any) {
          return new Intl.NumberFormat('en-US', {
            notation: 'compact',
            maximumFractionDigits: 1
          }).format(value);
        }
      }
    }
  },
  interaction: {
    mode: 'index' as const,
    intersect: false
  },
  animation: {
    duration: 750,
    easing: 'easeInOutQuart' as const
  }
});

// Modern Data Visualization Component
export const DataVisualization: React.FC<VisualizationProps> = ({
  config,
  title,
  subtitle,
  loading = false,
  error = null,
  onDataPointClick,
  onChartReady,
  className,
  style,
  showLegend = true,
  showGrid = true,
  darkMode = false,
  exportable = true,
  realtime = false,
  updateInterval = 5000
}) => {
  const chartRef = useRef<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [chartData, setChartData] = useState(config.data);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Process chart data with gradients and styles
  const processedData = useMemo(() => {
    if (!chartRef.current) return config.data;

    const canvas = chartRef.current.canvas;
    if (!canvas) return config.data;

    const ctx = canvas.getContext('2d');
    if (!ctx) return config.data;

    return {
      ...config.data,
      datasets: config.data.datasets.map((dataset, index) => {
        const colors = [
          { main: '#3b82f6', light: 'rgba(59, 130, 246, 0.1)' },
          { main: '#8b5cf6', light: 'rgba(139, 92, 246, 0.1)' },
          { main: '#ec4899', light: 'rgba(236, 72, 153, 0.1)' },
          { main: '#10b981', light: 'rgba(16, 185, 129, 0.1)' },
          { main: '#f59e0b', light: 'rgba(245, 158, 11, 0.1)' }
        ];

        const color = colors[index % colors.length];

        if (config.type === 'line' || config.type === 'area') {
          return {
            ...dataset,
            borderColor: color.main,
            backgroundColor: config.type === 'area' 
              ? generateGradient(ctx, color.light, 'rgba(255, 255, 255, 0)')
              : 'transparent',
            borderWidth: 2,
            pointBackgroundColor: color.main,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: config.type === 'area'
          };
        }

        if (config.type === 'bar') {
          return {
            ...dataset,
            backgroundColor: color.main,
            borderColor: color.main,
            borderWidth: 0,
            borderRadius: 8,
            borderSkipped: false
          };
        }

        if (config.type === 'doughnut') {
          return {
            ...dataset,
            backgroundColor: colors.map(c => c.main),
            borderColor: darkMode ? '#1f2937' : '#ffffff',
            borderWidth: 2,
            hoverOffset: 8
          };
        }

        return dataset;
      })
    };
  }, [config, darkMode]);

  // Chart options
  const chartOptions = useMemo(() => {
    const defaultOpts = getDefaultOptions(darkMode, showGrid);
    return {
      ...defaultOpts,
      ...config.options,
      plugins: {
        ...defaultOpts.plugins,
        ...config.options?.plugins,
        legend: {
          ...defaultOpts.plugins?.legend,
          display: showLegend
        }
      },
      onClick: (event: any, elements: any[]) => {
        if (elements.length > 0 && onDataPointClick) {
          const element = elements[0];
          const datasetIndex = element.datasetIndex;
          const index = element.index;
          const dataset = chartData.datasets[datasetIndex];
          const point = {
            x: chartData.labels ? chartData.labels[index] : index,
            y: Array.isArray(dataset.data[index]) 
              ? dataset.data[index][1] 
              : dataset.data[index],
            label: dataset.label
          } as DataPoint;
          onDataPointClick(point, datasetIndex);
        }
      }
    };
  }, [config.options, darkMode, showGrid, showLegend, onDataPointClick, chartData]);

  // Handle real-time updates
  useEffect(() => {
    if (!realtime) return;

    const interval = setInterval(() => {
      // Simulate real-time data update
      setChartData(prevData => ({
        ...prevData,
        datasets: prevData.datasets.map(dataset => ({
          ...dataset,
          data: dataset.data.map((value: any) => {
            if (typeof value === 'number') {
              return value + (Math.random() - 0.5) * 10;
            }
            return value;
          })
        }))
      }));
    }, updateInterval);

    return () => clearInterval(interval);
  }, [realtime, updateInterval]);

  // Handle chart ready
  useEffect(() => {
    if (chartRef.current && onChartReady) {
      onChartReady(chartRef.current);
    }
  }, [onChartReady]);

  // Export chart as image
  const exportChart = useCallback(() => {
    if (!chartRef.current) return;

    setIsExporting(true);
    const canvas = chartRef.current.canvas;
    const url = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = `chart_${Date.now()}.png`;
    link.href = url;
    link.click();

    setTimeout(() => setIsExporting(false), 1000);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Render chart based on type
  const renderChart = () => {
    const chartProps = {
      ref: chartRef,
      data: processedData,
      options: chartOptions
    };

    switch (config.type) {
      case 'line':
      case 'area':
        return <Line {...chartProps} />;
      case 'bar':
        return <Bar {...chartProps} />;
      case 'doughnut':
        return <Doughnut {...chartProps} />;
      case 'radar':
        return <Radar {...chartProps} />;
      case 'scatter':
        return <Scatter {...chartProps} />;
      case 'bubble':
        return <Bubble {...chartProps} />;
      default:
        return <Line {...chartProps} />;
    }
  };

  // Handle empty data
  if (!config.data.datasets || config.data.datasets.length === 0) {
    return (
      <VisualizationContainer darkMode={darkMode} className={className} style={style}>
        <NoDataContainer darkMode={darkMode}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ margin: '0 auto 16px' }}
          >
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
          <p>No data available</p>
        </NoDataContainer>
      </VisualizationContainer>
    );
  }

  // Handle error state
  if (error) {
    return (
      <VisualizationContainer darkMode={darkMode} className={className} style={style}>
        <ErrorContainer>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ margin: '0 auto 16px' }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>Error loading chart</p>
          <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>
            {error.message}
          </p>
        </ErrorContainer>
      </VisualizationContainer>
    );
  }

  return (
    <VisualizationContainer
      ref={containerRef}
      darkMode={darkMode}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {(title || subtitle) && (
        <Header>
          <TitleSection>
            {title && <Title darkMode={darkMode}>{title}</Title>}
            {subtitle && <Subtitle darkMode={darkMode}>{subtitle}</Subtitle>}
          </TitleSection>
          
          <Controls>
            {exportable && (
              <ControlButton
                darkMode={darkMode}
                onClick={exportChart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isExporting}
                title="Export as PNG"
              >
                {isExporting ? '⏳' : '📷'}
              </ControlButton>
            )}
            
            <ControlButton
              darkMode={darkMode}
              onClick={toggleFullscreen}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Toggle fullscreen"
            >
              {isFullscreen ? '🗗' : '🗖'}
            </ControlButton>
          </Controls>
        </Header>
      )}

      {realtime && (
        <RealtimeIndicator
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PulseDot
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <span>Live</span>
        </RealtimeIndicator>
      )}

      <ChartWrapper height={config.height}>
        <AnimatePresence>
          {loading && (
            <LoadingOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSpinner
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              />
            </LoadingOverlay>
          )}
        </AnimatePresence>

        {renderChart()}
      </ChartWrapper>
    </VisualizationContainer>
  );
};

// Export additional chart components for specific use cases
export { SparklineChart } from './SparklineChart';
export { MetricCard } from './MetricCard';
export { HeatmapChart } from './HeatmapChart';
export { GaugeChart } from './GaugeChart';
export { TreemapChart } from './TreemapChart';