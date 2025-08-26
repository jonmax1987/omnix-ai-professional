import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, forwardRef } from 'react';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';

const DatePickerContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DateInput = styled(Input)`
  cursor: pointer;
  
  &:focus {
    cursor: text;
  }
`;

const CalendarContainer = styled(motion.div)`
  position: absolute;
  top: calc(100% + ${props => props.theme.spacing[1]});
  left: 0;
  z-index: 20;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  box-shadow: ${props => props.theme.shadows.lg};
  padding: ${props => props.theme.spacing[4]};
  min-width: 300px;
  user-select: none;
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const MonthYearSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const NavigationButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'sm'
})`
  padding: ${props => props.theme.spacing[1]};
  min-width: auto;
  width: 32px;
  height: 32px;
`;

const MonthYearButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'sm'
})`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: ${props => props.theme.spacing[1]};
`;

const DayHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.secondary};
`;

const DayCell = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: ${props => props.theme.spacing[1]};
  background: none;
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    background-color: ${props => props.theme.colors.background.secondary};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary[500]};
    outline-offset: 2px;
  }
  
  ${props => props.isToday && css`
    background-color: ${props.theme.colors.primary[100]};
    color: ${props.theme.colors.primary[700]};
    font-weight: ${props.theme.typography.fontWeight.medium};
  `}
  
  ${props => props.isSelected && css`
    background-color: ${props.theme.colors.primary[600]};
    color: ${props.theme.colors.text.inverse};
    font-weight: ${props.theme.typography.fontWeight.medium};
    
    &:hover {
      background-color: ${props.theme.colors.primary[700]};
    }
  `}
  
  ${props => props.isOtherMonth && css`
    color: ${props.theme.colors.text.tertiary};
  `}
  
  ${props => props.isDisabled && css`
    color: ${props.theme.colors.text.tertiary};
    cursor: not-allowed;
    opacity: 0.5;
    
    &:hover {
      background-color: transparent;
    }
  `}
  
  ${props => props.isInRange && !props.isSelected && css`
    background-color: ${props.theme.colors.primary[50]};
    color: ${props.theme.colors.primary[700]};
  `}
  
  ${props => props.isRangeStart && css`
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  `}
  
  ${props => props.isRangeEnd && css`
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  `}
  
  ${props => props.isRangeMiddle && css`
    border-radius: 0;
  `}
`;

const CalendarFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${props => props.theme.spacing[4]};
  padding-top: ${props => props.theme.spacing[3]};
  border-top: 1px solid ${props => props.theme.colors.border.subtle};
`;

const TodayButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'sm'
})``;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
`;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDate = (date, format = 'MM/dd/yyyy') => {
  if (!date) return '';
  
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  
  return format
    .replace('MM', month)
    .replace('dd', day)
    .replace('yyyy', year);
};

const parseDate = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const isDateInRange = (date, start, end) => {
  if (!date || !start || !end) return false;
  const d = new Date(date);
  const s = new Date(start);
  const e = new Date(end);
  return d >= s && d <= e;
};

const DatePicker = forwardRef(({
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  placeholder = 'Select date',
  format = 'MM/dd/yyyy',
  disabled = false,
  error,
  minDate,
  maxDate,
  range = false,
  showToday = true,
  closeOnSelect = true,
  className,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState(new Date());
  const [inputValue, setInputValue] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (value) {
      if (range && Array.isArray(value)) {
        setRangeStart(value[0] ? new Date(value[0]) : null);
        setRangeEnd(value[1] ? new Date(value[1]) : null);
        setInputValue(
          value[0] && value[1] 
            ? `${formatDate(value[0], format)} - ${formatDate(value[1], format)}`
            : value[0] ? formatDate(value[0], format) : ''
        );
      } else {
        const date = new Date(value);
        setSelectedDate(date);
        setInputValue(formatDate(date, format));
        setDisplayDate(date);
      }
    }
  }, [value, format, range]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    const parsedDate = parseDate(e.target.value);
    if (parsedDate) {
      if (range) {
        // Handle range parsing logic here if needed
      } else {
        setSelectedDate(parsedDate);
        onChange?.(parsedDate);
      }
    }
  };

  const handleDateSelect = (date) => {
    if (isDateDisabled(date)) return;
    
    if (range) {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        // Start new range
        setRangeStart(date);
        setRangeEnd(null);
        setInputValue(formatDate(date, format));
      } else if (rangeStart && !rangeEnd) {
        // Complete range
        const start = date < rangeStart ? date : rangeStart;
        const end = date < rangeStart ? rangeStart : date;
        setRangeStart(start);
        setRangeEnd(end);
        setInputValue(`${formatDate(start, format)} - ${formatDate(end, format)}`);
        onChange?.([start, end]);
        
        if (closeOnSelect) {
          setIsOpen(false);
        }
      }
    } else {
      setSelectedDate(date);
      setInputValue(formatDate(date, format));
      onChange?.(date);
      
      if (closeOnSelect) {
        setIsOpen(false);
      }
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    handleDateSelect(today);
  };

  const handlePrevMonth = () => {
    setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isDateDisabled = (date) => {
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    return false;
  };

  const getDaysInMonth = () => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isOtherMonth: true
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isOtherMonth: false
      });
    }
    
    // Next month days
    const remainingCells = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isOtherMonth: true
      });
    }
    
    return days;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return (
    <DatePickerContainer ref={containerRef} className={className}>
      <DateInput
        ref={ref || inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onClick={handleInputClick}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        suffix={<Icon name="calendar" size={16} />}
        readOnly
        {...props}
      />
      
      <AnimatePresence>
        {isOpen && (
          <CalendarContainer
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <CalendarHeader>
              <MonthYearSelector>
                <MonthYearButton>
                  <Typography variant="subtitle2" weight="medium">
                    {MONTHS[displayDate.getMonth()]} {displayDate.getFullYear()}
                  </Typography>
                </MonthYearButton>
              </MonthYearSelector>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <NavigationButton onClick={handlePrevMonth}>
                  <Icon name="chevronLeft" size={16} />
                </NavigationButton>
                <NavigationButton onClick={handleNextMonth}>
                  <Icon name="chevronRight" size={16} />
                </NavigationButton>
              </div>
            </CalendarHeader>
            
            <CalendarGrid>
              {DAYS.map(day => (
                <DayHeader key={day}>
                  {day}
                </DayHeader>
              ))}
              
              {getDaysInMonth().map((dayInfo, index) => {
                const { date, isOtherMonth } = dayInfo;
                const isToday = isSameDay(date, today);
                const isSelected = range 
                  ? (rangeStart && isSameDay(date, rangeStart)) || (rangeEnd && isSameDay(date, rangeEnd))
                  : selectedDate && isSameDay(date, selectedDate);
                const isDisabled = isDateDisabled(date);
                const isInRange = range && rangeStart && rangeEnd && isDateInRange(date, rangeStart, rangeEnd);
                
                return (
                  <DayCell
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    isToday={isToday}
                    isSelected={isSelected}
                    isOtherMonth={isOtherMonth}
                    isDisabled={isDisabled}
                    isInRange={isInRange}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {date.getDate()}
                  </DayCell>
                );
              })}
            </CalendarGrid>
            
            <CalendarFooter>
              {showToday && (
                <TodayButton onClick={handleTodayClick}>
                  Today
                </TodayButton>
              )}
              
              <ActionButtons>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
              </ActionButtons>
            </CalendarFooter>
          </CalendarContainer>
        )}
      </AnimatePresence>
    </DatePickerContainer>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;