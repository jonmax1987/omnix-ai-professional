import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';

const StyledTableRow = styled(motion.tr).withConfig({
  shouldForwardProp: (prop) => !['selected', 'clickable'].includes(prop),
})`
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    background-color: ${props => props.theme.colors.background.secondary};
  }
  
  ${props => props.selected && css`
    background-color: ${props.theme.colors.primary[50]};
    
    &:hover {
      background-color: ${props.theme.colors.primary[100]};
    }
  `}
  
  ${props => props.clickable && css`
    cursor: pointer;
  `}
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td.withConfig({
  shouldForwardProp: (prop) => !['align', 'width', 'minWidth'].includes(prop),
})`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  vertical-align: middle;
  
  ${props => props.align && css`
    text-align: ${props.align};
  `}
  
  ${props => props.width && css`
    width: ${props.width};
  `}
  
  ${props => props.minWidth && css`
    min-width: ${props.minWidth};
  `}
`;

const SelectionCell = styled(TableCell)`
  width: 48px;
  padding-left: ${props => props.theme.spacing[4]};
  padding-right: ${props => props.theme.spacing[2]};
`;

const ActionsCell = styled(TableCell)`
  width: auto;
  min-width: 120px;
  padding-left: ${props => props.theme.spacing[2]};
  padding-right: ${props => props.theme.spacing[4]};
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px;
  height: 16px;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  background-color: ${props => props.theme.colors.background.elevated};
  cursor: pointer;
  
  &:checked {
    background-color: ${props => props.theme.colors.primary[600]};
    border-color: ${props => props.theme.colors.primary[600]};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

const ActionButtons = styled.div.withConfig({
  shouldForwardProp: (prop) => !['alwaysVisible'].includes(prop),
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  opacity: 0.7;
  transition: opacity ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  ${StyledTableRow}:hover & {
    opacity: 1;
  }
  
  ${props => props.alwaysVisible && css`
    opacity: 1;
  `}
`;

const ActionButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'sm'
})`
  padding: ${props => props.theme.spacing[1]};
  min-width: auto;
  height: 32px;
  width: 32px;
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 10;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  box-shadow: ${props => props.theme.shadows.lg};
  padding: ${props => props.theme.spacing[1]} 0;
  min-width: 160px;
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  width: 100%;
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    background-color: ${props => props.theme.colors.background.secondary};
  }
  
  ${props => props.destructive && css`
    color: ${props.theme.colors.red[600]};
  `}
`;

const CellContent = styled.div.withConfig({
  shouldForwardProp: (prop) => !['truncate', 'maxWidth'].includes(prop),
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  ${props => props.truncate && css`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: ${props.maxWidth || '200px'};
  `}
`;

const Status = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  
  ${props => props.color === 'success' && css`
    background-color: ${props.theme.colors.green[500]};
  `}
  
  ${props => props.color === 'warning' && css`
    background-color: ${props.theme.colors.yellow[500]};
  `}
  
  ${props => props.color === 'error' && css`
    background-color: ${props.theme.colors.red[500]};
  `}
  
  ${props => props.color === 'info' && css`
    background-color: ${props.theme.colors.primary[500]};
  `}
`;

const TableRow = ({
  children,
  data,
  columns,
  selected = false,
  selectable = false,
  clickable = false,
  actions = [],
  onSelect,
  onClick,
  onAction,
  className,
  ...props
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    onSelect?.(data, e.target.checked);
  };

  const handleRowClick = (e) => {
    if (e.target.type === 'checkbox' || e.target.closest('button')) {
      return;
    }
    onClick?.(data);
  };

  const handleActionClick = (action, e) => {
    e.stopPropagation();
    
    if (action.dropdown) {
      setShowDropdown(!showDropdown);
    } else {
      onAction?.(action.id, data);
    }
  };

  const handleDropdownItemClick = (actionId, e) => {
    e.stopPropagation();
    setShowDropdown(false);
    onAction?.(actionId, data);
  };

  const renderCell = (column, value, index) => {
    const key = column.key || index;
    const cellProps = {
      align: column.align,
      width: column.width,
      minWidth: column.minWidth
    };

    if (column.render) {
      return (
        <TableCell key={key} {...cellProps}>
          {column.render(value, data)}
        </TableCell>
      );
    }

    if (column.type === 'status') {
      return (
        <TableCell key={key} {...cellProps}>
          <Status>
            <StatusDot color={value?.color || 'info'} />
            <Typography variant="body2">
              {value?.label || value}
            </Typography>
          </Status>
        </TableCell>
      );
    }

    if (column.type === 'avatar') {
      return (
        <TableCell key={key} {...cellProps}>
          <CellContent>
            {value?.avatar}
            <Typography variant="body2">
              {value?.name || value}
            </Typography>
          </CellContent>
        </TableCell>
      );
    }

    return (
      <TableCell key={key} {...cellProps}>
        <CellContent truncate={column.truncate} maxWidth={column.maxWidth}>
          {column.prefix && (
            <Typography variant="body2" color="tertiary">
              {column.prefix}
            </Typography>
          )}
          <Typography variant="body2">
            {value}
          </Typography>
          {column.suffix && (
            <Typography variant="body2" color="tertiary">
              {column.suffix}
            </Typography>
          )}
        </CellContent>
      </TableCell>
    );
  };

  // If children provided, use them directly
  if (children) {
    return (
      <StyledTableRow
        selected={selected}
        clickable={clickable}
        onClick={clickable ? handleRowClick : undefined}
        className={className}
        whileHover={clickable ? { scale: 1.002 } : undefined}
        {...props}
      >
        {selectable && (
          <SelectionCell>
            <Checkbox
              checked={selected}
              onChange={handleCheckboxChange}
              onClick={(e) => e.stopPropagation()}
            />
          </SelectionCell>
        )}
        {children}
        {actions.length > 0 && (
          <ActionsCell>
            <ActionButtons alwaysVisible={selected}>
              {actions.map((action) => {
                if (action.dropdown) {
                  return (
                    <div key={action.id} style={{ position: 'relative' }}>
                      <ActionButton onClick={(e) => handleActionClick(action, e)}>
                        <Icon name={action.icon || 'menu'} size={16} />
                      </ActionButton>
                      {showDropdown && (
                        <DropdownMenu
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                        >
                          {action.dropdown.map((item) => (
                            <DropdownItem
                              key={item.id}
                              destructive={item.destructive}
                              onClick={(e) => handleDropdownItemClick(item.id, e)}
                            >
                              {item.icon && <Icon name={item.icon} size={16} />}
                              <Typography variant="body2">
                                {item.label}
                              </Typography>
                            </DropdownItem>
                          ))}
                        </DropdownMenu>
                      )}
                    </div>
                  );
                }

                return (
                  <ActionButton
                    key={action.id}
                    onClick={(e) => handleActionClick(action, e)}
                    title={action.label}
                  >
                    <Icon name={action.icon} size={16} />
                  </ActionButton>
                );
              })}
            </ActionButtons>
          </ActionsCell>
        )}
      </StyledTableRow>
    );
  }

  // If columns and data provided, generate cells
  if (columns && data) {
    return (
      <StyledTableRow
        selected={selected}
        clickable={clickable}
        onClick={clickable ? handleRowClick : undefined}
        className={className}
        whileHover={clickable ? { scale: 1.002 } : undefined}
        {...props}
      >
        {selectable && (
          <SelectionCell>
            <Checkbox
              checked={selected}
              onChange={handleCheckboxChange}
              onClick={(e) => e.stopPropagation()}
            />
          </SelectionCell>
        )}
        {columns.map((column, index) => {
          const value = column.accessor ? data[column.accessor] : data[column.key];
          return renderCell(column, value, index);
        })}
        {actions.length > 0 && (
          <ActionsCell>
            <ActionButtons alwaysVisible={selected}>
              {actions.map((action) => {
                if (action.dropdown) {
                  return (
                    <div key={action.id} style={{ position: 'relative' }}>
                      <ActionButton onClick={(e) => handleActionClick(action, e)}>
                        <Icon name={action.icon || 'menu'} size={16} />
                      </ActionButton>
                      {showDropdown && (
                        <DropdownMenu
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                        >
                          {action.dropdown.map((item) => (
                            <DropdownItem
                              key={item.id}
                              destructive={item.destructive}
                              onClick={(e) => handleDropdownItemClick(item.id, e)}
                            >
                              {item.icon && <Icon name={item.icon} size={16} />}
                              <Typography variant="body2">
                                {item.label}
                              </Typography>
                            </DropdownItem>
                          ))}
                        </DropdownMenu>
                      )}
                    </div>
                  );
                }

                return (
                  <ActionButton
                    key={action.id}
                    onClick={(e) => handleActionClick(action, e)}
                    title={action.label}
                  >
                    <Icon name={action.icon} size={16} />
                  </ActionButton>
                );
              })}
            </ActionButtons>
          </ActionsCell>
        )}
      </StyledTableRow>
    );
  }

  return null;
};

export default TableRow;