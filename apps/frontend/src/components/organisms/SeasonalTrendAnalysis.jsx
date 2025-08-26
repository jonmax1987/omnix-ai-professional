import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  HeatMapGrid
} from 'recharts';
import { Calendar, TrendingUp, Sun, Cloud, Snowflake, Leaf, AlertCircle, Target } from 'lucide-react';

const AnalysisContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SeasonSelector = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SeasonButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ isActive, theme }) => 
    isActive ? theme.colors.primary.main : theme.colors.surface.secondary};
  color: ${({ isActive, theme }) => 
    isActive ? 'white' : theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ isActive, theme }) => 
      isActive ? theme.colors.primary.dark : theme.colors.neutral.hover};
    transform: translateY(-1px);
  }
`;

const SeasonalInsights = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const InsightCard = styled.div`
  background: ${({ season, theme }) => {
    const colors = {
      spring: `${theme.colors.success.light}10`,
      summer: `${theme.colors.warning.light}10`,
      fall: `${theme.colors.secondary.light}10`,
      winter: `${theme.colors.primary.light}10`,
      default: theme.colors.background.main
    };
    return colors[season] || colors.default;
  }};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const InsightTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0;
`;

const InsightValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const InsightDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0;
  line-height: 1.5;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: ${({ columns }) => `repeat(${columns}, 1fr)`};
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ChartCard = styled.div`
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  grid-column: ${({ span }) => span ? `span ${span}` : 'auto'};
`;

const ChartTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`;

const HeatmapContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const HeatmapCell = styled.div`
  aspect-ratio: 1;
  background: ${({ intensity, theme }) => {
    const opacity = intensity / 100;
    return `rgba(79, 70, 229, ${opacity})`;
  }};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ intensity }) => intensity > 50 ? 'white' : '#6B7280'};
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
    z-index: 1;
  }
`;

const PredictionCard = styled.div`
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.primary.light}10 0%, 
    ${({ theme }) => theme.colors.secondary.light}10 100%);
  border: 1px solid ${({ theme }) => theme.colors.primary.light};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const PredictionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PredictionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const PredictionItem = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const PredictionLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const PredictionValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const SeasonalTrendAnalysis = () => {
  const [selectedSeason, setSelectedSeason] = useState('all');

  const seasonalData = useMemo(() => [
    { month: 'Jan', spring: 65, summer: 45, fall: 58, winter: 92 },
    { month: 'Feb', spring: 68, summer: 48, fall: 60, winter: 88 },
    { month: 'Mar', spring: 82, summer: 52, fall: 62, winter: 75 },
    { month: 'Apr', spring: 91, summer: 58, fall: 65, winter: 62 },
    { month: 'May', spring: 88, summer: 72, fall: 68, winter: 55 },
    { month: 'Jun', spring: 76, summer: 89, fall: 70, winter: 48 },
    { month: 'Jul', spring: 62, summer: 95, fall: 72, winter: 45 },
    { month: 'Aug', spring: 58, summer: 92, fall: 78, winter: 48 },
    { month: 'Sep', spring: 65, summer: 78, fall: 85, winter: 52 },
    { month: 'Oct', spring: 68, summer: 62, fall: 91, winter: 58 },
    { month: 'Nov', spring: 70, summer: 55, fall: 88, winter: 72 },
    { month: 'Dec', spring: 72, summer: 48, fall: 82, winter: 89 }
  ], []);

  const categorySeasonality = useMemo(() => [
    { category: 'Beverages', spring: 75, summer: 95, fall: 65, winter: 55 },
    { category: 'Clothing', spring: 80, summer: 70, fall: 85, winter: 90 },
    { category: 'Electronics', spring: 70, summer: 65, fall: 75, winter: 95 },
    { category: 'Groceries', spring: 85, summer: 80, fall: 88, winter: 82 },
    { category: 'Garden', spring: 95, summer: 88, fall: 60, winter: 30 },
    { category: 'Sports', spring: 82, summer: 92, fall: 70, winter: 65 }
  ], []);

  const yearOverYear = useMemo(() => [
    { year: '2021', Q1: 245000, Q2: 278000, Q3: 295000, Q4: 342000 },
    { year: '2022', Q1: 268000, Q2: 302000, Q3: 318000, Q4: 378000 },
    { year: '2023', Q1: 295000, Q2: 335000, Q3: 352000, Q4: 415000 },
    { year: '2024', Q1: 324000, Q2: 368000, Q3: 387000, Q4: 456000 }
  ], []);

  const holidayImpact = useMemo(() => [
    { holiday: 'New Year', impact: 125, category: 'Electronics' },
    { holiday: 'Valentine', impact: 180, category: 'Gifts' },
    { holiday: 'Easter', impact: 145, category: 'Groceries' },
    { holiday: 'Summer Sale', impact: 210, category: 'Clothing' },
    { holiday: 'Back to School', impact: 195, category: 'Supplies' },
    { holiday: 'Halloween', impact: 165, category: 'Candy' },
    { holiday: 'Black Friday', impact: 285, category: 'All' },
    { holiday: 'Christmas', impact: 320, category: 'All' }
  ], []);

  const weekdayPattern = useMemo(() => [
    { day: 'Mon', sales: 72 },
    { day: 'Tue', sales: 68 },
    { day: 'Wed', sales: 75 },
    { day: 'Thu', sales: 82 },
    { day: 'Fri', sales: 95 },
    { day: 'Sat', sales: 115 },
    { day: 'Sun', sales: 108 }
  ], []);

  const heatmapData = useMemo(() => {
    const data = [];
    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 7; j++) {
        data.push({
          month: i,
          week: j,
          intensity: Math.floor(Math.random() * 100)
        });
      }
    }
    return data;
  }, []);

  const seasonIcons = {
    spring: <Leaf size={20} />,
    summer: <Sun size={20} />,
    fall: <Cloud size={20} />,
    winter: <Snowflake size={20} />
  };

  const predictions = useMemo(() => [
    { label: 'Next Month Revenue', value: '$487K', confidence: '92%' },
    { label: 'Peak Day', value: 'Dec 23', confidence: '88%' },
    { label: 'Inventory Need', value: '+35%', confidence: '85%' },
    { label: 'Staff Required', value: '+12', confidence: '90%' }
  ], []);

  return (
    <AnalysisContainer>
      <Header>
        <Title>
          <Calendar size={24} />
          Seasonal Trend Analysis
        </Title>
        <SeasonSelector>
          <SeasonButton 
            isActive={selectedSeason === 'all'} 
            onClick={() => setSelectedSeason('all')}
          >
            All Seasons
          </SeasonButton>
          <SeasonButton 
            isActive={selectedSeason === 'spring'} 
            onClick={() => setSelectedSeason('spring')}
          >
            <Leaf size={16} />
            Spring
          </SeasonButton>
          <SeasonButton 
            isActive={selectedSeason === 'summer'} 
            onClick={() => setSelectedSeason('summer')}
          >
            <Sun size={16} />
            Summer
          </SeasonButton>
          <SeasonButton 
            isActive={selectedSeason === 'fall'} 
            onClick={() => setSelectedSeason('fall')}
          >
            <Cloud size={16} />
            Fall
          </SeasonButton>
          <SeasonButton 
            isActive={selectedSeason === 'winter'} 
            onClick={() => setSelectedSeason('winter')}
          >
            <Snowflake size={16} />
            Winter
          </SeasonButton>
        </SeasonSelector>
      </Header>

      <SeasonalInsights>
        <InsightCard season="spring">
          <InsightHeader>
            <Leaf size={20} />
            <InsightTitle>Spring Peak</InsightTitle>
          </InsightHeader>
          <InsightValue>+28%</InsightValue>
          <InsightDescription>
            Garden supplies and outdoor equipment show highest demand in April-May
          </InsightDescription>
        </InsightCard>

        <InsightCard season="summer">
          <InsightHeader>
            <Sun size={20} />
            <InsightTitle>Summer Peak</InsightTitle>
          </InsightHeader>
          <InsightValue>+42%</InsightValue>
          <InsightDescription>
            Beverages and sports equipment sales increase significantly June-August
          </InsightDescription>
        </InsightCard>

        <InsightCard season="fall">
          <InsightHeader>
            <Cloud size={20} />
            <InsightTitle>Fall Peak</InsightTitle>
          </InsightHeader>
          <InsightValue>+35%</InsightValue>
          <InsightDescription>
            Back-to-school and clothing categories surge September-October
          </InsightDescription>
        </InsightCard>

        <InsightCard season="winter">
          <InsightHeader>
            <Snowflake size={20} />
            <InsightTitle>Winter Peak</InsightTitle>
          </InsightHeader>
          <InsightValue>+58%</InsightValue>
          <InsightDescription>
            Holiday shopping drives electronics and gift sales November-December
          </InsightDescription>
        </InsightCard>
      </SeasonalInsights>

      <PredictionCard>
        <PredictionTitle>
          <Target size={20} />
          AI-Powered Seasonal Predictions
        </PredictionTitle>
        <PredictionGrid>
          {predictions.map((pred, index) => (
            <PredictionItem key={index}>
              <PredictionLabel>{pred.label}</PredictionLabel>
              <PredictionValue>{pred.value}</PredictionValue>
              <div style={{ fontSize: '11px', color: '#10B981', marginTop: '4px' }}>
                Confidence: {pred.confidence}
              </div>
            </PredictionItem>
          ))}
        </PredictionGrid>
      </PredictionCard>

      <ChartGrid columns={2}>
        <ChartCard>
          <ChartTitle>Monthly Seasonal Patterns</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={seasonalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="spring" stackId="1" stroke="#10B981" fill="#10B981" />
              <Area type="monotone" dataKey="summer" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
              <Area type="monotone" dataKey="fall" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" />
              <Area type="monotone" dataKey="winter" stackId="1" stroke="#4F46E5" fill="#4F46E5" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Category Seasonality</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={categorySeasonality}>
              <PolarGrid strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Spring" dataKey="spring" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              <Radar name="Summer" dataKey="summer" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
              <Radar name="Fall" dataKey="fall" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
              <Radar name="Winter" dataKey="winter" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.3} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartGrid>

      <ChartGrid columns={1}>
        <ChartCard>
          <ChartTitle>Year-over-Year Quarterly Comparison</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearOverYear}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Q1" fill="#10B981" />
              <Bar dataKey="Q2" fill="#F59E0B" />
              <Bar dataKey="Q3" fill="#8B5CF6" />
              <Bar dataKey="Q4" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartGrid>

      <ChartGrid columns={2}>
        <ChartCard>
          <ChartTitle>Holiday Impact Analysis</ChartTitle>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={holidayImpact} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="holiday" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="impact" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Weekly Pattern</ChartTitle>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weekdayPattern}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartGrid>

      <ChartCard>
        <ChartTitle>Sales Intensity Heatmap (Year View)</ChartTitle>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '12px' }}>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
                <div key={month} style={{ flex: 1, textAlign: 'center', color: '#6B7280' }}>{month}</div>
              ))}
            </div>
            <HeatmapContainer>
              {heatmapData.map((cell, index) => (
                <HeatmapCell key={index} intensity={cell.intensity}>
                  {cell.intensity}
                </HeatmapCell>
              ))}
            </HeatmapContainer>
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>
            <div style={{ marginBottom: '8px' }}>Intensity Scale</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', background: 'rgba(79, 70, 229, 1)', borderRadius: '4px' }} />
                <span>High (80-100)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', background: 'rgba(79, 70, 229, 0.5)', borderRadius: '4px' }} />
                <span>Medium (40-80)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', background: 'rgba(79, 70, 229, 0.2)', borderRadius: '4px' }} />
                <span>Low (0-40)</span>
              </div>
            </div>
          </div>
        </div>
      </ChartCard>
    </AnalysisContainer>
  );
};

export default SeasonalTrendAnalysis;