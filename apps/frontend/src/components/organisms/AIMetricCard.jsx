import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle, Zap } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters';

const glow = keyframes`
  0%, 100% { 
    opacity: 0.3;
    filter: blur(20px);
  }
  50% { 
    opacity: 0.6;
    filter: blur(30px);
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

const CardContainer = styled(motion.div)`
  background: ${({ theme, variant }) => 
    variant === 'ai' 
      ? `linear-gradient(135deg, 
          rgba(102, 126, 234, 0.1) 0%, 
          rgba(118, 75, 162, 0.1) 100%)`
      : theme.colors.background.secondary};
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme, hasInsight }) => 
    hasInsight 
      ? 'rgba(102, 126, 234, 0.3)' 
      : theme.colors.border.primary};
  border-radius: 16px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  ${({ hasInsight }) => hasInsight && css`
    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        45deg, 
        transparent,
        rgba(0, 217, 255, 0.1),
        rgba(121, 40, 202, 0.1),
        rgba(255, 0, 128, 0.1),
        transparent
      );
      animation: ${glow} 4s ease-in-out infinite;
      pointer-events: none;
    }
  `}

  ${({ isPriority }) => isPriority && css`
    animation: ${pulse} 2s infinite;
  `}

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 16px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const MetricInfo = styled.div`
  flex: 1;
`;

const MetricLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 8px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MetricValue = styled.div`
  font-size: ${({ theme, size }) => 
    size === 'large' ? '2.5rem' : theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.2;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.typography.sizes.xl};
  }
`;

const TrendContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 8px;
  background: ${({ trend, theme }) => 
    trend > 0 
      ? 'rgba(34, 197, 94, 0.1)' 
      : trend < 0 
        ? 'rgba(239, 68, 68, 0.1)'
        : 'rgba(156, 163, 175, 0.1)'};
`;

const TrendValue = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ trend, theme }) => 
    trend > 0 
      ? theme.colors.success 
      : trend < 0 
        ? theme.colors.danger
        : theme.colors.text.secondary};
`;

const AIBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: linear-gradient(135deg, #00D9FF 0%, #7928CA 100%);
  border-radius: 20px;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: white;
  position: absolute;
  top: 12px;
  right: 12px;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const InsightContainer = styled(motion.div)`
  margin-top: 16px;
  padding: 12px;
  background: linear-gradient(
    135deg,
    rgba(0, 217, 255, 0.05) 0%,
    rgba(121, 40, 202, 0.05) 100%
  );
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.2);
`;

const InsightText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.5;
  margin: 0;
  font-style: italic;
`;

const PredictionContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

const PredictionLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PredictionValue = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.primary};
  background: linear-gradient(90deg, #667EEA, #764BA2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.background.tertiary};
  border-radius: 2px;
  margin-top: 12px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({ progress }) => progress}%;
    background: linear-gradient(90deg, #00D9FF, #7928CA);
    border-radius: 2px;
    transition: width 0.5s ease;
    background-size: 200% 100%;
    animation: ${shimmer} 2s linear infinite;
  }
`;

const SparklineContainer = styled.div`
  margin-top: 12px;
  height: 40px;
  position: relative;
`;

const Sparkline = ({ data, color = '#667EEA' }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height="100%" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,100 ${points} 100,100`}
        fill="url(#sparklineGradient)"
      />
    </svg>
  );
};

const AIMetricCard = ({
  label,
  value,
  trend,
  trendLabel = 'vs last period',
  format = 'number',
  insight,
  prediction,
  progress,
  sparklineData,
  variant = 'default',
  size = 'medium',
  hasAI = false,
  isPriority = false,
  confidence,
  model = 'Claude 3',
  onAction,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const formatValue = (val) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percentage':
        return formatPercentage(val);
      case 'number':
      default:
        return formatNumber(val);
    }
  };

  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp size={14} />;
    if (trend < 0) return <TrendingDown size={14} />;
    return null;
  };

  return (
    <CardContainer
      className={className}
      variant={variant}
      hasInsight={!!insight}
      isPriority={isPriority}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {hasAI && (
        <AIBadge>
          <Zap />
          {model}
          {confidence && ` ${confidence}%`}
        </AIBadge>
      )}

      <CardHeader>
        <MetricInfo>
          <MetricLabel>{label}</MetricLabel>
          <MetricValue size={size}>
            {formatValue(value)}
          </MetricValue>
        </MetricInfo>

        {trend !== undefined && (
          <TrendContainer trend={trend}>
            {getTrendIcon()}
            <TrendValue trend={trend}>
              {trend > 0 ? '+' : ''}{formatPercentage(trend)}
            </TrendValue>
          </TrendContainer>
        )}
      </CardHeader>

      {sparklineData && sparklineData.length > 0 && (
        <SparklineContainer>
          <Sparkline data={sparklineData} color="#667EEA" />
        </SparklineContainer>
      )}

      {progress !== undefined && (
        <ProgressBar progress={progress} />
      )}

      <AnimatePresence>
        {insight && (
          <InsightContainer
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <InsightText>
              <AlertCircle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              {insight}
            </InsightText>
          </InsightContainer>
        )}
      </AnimatePresence>

      {prediction && (
        <PredictionContainer>
          <PredictionLabel>Predicted End of Day</PredictionLabel>
          <PredictionValue>{formatValue(prediction)}</PredictionValue>
        </PredictionContainer>
      )}
    </CardContainer>
  );
};

export default AIMetricCard;