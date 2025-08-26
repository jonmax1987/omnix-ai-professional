// Core type definitions for OMNIX AI

// User & Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  preferences?: UserPreferences;
  createdAt: string;
  lastLogin: string;
}

export type UserRole = 'admin' | 'manager' | 'customer' | 'viewer';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'he';
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  alerts: {
    stockAlerts: boolean;
    priceChanges: boolean;
    orderReminders: boolean;
    systemUpdates: boolean;
  };
}

export interface DashboardPreferences {
  defaultView: 'grid' | 'list' | 'analytics';
  favoriteMetrics: string[];
  dateRange: DateRange;
  refreshInterval: number; // in seconds
}

// Product Types
export interface Product {
  id: string;
  name: string;
  nameHe?: string;
  description: string;
  descriptionHe?: string;
  sku: string;
  barcode?: string;
  category: ProductCategory;
  subCategory?: string;
  brand: string;
  supplier: string;
  price: number;
  cost: number;
  margin: number;
  currency: 'USD' | 'ILS' | 'EUR';
  unit: ProductUnit;
  stock: StockInfo;
  images: ProductImage[];
  tags: string[];
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface ProductCategory {
  id: string;
  name: string;
  nameHe?: string;
  parent?: string;
  icon?: string;
  color?: string;
  order: number;
}

export type ProductUnit = 'piece' | 'kg' | 'gram' | 'liter' | 'ml' | 'box' | 'pack';

export interface StockInfo {
  quantity: number;
  reserved: number;
  available: number;
  minimum: number;
  maximum: number;
  reorderPoint: number;
  reorderQuantity: number;
  location?: string;
  lastRestocked?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock' | 'discontinued' | 'seasonal';

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  paymentMethod?: PaymentMethod;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  metadata?: Record<string, any>;
}

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  notes?: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'partial' 
  | 'failed' 
  | 'refunded';

export type FulfillmentStatus = 
  | 'unfulfilled' 
  | 'partial' 
  | 'fulfilled' 
  | 'returned';

export type PaymentMethod = 
  | 'credit_card' 
  | 'debit_card' 
  | 'cash' 
  | 'bank_transfer' 
  | 'digital_wallet';

// Customer Types
export interface Customer {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  company?: string;
  addresses: Address[];
  segment?: CustomerSegment;
  profile?: CustomerProfile;
  tags: string[];
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface Address {
  id: string;
  type: 'billing' | 'shipping' | 'both';
  isPrimary: boolean;
  firstName?: string;
  lastName?: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface CustomerSegment {
  id: string;
  name: SegmentName;
  description: string;
  criteria: SegmentCriteria;
  confidence: number;
  assignedAt: string;
  previousSegment?: string;
}

export type SegmentName = 
  | 'Champions'
  | 'Loyal Customers'
  | 'Potential Loyalists'
  | 'New Customers'
  | 'At Risk'
  | "Can't Lose Them"
  | 'Hibernating'
  | 'Lost';

export interface SegmentCriteria {
  recency: number;
  frequency: number;
  monetaryValue: number;
  customRules?: any[];
}

export interface CustomerProfile {
  spendingPatterns: SpendingPatterns;
  behavioralInsights: BehavioralInsights;
  demographics: Demographics;
  consumptionPatterns?: ConsumptionPattern[];
  predictions?: CustomerPredictions;
}

export interface SpendingPatterns {
  averageOrderValue: number;
  preferredCategories: string[];
  shoppingFrequency: 'daily' | 'weekly' | 'monthly' | 'irregular';
  pricePreference: 'budget' | 'mid-range' | 'premium';
  seasonalTrends?: SeasonalTrend[];
}

export interface BehavioralInsights {
  plannedShopper: boolean;
  brandLoyal: boolean;
  seasonalShopper: boolean;
  bulkBuyer: boolean;
  promotionSensitive: boolean;
  earlyAdopter: boolean;
}

export interface Demographics {
  estimatedAgeGroup: string;
  estimatedIncomeLevel: string;
  familySize: number;
  lifestyle: string[];
  location?: string;
}

export interface ConsumptionPattern {
  productId: string;
  productName: string;
  category: string;
  averageDaysBetweenPurchases: number;
  predictedNextPurchaseDate: string;
  confidence: number;
  seasonalVariation?: boolean;
}

export interface CustomerPredictions {
  churnRisk: number;
  lifetimeValue: number;
  nextPurchaseDate?: string;
  recommendedProducts: string[];
  growthPotential: number;
}

export interface SeasonalTrend {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  averageSpend: number;
  topCategories: string[];
}

// Alert Types
export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  titleHe?: string;
  message: string;
  messageHe?: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  actionRequired: boolean;
  actions?: AlertAction[];
  metadata?: Record<string, any>;
}

export type AlertType = 
  | 'stock_low' 
  | 'stock_out' 
  | 'price_change' 
  | 'order_anomaly' 
  | 'customer_churn' 
  | 'system' 
  | 'performance' 
  | 'security';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AlertAction {
  id: string;
  label: string;
  labelHe?: string;
  type: 'primary' | 'secondary' | 'danger';
  action: string;
  params?: Record<string, any>;
}

// Analytics Types
export interface Metric {
  id: string;
  name: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'stable';
  unit?: string;
  icon?: string;
  color?: string;
  trend?: TrendData[];
  target?: number;
  comparison?: MetricComparison;
}

export interface TrendData {
  timestamp: string;
  value: number;
  label?: string;
}

export interface MetricComparison {
  period: 'day' | 'week' | 'month' | 'year';
  previousValue: number;
  percentageChange: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  options?: ChartOptions;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  pointRadius?: number;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip?: {
      enabled?: boolean;
      mode?: 'index' | 'point';
    };
  };
  scales?: {
    x?: ChartScale;
    y?: ChartScale;
  };
}

export interface ChartScale {
  display?: boolean;
  grid?: {
    display?: boolean;
    color?: string;
  };
  ticks?: {
    color?: string;
    font?: {
      size?: number;
      family?: string;
    };
  };
}

// WebSocket Types
export interface WebSocketMessage {
  id: string;
  type: WebSocketMessageType;
  channel?: string;
  data: any;
  timestamp: string;
  metadata?: Record<string, any>;
}

export type WebSocketMessageType = 
  | 'connection'
  | 'subscription'
  | 'unsubscription'
  | 'message'
  | 'notification'
  | 'alert'
  | 'update'
  | 'error'
  | 'ping'
  | 'pong';

export interface WebSocketOptions {
  url: string;
  protocols?: string[];
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  messageQueueSize?: number;
  debug?: boolean;
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path?: string;
  method?: string;
}

export interface ResponseMetadata {
  timestamp: string;
  requestId: string;
  version: string;
  pagination?: PaginationInfo;
  rateLimit?: RateLimitInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: string;
}

// Filter & Sort Types
export interface FilterOptions {
  search?: string;
  categories?: string[];
  tags?: string[];
  status?: string[];
  dateRange?: DateRange;
  priceRange?: PriceRange;
  customFilters?: Record<string, any>;
}

export interface DateRange {
  start: string;
  end: string;
  preset?: DatePreset;
}

export type DatePreset = 
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'custom';

export interface PriceRange {
  min: number;
  max: number;
  currency?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
  nullsFirst?: boolean;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  labelHe?: string;
  type: FormFieldType;
  value?: any;
  defaultValue?: any;
  placeholder?: string;
  placeholderHe?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
  multiple?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number;
  rows?: number;
  cols?: number;
  accept?: string;
  autoComplete?: string;
  helperText?: string;
  helperTextHe?: string;
  error?: string;
  errorHe?: string;
}

export type FormFieldType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'date'
  | 'time'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'textarea'
  | 'file'
  | 'color'
  | 'range';

export interface ValidationRule {
  type: ValidationType;
  value?: any;
  message: string;
  messageHe?: string;
}

export type ValidationType = 
  | 'required'
  | 'email'
  | 'url'
  | 'pattern'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'custom';

export interface SelectOption {
  value: string | number;
  label: string;
  labelHe?: string;
  disabled?: boolean;
  icon?: string;
  color?: string;
}

// Theme Types
export interface Theme {
  mode: 'light' | 'dark';
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borders: ThemeBorders;
  shadows: ThemeShadows;
  animation: ThemeAnimation;
  breakpoints: ThemeBreakpoints;
  zIndex: ThemeZIndex;
}

export interface ThemeColors {
  primary: ColorScale;
  secondary: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
  neutral: ColorScale;
  background: {
    default: string;
    paper: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
  divider: string;
  action: {
    active: string;
    hover: string;
    selected: string;
    disabled: string;
    disabledBackground: string;
  };
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  main: string;
  light: string;
  dark: string;
  contrastText: string;
}

export interface ThemeTypography {
  fontFamily: {
    base: string;
    heading: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  };
  fontWeight: {
    thin: number;
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
}

export interface ThemeBorders {
  radius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  width: {
    none: string;
    thin: string;
    medium: string;
    thick: string;
  };
}

export interface ThemeShadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export interface ThemeAnimation {
  duration: {
    instant: string;
    fast: string;
    standard: string;
    slow: string;
  };
  easing: {
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    sharp: string;
  };
}

export interface ThemeBreakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

export interface ThemeZIndex {
  drawer: number;
  modal: number;
  popover: number;
  tooltip: number;
  snackbar: number;
}