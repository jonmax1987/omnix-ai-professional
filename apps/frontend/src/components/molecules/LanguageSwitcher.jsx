import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';

const LanguageSwitcherContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const LanguageButton = styled(Button)`
  min-width: 44px;
  padding: ${props => props.theme.spacing[2]};
  
  &.language-button {
    /* Print-specific styles are handled in global CSS */
  }
`;

const LanguageDropdown = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 50;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  box-shadow: ${props => props.theme.shadows.lg};
  margin-top: ${props => props.theme.spacing[1]};
  min-width: 180px;
  overflow: hidden;
  
  /* RTL Support */
  [dir="rtl"] & {
    right: auto;
    left: 0;
  }
`;

const LanguageOption = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  width: 100%;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background: none;
  border: none;
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  transition: background-color ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  text-align: left;
  
  &:hover {
    background-color: ${props => props.theme.colors.background.secondary};
  }
  
  ${props => props.active && `
    background-color: ${props.theme.colors.primary[50]};
    color: ${props.theme.colors.primary[600]};
  `}
`;

const LanguageFlag = styled.div`
  width: 20px;
  height: 15px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  background: ${props => props.theme.colors.gray[100]};
  flex-shrink: 0;
`;

const LanguageInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const languages = [
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    nativeName: 'English'
  },
  {
    code: 'he',
    name: 'Hebrew',
    flag: '🇮🇱',
    nativeName: 'עברית'
  }
];

const LanguageSwitcher = ({ variant = 'default', size = 'sm' }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { locale, changeLocale } = useI18n();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const handleLanguageSelect = (languageCode) => {
    changeLocale(languageCode);
    setShowDropdown(false);
  };

  return (
    <LanguageSwitcherContainer ref={dropdownRef}>
      <LanguageButton
        variant="ghost"
        size={size}
        onClick={() => setShowDropdown(!showDropdown)}
        className="language-button"
        title="Change language"
      >
        <span style={{ fontSize: '16px' }}>{currentLanguage.flag}</span>
        {variant === 'full' && (
          <>
            <Typography variant="body2">
              {currentLanguage.nativeName}
            </Typography>
            <Icon name="chevronDown" size={14} />
          </>
        )}
        {variant === 'default' && <Icon name="chevronDown" size={12} />}
      </LanguageButton>

      <AnimatePresence>
        {showDropdown && (
          <LanguageDropdown
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {languages.map((language) => (
              <LanguageOption
                key={language.code}
                active={language.code === locale}
                onClick={() => handleLanguageSelect(language.code)}
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
              >
                <LanguageFlag>
                  <span style={{ fontSize: '14px' }}>{language.flag}</span>
                </LanguageFlag>
                <LanguageInfo>
                  <Typography variant="body2" weight="medium">
                    {language.nativeName}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    {language.name}
                  </Typography>
                </LanguageInfo>
                {language.code === locale && (
                  <Icon name="checkCircle" size={16} color="currentColor" />
                )}
              </LanguageOption>
            ))}
          </LanguageDropdown>
        )}
      </AnimatePresence>
    </LanguageSwitcherContainer>
  );
};

export default LanguageSwitcher;