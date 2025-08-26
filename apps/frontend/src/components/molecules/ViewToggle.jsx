import React from 'react';
import styled from 'styled-components';
import Button from '../atoms/Button';

const ToggleContainer = styled.div`
  display: flex;
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
`;

const ToggleButton = styled(Button)`
  border-radius: 0;
  border: none;
  
  &:not(:last-child) {
    border-right: 1px solid ${props => props.theme.colors.border.light};
  }
`;

function ViewToggle({ view, onViewChange, options }) {
  return (
    <ToggleContainer>
      {options.map(option => (
        <ToggleButton
          key={option.key}
          variant={view === option.key ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onViewChange(option.key)}
          title={option.label}
        >
          {option.icon && <span style={{ marginRight: option.label ? '0.5rem' : 0 }}>{option.icon}</span>}
          {option.label}
        </ToggleButton>
      ))}
    </ToggleContainer>
  );
}

export default ViewToggle;