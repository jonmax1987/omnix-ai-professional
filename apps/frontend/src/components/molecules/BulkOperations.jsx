import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';

const BulkContainer = styled(motion.div)`
  background: ${props => props.theme.colors.primary[50]};
  border: 1px solid ${props => props.theme.colors.primary[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const BulkInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BulkActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

function BulkOperations({ selectedCount, actions, onAction, onDeselectAll }) {
  return (
    <BulkContainer
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <BulkInfo>
        <Typography variant="body2" weight="500">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </Typography>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onDeselectAll}
        >
          Deselect All
        </Button>
      </BulkInfo>

      <BulkActions>
        {actions.map(action => (
          <Button
            key={action.key}
            variant={action.variant || 'outline'}
            size="sm"
            onClick={() => onAction(action.key)}
          >
            {action.icon && <span style={{ marginRight: '0.5rem' }}>{action.icon}</span>}
            {action.label}
          </Button>
        ))}
      </BulkActions>
    </BulkContainer>
  );
}

export default BulkOperations;