import React, { useState } from 'react';
import styled from 'styled-components';
import Icon from '../atoms/Icon';
import * as LucideIcons from 'lucide-react';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 30px;
  color: ${({ theme }) => theme?.colors?.text?.primary || '#333'};
`;

const SearchContainer = styled.div`
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
`;

const SearchInput = styled.input`
  padding: 10px 15px;
  border: 2px solid ${({ theme }) => theme?.colors?.gray?.[300] || '#ddd'};
  border-radius: 8px;
  font-size: 16px;
  width: 400px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme?.colors?.primary?.main || '#0066cc'};
  }
`;

const Stats = styled.div`
  text-align: center;
  margin-bottom: 30px;
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#666'};
  font-size: 14px;
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const IconCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border: 1px solid ${({ theme }) => theme?.colors?.gray?.[200] || '#e5e5e5'};
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme?.colors?.primary?.main || '#0066cc'};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const IconWrapper = styled.div`
  margin-bottom: 8px;
  color: ${({ theme }) => theme?.colors?.primary?.main || '#0066cc'};
`;

const IconName = styled.span`
  font-size: 11px;
  text-align: center;
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#666'};
  word-break: break-all;
  line-height: 1.2;
`;

const CopyNotification = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${({ theme }) => theme?.colors?.success?.main || '#22c55e'};
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  z-index: 1000;
  transform: ${({ show }) => show ? 'translateX(0)' : 'translateX(120%)'};
  transition: transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const InfoBox = styled.div`
  margin: 30px 0;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  text-align: center;
`;

const InfoTitle = styled.h3`
  margin-bottom: 10px;
  font-size: 20px;
`;

const InfoText = styled.p`
  margin-bottom: 15px;
  opacity: 0.95;
`;

const InfoLink = styled.a`
  color: white;
  text-decoration: underline;
  font-weight: 500;
  
  &:hover {
    opacity: 0.8;
  }
`;

const IconShowcase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copyNotification, setCopyNotification] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  // Get all available Lucide icon names
  const allIconNames = Object.keys(LucideIcons).filter(key => 
    key !== 'default' && 
    key !== 'createLucideIcon' && 
    typeof LucideIcons[key] === 'function' &&
    key[0] === key[0].toUpperCase() // Only get icon components (start with uppercase)
  ).map(name => {
    // Convert PascalCase to kebab-case for display
    return name.replace(/([A-Z])/g, (match, p1, offset) => 
      (offset > 0 ? '-' : '') + p1.toLowerCase()
    );
  });

  const filteredIcons = searchTerm 
    ? allIconNames.filter(name => 
        name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allIconNames.slice(0, 100); // Show first 100 icons when not searching

  const copyToClipboard = (iconName) => {
    const text = `<Icon name="${iconName}" size={24} />`;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setCopyNotification(true);
    setTimeout(() => setCopyNotification(false), 3000);
  };

  return (
    <Container>
      <Title>🎨 OMNIX AI Icon System</Title>
      
      <InfoBox>
        <InfoTitle>Powered by Lucide React</InfoTitle>
        <InfoText>
          280+ beautiful, consistent icons • Always works • Never breaks
        </InfoText>
        <InfoLink href="https://lucide.dev/icons" target="_blank" rel="noopener noreferrer">
          Browse all icons at lucide.dev →
        </InfoLink>
      </InfoBox>
      
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search from 280+ icons... (e.g., 'user', 'shopping', 'arrow')"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>
      
      <Stats>
        {searchTerm ? (
          <>Found {filteredIcons.length} icons matching "{searchTerm}"</>
        ) : (
          <>Showing first 100 of {allIconNames.length} available icons</>
        )}
      </Stats>

      <IconGrid>
        {filteredIcons.map(iconName => (
          <IconCard 
            key={iconName} 
            onClick={() => copyToClipboard(iconName)}
            title={`Click to copy: <Icon name="${iconName}" />`}
          >
            <IconWrapper>
              <Icon name={iconName} size={24} />
            </IconWrapper>
            <IconName>{iconName}</IconName>
          </IconCard>
        ))}
      </IconGrid>

      {filteredIcons.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <Icon name="search-x" size={48} />
          <p style={{ marginTop: '15px' }}>
            No icons found matching "{searchTerm}"
          </p>
          <p style={{ fontSize: '14px', marginTop: '5px' }}>
            Try: user, settings, shopping-cart, home, etc.
          </p>
        </div>
      )}

      <CopyNotification show={copyNotification}>
        ✓ Copied: {copiedText}
      </CopyNotification>
      
      <InfoBox style={{ marginTop: '40px', background: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)' }}>
        <InfoTitle>🛡️ Bulletproof Icon System</InfoTitle>
        <InfoText style={{ fontSize: '14px' }}>
          • Automatic name normalization (kebab-case, camelCase, PascalCase)<br/>
          • Smart aliases for common variations<br/>
          • Always shows fallback icon if name not found<br/>
          • Never throws errors or breaks your app<br/>
          • Works with any string input
        </InfoText>
      </InfoBox>
    </Container>
  );
};

export default IconShowcase;