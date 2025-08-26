import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useCallback } from 'react';
import { BookOpen, Search, FileText, Video, HelpCircle, Code, Users, Lightbulb, Download, ExternalLink, ChevronRight, ChevronDown, Star, Clock, Tag, Filter } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const DocContainer = styled(motion.div)`
  padding: ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background.primary};
  min-height: 100vh;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    padding: ${props => props.theme.spacing[4]};
  }
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing[6]};
  
  h2 {
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing[2]};
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize['2xl']};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    margin-bottom: ${props => props.theme.spacing[2]};
  }
  
  p {
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.typography.fontSize.base};
    max-width: 600px;
  }
`;

const DocLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: ${props => props.theme.spacing[6]};
  height: calc(100vh - 200px);
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

const Sidebar = styled.div`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  overflow-y: auto;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    order: 2;
    max-height: 400px;
  }
`;

const SearchContainer = styled.div`
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[3]};
  padding-left: ${props => props.theme.spacing[10]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary[100]};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: ${props => props.theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.text.tertiary};
  pointer-events: none;
`;

const SearchWrapper = styled.div`
  position: relative;
`;

const NavSection = styled.div`
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const NavSectionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing[2]};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  width: 100%;
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border: none;
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.active ? props.theme.colors.primary[50] : 'transparent'};
  color: ${props => props.active ? props.theme.colors.primary[700] : props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.active ? props.theme.typography.fontWeight.medium : props.theme.typography.fontWeight.normal};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    background: ${props => props.theme.colors.primary[50]};
    color: ${props => props.theme.colors.primary[700]};
  }
`;

const MainContent = styled.div`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[6]};
  overflow-y: auto;
  animation: ${fadeIn} 0.4s ease-out;
`;

const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
  padding-bottom: ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
`;

const ContentTitle = styled.h1`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin: 0;
`;

const ContentMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[4]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.tertiary};
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary[50]};
    border-color: ${props => props.theme.colors.primary[200]};
    color: ${props => props.theme.colors.primary[700]};
  }
  
  &.primary {
    background: ${props => props.theme.colors.primary[600]};
    border-color: ${props => props.theme.colors.primary[600]};
    color: ${props => props.theme.colors.white};
    
    &:hover {
      background: ${props => props.theme.colors.primary[700]};
      border-color: ${props => props.theme.colors.primary[700]};
    }
  }
`;

const ContentBody = styled.div`
  line-height: 1.7;
  color: ${props => props.theme.colors.text.primary};
  
  h3 {
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize.lg};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    margin: ${props => props.theme.spacing[4]} 0 ${props => props.theme.spacing[2]} 0;
  }
  
  h4 {
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize.base};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    margin: ${props => props.theme.spacing[3]} 0 ${props => props.theme.spacing[2]} 0;
  }
  
  p {
    margin-bottom: ${props => props.theme.spacing[3]};
    color: ${props => props.theme.colors.text.secondary};
  }
  
  ul, ol {
    margin: ${props => props.theme.spacing[2]} 0 ${props => props.theme.spacing[4]} 0;
    padding-left: ${props => props.theme.spacing[5]};
    
    li {
      margin-bottom: ${props => props.theme.spacing[1]};
      color: ${props => props.theme.colors.text.secondary};
    }
  }
  
  code {
    background: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.gray[800]};
    padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
    border-radius: ${props => props.theme.spacing[1]};
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: ${props => props.theme.typography.fontSize.sm};
  }
  
  pre {
    background: ${props => props.theme.colors.gray[900]};
    color: ${props => props.theme.colors.gray[100]};
    padding: ${props => props.theme.spacing[4]};
    border-radius: ${props => props.theme.spacing[2]};
    overflow-x: auto;
    margin: ${props => props.theme.spacing[3]} 0;
    
    code {
      background: none;
      color: inherit;
      padding: 0;
    }
  }
`;

const CollapsibleSection = styled.div`
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const CollapsibleHeader = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  width: 100%;
  padding: ${props => props.theme.spacing[3]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background.elevated};
  }
`;

const CollapsibleContent = styled(motion.div)`
  padding: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-top: none;
  border-radius: 0 0 ${props => props.theme.spacing[2]} ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.elevated};
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[2]};
  margin: ${props => props.theme.spacing[3]} 0;
`;

const TagItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.primary[100]};
  color: ${props => props.theme.colors.primary[700]};
  border-radius: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${props => props.theme.spacing[4]};
  right: ${props => props.theme.spacing[4]};
  background: none;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  padding: ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.spacing[1]};
  
  &:hover {
    background: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const ABTestDocumentation = ({ onDocumentationUpdate, onClose }) => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState(new Set(['faq']));

  // Mock documentation content
  const documentationContent = useMemo(() => {
    return {
      'getting-started': {
        title: 'Getting Started with A/B Testing',
        icon: Lightbulb,
        lastUpdated: '2024-08-20',
        readTime: '5 min',
        tags: ['basics', 'setup', 'beginner'],
        content: `
          <h3>Welcome to OMNIX AI A/B Testing</h3>
          <p>A/B testing is a powerful method to compare different versions of AI models and features to determine which performs better. Our platform makes it easy to create, manage, and analyze sophisticated A/B tests.</p>
          
          <h4>Quick Start Guide</h4>
          <ol>
            <li><strong>Create a New Test:</strong> Click the "New A/B Test" button and follow the creation wizard</li>
            <li><strong>Configure Test Parameters:</strong> Set your target metrics, sample size, and duration</li>
            <li><strong>Select Models:</strong> Choose which AI models you want to compare</li>
            <li><strong>Launch Test:</strong> Deploy your test to start collecting data</li>
            <li><strong>Monitor Results:</strong> Track real-time performance and statistical significance</li>
          </ol>
          
          <h4>Key Features</h4>
          <ul>
            <li>Real-time statistical analysis with power calculations</li>
            <li>Advanced model comparison (Claude Sonnet vs Haiku, GPT variants)</li>
            <li>Automated significance testing and confidence intervals</li>
            <li>Comprehensive risk assessment and mitigation</li>
            <li>GDPR/CCPA compliant data governance</li>
            <li>Multi-variant testing support (A/B/C/D...)</li>
          </ul>
          
          <h4>Best Practices</h4>
          <p>Always start with a clear hypothesis and ensure you have sufficient sample size for statistical power. Monitor tests regularly and be prepared to stop early if you detect significant issues.</p>
        `
      },
      'test-creation': {
        title: 'Creating A/B Tests',
        icon: FileText,
        lastUpdated: '2024-08-19',
        readTime: '8 min',
        tags: ['creation', 'wizard', 'configuration'],
        content: `
          <h3>A/B Test Creation Wizard</h3>
          <p>Our step-by-step wizard guides you through creating sophisticated A/B tests with proper statistical foundations.</p>
          
          <h4>Step 1: Basic Information</h4>
          <ul>
            <li>Test name and description</li>
            <li>Hypothesis statement</li>
            <li>Target audience and segmentation criteria</li>
          </ul>
          
          <h4>Step 2: Model Configuration</h4>
          <ul>
            <li>Select baseline model (Control - A)</li>
            <li>Select experimental model (Variant - B)</li>
            <li>Configure model parameters and settings</li>
          </ul>
          
          <h4>Step 3: Metrics and Goals</h4>
          <ul>
            <li>Primary metric: Main success criterion</li>
            <li>Secondary metrics: Additional tracking points</li>
            <li>Success thresholds and minimum detectable effects</li>
          </ul>
          
          <h4>Step 4: Statistical Configuration</h4>
          <ul>
            <li>Significance level (typically 0.05)</li>
            <li>Statistical power (recommended 0.8+)</li>
            <li>Sample size calculation</li>
            <li>Test duration and schedule</li>
          </ul>
          
          <h4>Advanced Options</h4>
          <p>Configure traffic allocation, randomization methods, and pre-filtering criteria for sophisticated experimental designs.</p>
        `
      },
      'statistical-analysis': {
        title: 'Statistical Analysis Guide',
        icon: Code,
        lastUpdated: '2024-08-20',
        readTime: '12 min',
        tags: ['statistics', 'analysis', 'advanced'],
        content: `
          <h3>Understanding A/B Test Statistics</h3>
          <p>Our platform provides comprehensive statistical analysis tools to ensure your test results are reliable and actionable.</p>
          
          <h4>Statistical Significance</h4>
          <p>Statistical significance indicates whether observed differences are likely due to the intervention rather than random variation. We use:</p>
          <ul>
            <li><strong>P-value:</strong> Probability that results occurred by chance</li>
            <li><strong>Confidence Intervals:</strong> Range of plausible values for the true effect</li>
            <li><strong>Z-score:</strong> Standard deviations from the mean</li>
          </ul>
          
          <h4>Power Analysis</h4>
          <p>Power analysis helps determine the sample size needed to detect meaningful effects:</p>
          <pre><code>Required Sample Size = (Z_α + Z_β)² × 2 × p × (1-p) / (effect_size)²
          
Where:
- Z_α: Critical value for significance level
- Z_β: Critical value for desired power
- p: Baseline conversion rate
- effect_size: Minimum detectable effect</code></pre>
          
          <h4>Effect Size Estimation</h4>
          <p>Effect size measures the practical significance of your results:</p>
          <ul>
            <li><strong>Cohen's d:</strong> Standardized difference between means</li>
            <li><strong>Relative lift:</strong> Percentage improvement over baseline</li>
            <li><strong>Absolute difference:</strong> Raw difference in metrics</li>
          </ul>
          
          <h4>Bayesian Analysis</h4>
          <p>Our Bayesian approach provides intuitive probability statements about your results, including probability of superiority and credible intervals.</p>
        `
      },
      'model-comparison': {
        title: 'AI Model Comparison',
        icon: Users,
        lastUpdated: '2024-08-18',
        readTime: '10 min',
        tags: ['models', 'claude', 'gpt', 'comparison'],
        content: `
          <h3>Comparing AI Models Effectively</h3>
          <p>OMNIX AI supports comprehensive comparison between leading AI models including Claude 3.5 Sonnet, Claude 3 Haiku, GPT-4 Turbo, and GPT-3.5 Turbo.</p>
          
          <h4>Available Models</h4>
          <ul>
            <li><strong>Claude 3.5 Sonnet:</strong> Highest accuracy, best for complex reasoning</li>
            <li><strong>Claude 3 Haiku:</strong> Fastest response times, cost-effective</li>
            <li><strong>GPT-4 Turbo:</strong> Strong general performance, latest OpenAI model</li>
            <li><strong>GPT-3.5 Turbo:</strong> Balanced speed and cost</li>
          </ul>
          
          <h4>Comparison Metrics</h4>
          <ul>
            <li><strong>Accuracy:</strong> Quality of responses and recommendations</li>
            <li><strong>Speed:</strong> Average response time and throughput</li>
            <li><strong>Cost Efficiency:</strong> Performance per dollar spent</li>
            <li><strong>Reliability:</strong> Consistency and error rates</li>
          </ul>
          
          <h4>Best Practices for Model Testing</h4>
          <ol>
            <li>Use consistent prompts and inputs across models</li>
            <li>Test with representative user scenarios</li>
            <li>Consider both quantitative metrics and qualitative assessment</li>
            <li>Account for model-specific strengths and weaknesses</li>
            <li>Monitor long-term performance trends</li>
          </ol>
          
          <h4>Interpreting Results</h4>
          <p>Look beyond simple win/loss metrics. Consider context, user segments, and business impact when making model selection decisions.</p>
        `
      },
      'governance': {
        title: 'Data Governance & Privacy',
        icon: HelpCircle,
        lastUpdated: '2024-08-20',
        readTime: '15 min',
        tags: ['gdpr', 'privacy', 'compliance', 'security'],
        content: `
          <h3>Privacy-First A/B Testing</h3>
          <p>Our platform ensures complete compliance with GDPR, CCPA, and other privacy regulations while maintaining the statistical integrity of your tests.</p>
          
          <h4>GDPR Compliance</h4>
          <ul>
            <li><strong>Data Minimization:</strong> Collect only necessary test data</li>
            <li><strong>Explicit Consent:</strong> Clear opt-in for all participants</li>
            <li><strong>Right to Erasure:</strong> Delete participant data on request</li>
            <li><strong>Data Portability:</strong> Export user data in standard formats</li>
            <li><strong>Privacy by Design:</strong> Built-in privacy protection</li>
          </ul>
          
          <h4>Data Retention Policies</h4>
          <ul>
            <li><strong>Test Data:</strong> Retained for 2 years for analysis</li>
            <li><strong>Personal Identifiers:</strong> Deleted after 30 days</li>
            <li><strong>Analytics Data:</strong> Aggregated and stored for 13 months</li>
          </ul>
          
          <h4>Security Measures</h4>
          <ul>
            <li><strong>Encryption:</strong> AES-256 at rest, TLS 1.3 in transit</li>
            <li><strong>Access Control:</strong> Role-based permissions and audit logs</li>
            <li><strong>Anonymization:</strong> k-anonymity and differential privacy</li>
            <li><strong>Key Management:</strong> AWS KMS for secure key handling</li>
          </ul>
          
          <h4>Audit and Compliance</h4>
          <p>Comprehensive audit trails track all data access and modifications. Regular compliance reports ensure ongoing regulatory adherence.</p>
        `
      },
      'troubleshooting': {
        title: 'Troubleshooting Guide',
        icon: HelpCircle,
        lastUpdated: '2024-08-19',
        readTime: '7 min',
        tags: ['issues', 'debugging', 'support'],
        content: `
          <h3>Common Issues and Solutions</h3>
          <p>Quick solutions to frequently encountered problems in A/B testing.</p>
          
          <h4>Test Not Starting</h4>
          <ul>
            <li>Check that both models are properly configured</li>
            <li>Verify traffic allocation adds up to 100%</li>
            <li>Ensure sufficient user base for sample size</li>
            <li>Review targeting criteria for conflicts</li>
          </ul>
          
          <h4>Low Statistical Power</h4>
          <ul>
            <li>Increase sample size or test duration</li>
            <li>Reduce minimum detectable effect size</li>
            <li>Check for high variance in your metrics</li>
            <li>Consider pre-filtering to reduce noise</li>
          </ul>
          
          <h4>Unexpected Results</h4>
          <ul>
            <li>Verify model implementations match specifications</li>
            <li>Check for selection bias in participant assignment</li>
            <li>Review external factors that might affect results</li>
            <li>Validate metric calculations and definitions</li>
          </ul>
          
          <h4>Performance Issues</h4>
          <ul>
            <li>Monitor model response times and error rates</li>
            <li>Check for resource constraints or throttling</li>
            <li>Review traffic patterns for anomalies</li>
            <li>Consider load balancing across model instances</li>
          </ul>
          
          <h4>Getting Help</h4>
          <p>If you continue experiencing issues, contact our support team with test details, error messages, and steps to reproduce the problem.</p>
        `
      }
    };
  }, []);

  const faqData = useMemo(() => [
    {
      question: "How long should I run my A/B test?",
      answer: "Test duration depends on your traffic volume and effect size. Generally, run tests for at least one full business cycle (typically 1-2 weeks) to account for day-of-week effects. Our power analysis calculator provides specific recommendations based on your parameters."
    },
    {
      question: "What's the difference between statistical and practical significance?",
      answer: "Statistical significance means results are unlikely due to chance, while practical significance means the difference is large enough to matter for your business. A 0.1% improvement might be statistically significant with enough data but practically meaningless."
    },
    {
      question: "Can I stop a test early if I see significant results?",
      answer: "Early stopping can lead to false positives. If you must stop early, use our sequential testing methods or adjust your significance threshold using alpha spending functions to maintain statistical validity."
    },
    {
      question: "How do I handle multiple comparisons in A/B/C tests?",
      answer: "Use Bonferroni correction or false discovery rate (FDR) control to adjust for multiple comparisons. Our multi-variant testing interface automatically applies these corrections to maintain family-wise error rates."
    },
    {
      question: "What sample size do I need for my test?",
      answer: "Sample size depends on your baseline metric, desired effect size, significance level (α), and statistical power. Use our power analysis tool to calculate the exact requirements for your specific test parameters."
    }
  ], []);

  const navSections = [
    {
      title: 'Getting Started',
      items: [
        { id: 'getting-started', label: 'Quick Start', icon: Lightbulb },
        { id: 'test-creation', label: 'Creating Tests', icon: FileText }
      ]
    },
    {
      title: 'Advanced Topics',
      items: [
        { id: 'statistical-analysis', label: 'Statistical Analysis', icon: Code },
        { id: 'model-comparison', label: 'Model Comparison', icon: Users },
        { id: 'governance', label: 'Data Governance', icon: HelpCircle }
      ]
    },
    {
      title: 'Support',
      items: [
        { id: 'troubleshooting', label: 'Troubleshooting', icon: HelpCircle },
        { id: 'faq', label: 'FAQ', icon: BookOpen }
      ]
    }
  ];

  const handleSectionToggle = useCallback((sectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const handleDownload = useCallback((format) => {
    const content = documentationContent[activeSection];
    const docData = {
      title: content.title,
      content: content.content,
      lastUpdated: content.lastUpdated,
      tags: content.tags,
      exportedAt: new Date().toISOString(),
      format: format
    };
    
    const blob = new Blob([JSON.stringify(docData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title.toLowerCase().replace(/\s+/g, '-')}-${format}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onDocumentationUpdate?.({
      type: 'download',
      section: activeSection,
      format,
      timestamp: new Date()
    });
  }, [activeSection, documentationContent, onDocumentationUpdate]);

  const filteredSections = useMemo(() => {
    if (!searchTerm) return navSections;
    
    const filtered = navSections.map(section => ({
      ...section,
      items: section.items.filter(item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        documentationContent[item.id]?.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(section => section.items.length > 0);
    
    return filtered;
  }, [navSections, searchTerm, documentationContent]);

  const currentContent = documentationContent[activeSection];

  return (
    <DocContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      {onClose && (
        <CloseButton onClick={onClose}>
          ✕
        </CloseButton>
      )}

      <Header>
        <h2>
          <BookOpen />
          A/B Testing Documentation & Knowledge Base
        </h2>
        <p>
          Comprehensive guides, tutorials, and reference materials for mastering A/B testing with OMNIX AI. Learn best practices, troubleshoot issues, and optimize your testing strategy.
        </p>
      </Header>

      <DocLayout>
        <Sidebar>
          <SearchContainer>
            <SearchWrapper>
              <SearchInput
                type="text"
                placeholder="Search documentation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchIcon size={16} />
            </SearchWrapper>
          </SearchContainer>

          {filteredSections.map(section => (
            <NavSection key={section.title}>
              <NavSectionTitle>{section.title}</NavSectionTitle>
              {section.items.map(item => {
                const Icon = item.icon;
                return (
                  <NavItem
                    key={item.id}
                    active={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <Icon size={16} />
                    {item.label}
                  </NavItem>
                );
              })}
            </NavSection>
          ))}
        </Sidebar>

        <MainContent>
          {activeSection === 'faq' ? (
            <>
              <ContentHeader>
                <ContentTitle>
                  <HelpCircle />
                  Frequently Asked Questions
                </ContentTitle>
                <ContentMeta>
                  <span>Last updated: Aug 20, 2024</span>
                  <span>•</span>
                  <span>{faqData.length} questions</span>
                </ContentMeta>
              </ContentHeader>

              <ContentBody>
                <p>Find quick answers to common questions about A/B testing with OMNIX AI.</p>
                
                {faqData.map((faq, index) => (
                  <CollapsibleSection key={index}>
                    <CollapsibleHeader
                      onClick={() => handleSectionToggle(`faq-${index}`)}
                    >
                      {expandedSections.has(`faq-${index}`) ? 
                        <ChevronDown size={16} /> : <ChevronRight size={16} />
                      }
                      {faq.question}
                    </CollapsibleHeader>
                    <AnimatePresence>
                      {expandedSections.has(`faq-${index}`) && (
                        <CollapsibleContent
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <p>{faq.answer}</p>
                        </CollapsibleContent>
                      )}
                    </AnimatePresence>
                  </CollapsibleSection>
                ))}
              </ContentBody>
            </>
          ) : (
            <>
              <ContentHeader>
                <ContentTitle>
                  {currentContent?.icon && <currentContent.icon />}
                  {currentContent?.title}
                </ContentTitle>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ContentMeta>
                    <span><Clock size={14} /> {currentContent?.readTime}</span>
                    <span>•</span>
                    <span>Updated {currentContent?.lastUpdated}</span>
                  </ContentMeta>
                  <ActionButton onClick={() => handleDownload('pdf')}>
                    <Download size={16} />
                    Export PDF
                  </ActionButton>
                  <ActionButton>
                    <ExternalLink size={16} />
                    Share
                  </ActionButton>
                </div>
              </ContentHeader>

              <TagList>
                {currentContent?.tags?.map(tag => (
                  <TagItem key={tag}>
                    <Tag size={12} />
                    {tag}
                  </TagItem>
                ))}
              </TagList>

              <ContentBody
                dangerouslySetInnerHTML={{ __html: currentContent?.content || '' }}
              />
            </>
          )}
        </MainContent>
      </DocLayout>
    </DocContainer>
  );
};

export default ABTestDocumentation;