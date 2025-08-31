import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import FormField from '../molecules/FormField';
import TagSelector from '../molecules/TagSelector';
import inventoryService from '../../services/inventoryService';

const FormContainer = styled(motion.form)`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme?.spacing?.[6] || '1.5rem'};
  background: ${props => props.theme?.colors?.background?.elevated || '#ffffff'};
  border: 1px solid ${props => props.theme?.colors?.border?.default || '#e2e8f0'};
  border-radius: ${props => props.theme?.spacing?.[3] || '0.75rem'};
  padding: ${props => props.theme?.spacing?.[8] || '2rem'};
  
  @media (max-width: ${props => props.theme?.breakpoints?.md || '768px'}) {
    padding: ${props => props.theme?.spacing?.[6] || '1.5rem'};
    gap: ${props => props.theme?.spacing?.[4] || '1rem'};
  }
`;

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: ${props => props.theme?.spacing?.[4] || '1rem'};
  border-bottom: 1px solid ${props => props.theme?.colors?.border?.subtle || '#f1f5f9'};
`;

const FormTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[3] || '0.75rem'};
`;

const FormStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[2] || '0.5rem'};
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme?.spacing?.[4] || '1rem'};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  margin-bottom: ${props => props.theme?.spacing?.[2] || '0.5rem'};
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: ${props => props.theme?.spacing?.[1] || '0.25rem'};
  background: ${props => props.theme?.colors?.primary?.[100] || '#dbeafe'};
  color: ${props => props.theme?.colors?.primary?.[600] || '#2563eb'};
`;

const FieldGrid = styled.div.withConfig({
  shouldForwardProp: (prop) => !['columns'].includes(prop),
})`
  display: grid;
  gap: ${props => props.theme?.spacing?.[4] || '1rem'};
  
  ${props => props.columns === 2 && css`
    grid-template-columns: 1fr 1fr;
    
    @media (max-width: ${props.theme?.breakpoints?.md || '768px'}) {
      grid-template-columns: 1fr;
    }
  `}
  
  ${props => props.columns === 3 && css`
    grid-template-columns: repeat(3, 1fr);
    
    @media (max-width: ${props.theme?.breakpoints?.lg || '1024px'}) {
      grid-template-columns: 1fr 1fr;
    }
    
    @media (max-width: ${props.theme?.breakpoints?.md || '768px'}) {
      grid-template-columns: 1fr;
    }
  `}
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  
  ${props => props.span && css`
    grid-column: span ${props.span};
    
    @media (max-width: ${props.theme?.breakpoints?.md || '768px'}) {
      grid-column: span 1;
    }
  `}
`;

const FormActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme?.spacing?.[4] || '1rem'};
  padding-top: ${props => props.theme?.spacing?.[4] || '1rem'};
  border-top: 1px solid ${props => props.theme?.colors?.border?.subtle || '#f1f5f9'};
  
  @media (max-width: ${props => props.theme?.breakpoints?.sm || '640px'}) {
    flex-direction: column-reverse;
    align-items: stretch;
  }
`;

const ActionsLeft = styled.div`
  display: flex;
  gap: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  
  @media (max-width: ${props => props.theme?.breakpoints?.sm || '640px'}) {
    justify-content: center;
  }
`;

const ActionsRight = styled.div`
  display: flex;
  gap: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  
  @media (max-width: ${props => props.theme?.breakpoints?.sm || '640px'}) {
    justify-content: stretch;
    
    & > * {
      flex: 1;
    }
  }
`;

const ErrorSummary = styled(motion.div)`
  padding: ${props => props.theme?.spacing?.[4] || '1rem'};
  background: ${props => props.theme?.colors?.red?.[50] || '#fef2f2'};
  border: 1px solid ${props => props.theme?.colors?.red?.[200] || '#fecaca'};
  border-radius: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  margin-bottom: ${props => props.theme?.spacing?.[4] || '1rem'};
`;

const ErrorList = styled.ul`
  margin: ${props => props.theme?.spacing?.[2] || '0.5rem'} 0 0 ${props => props.theme?.spacing?.[4] || '1rem'};
  padding: 0;
  list-style: none;
  
  li {
    position: relative;
    padding-left: ${props => props.theme?.spacing?.[2] || '0.5rem'};
    margin-bottom: ${props => props.theme?.spacing?.[1] || '0.25rem'};
    
    &::before {
      content: '•';
      position: absolute;
      left: 0;
      color: ${props => props.theme?.colors?.red?.[600] || '#dc2626'};
    }
  }
`;

const ValidationIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => !['status'].includes(prop)
})`
  display: flex;
  align-items: center;
  color: ${props => getValidationColor(props.status, props.theme)};
`;

const ImageUploadSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme?.spacing?.[4] || '1rem'};
`;

const ImageUploadArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme?.spacing?.[4] || '1rem'};
  
  @media (min-width: ${props => props.theme?.breakpoints?.md || '768px'}) {
    flex-direction: row;
  }
`;

const DropZone = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['isDragActive', 'hasImages'].includes(prop)
})`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  padding: ${props => props.theme?.spacing?.[6] || '1.5rem'};
  border: 2px dashed ${props => props.isDragActive ? (props.theme?.colors?.primary?.[400] || '#60a5fa') : (props.theme?.colors?.border?.default || '#e2e8f0')};
  border-radius: ${props => props.theme?.spacing?.[3] || '0.75rem'};
  background: ${props => props.isDragActive ? (props.theme?.colors?.primary?.[50] || '#eff6ff') : (props.theme?.colors?.background?.subtle || '#f8fafc')};
  cursor: pointer;
  transition: all 0.2s ease;
  flex: ${props => props.hasImages ? '1' : '1'};
  
  &:hover {
    border-color: ${props => props.theme?.colors?.primary?.[400] || '#60a5fa'};
    background: ${props => props.theme?.colors?.primary?.[25] || '#eff6ff'};
  }
  
  @media (max-width: ${props => props.theme?.breakpoints?.md || '768px'}) {
    min-height: 180px;
    padding: ${props => props.theme?.spacing?.[4] || '1rem'};
  }
`;

const DropZoneIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: ${props => props.theme?.spacing?.[3] || '0.75rem'};
  background: ${props => props.theme?.colors?.primary?.[100] || '#dbeafe'};
  color: ${props => props.theme?.colors?.primary?.[600] || '#2563eb'};
  margin-bottom: ${props => props.theme?.spacing?.[4] || '1rem'};
`;

const DropZoneText = styled.div`
  text-align: center;
  max-width: 280px;
`;

const HiddenFileInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
`;

const ImagePreviewGrid = styled.div.withConfig({
  shouldForwardProp: (prop) => !['imageCount'].includes(prop)
})`
  display: grid;
  gap: ${props => props.theme?.spacing?.[3] || '0.75rem'};
  flex: 1;
  max-height: 400px;
  overflow-y: auto;
  
  ${props => {
    if (props.imageCount === 1) return 'grid-template-columns: 1fr;';
    if (props.imageCount === 2) return 'grid-template-columns: 1fr 1fr;';
    if (props.imageCount >= 3) return 'grid-template-columns: 1fr 1fr; grid-template-rows: auto auto;';
    return 'grid-template-columns: 1fr;';
  }}
  
  @media (max-width: ${props => props.theme?.breakpoints?.md || '768px'}) {
    grid-template-columns: 1fr;
    max-height: 300px;
  }
`;

const ImagePreviewCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['isPrimary'].includes(prop)
})`
  position: relative;
  border-radius: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  overflow: hidden;
  background: ${props => props.theme?.colors?.background?.elevated || '#ffffff'};
  border: 2px solid ${props => props.isPrimary ? (props.theme?.colors?.primary?.[400] || '#60a5fa') : (props.theme?.colors?.border?.default || '#e2e8f0')};
  aspect-ratio: 4/3;
  
  ${props => props.isPrimary && css`
    box-shadow: 0 0 0 2px ${props.theme?.colors?.primary?.[100] || '#dbeafe'};
  `}
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ImageOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    transparent 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${props => props.theme?.spacing?.[3] || '0.75rem'};
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${ImagePreviewCard}:hover & {
    opacity: 1;
  }
`;

const ImageActions = styled.div`
  display: flex;
  gap: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  align-self: flex-end;
`;

const ImageActionButton = styled(Button).withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop)
})`
  min-width: auto;
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: ${props => props.theme?.spacing?.[1] || '0.25rem'};
  
  &:hover {
    transform: scale(1.05);
  }
`;

const PrimaryBadge = styled(Badge)`
  position: absolute;
  top: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  left: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  z-index: 2;
`;

const ImageMetadata = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme?.spacing?.[1] || '0.25rem'};
  color: white;
`;

const UploadProgress = styled(motion.div)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0, 0, 0, 0.2);
  overflow: hidden;
`;

const ProgressBar = styled(motion.div)`
  height: 100%;
  background: ${props => props.theme?.colors?.primary?.[500] || '#3b82f6'};
  transform-origin: left;
`;

const UploadError = styled(motion.div)`
  padding: ${props => props.theme?.spacing?.[3] || '0.75rem'};
  background: ${props => props.theme?.colors?.red?.[50] || '#fef2f2'};
  border: 1px solid ${props => props.theme?.colors?.red?.[200] || '#fecaca'};
  border-radius: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[2] || '0.5rem'};
`;

const ImageSummary = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme?.spacing?.[3] || '0.75rem'};
  background: ${props => props.theme?.colors?.background?.subtle || '#f8fafc'};
  border-radius: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  border: 1px solid ${props => props.theme?.colors?.border?.subtle || '#f1f5f9'};
`;

const SummaryStats = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[4] || '1rem'};
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[1] || '0.25rem'};
`;

const BulkActions = styled.div`
  display: flex;
  gap: ${props => props.theme?.spacing?.[2] || '0.5rem'};
`;

const SizeLimit = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  padding: ${props => props.theme?.spacing?.[2] || '0.5rem'} ${props => props.theme?.spacing?.[3] || '0.75rem'};
  background: ${props => props.theme?.colors?.primary?.[50] || '#eff6ff'};
  border: 1px solid ${props => props.theme?.colors?.primary?.[200] || '#bfdbfe'};
  border-radius: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  margin-top: ${props => props.theme?.spacing?.[2] || '0.5rem'};
`;

const getValidationColor = (status, theme) => {
  switch (status) {
    case 'valid':
      return theme?.colors?.green?.[600] || '#16a34a';
    case 'invalid':
      return theme?.colors?.red?.[600] || '#dc2626';
    case 'warning':
      return theme?.colors?.yellow?.[600] || '#ca8a04';
    default:
      return theme?.colors?.text?.tertiary || '#9ca3af';
  }
};

// Validation rules
const validationRules = {
  required: (value, message = 'This field is required') => 
    value && value.toString().trim() ? null : message,
  
  minLength: (min, message) => (value) =>
    !value || value.length >= min ? null : message || `Must be at least ${min} characters`,
    
  maxLength: (max, message) => (value) =>
    !value || value.length <= max ? null : message || `Must be no more than ${max} characters`,
    
  email: (value, message = 'Please enter a valid email') =>
    !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : message,
    
  number: (value, message = 'Please enter a valid number') =>
    !value || !isNaN(Number(value)) ? null : message,
    
  positive: (value, message = 'Must be a positive number') =>
    !value || Number(value) > 0 ? null : message,
    
  min: (min, message) => (value) =>
    !value || Number(value) >= min ? null : message || `Must be at least ${min}`,
    
  max: (max, message) => (value) =>
    !value || Number(value) <= max ? null : message || `Must be no more than ${max}`,
    
  pattern: (regex, message) => (value) =>
    !value || regex.test(value) ? null : message,
};

// Image upload utilities
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 8;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const validateImageFile = (file) => {
  const errors = [];
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    errors.push(`File type ${file.type} not supported. Please use JPG, PNG, or WebP.`);
  }
  
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size ${formatFileSize(file.size)} exceeds maximum of ${formatFileSize(MAX_FILE_SIZE)}.`);
  }
  
  return errors;
};

const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          file,
          url: e.target.result,
          name: file.name,
          size: file.size,
          type: file.type,
          dimensions: {
            width: img.width,
            height: img.height
          },
          uploadProgress: 0,
          uploaded: false
        });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const simulateUpload = (imageObj) => {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        resolve({ ...imageObj, uploaded: true, uploadProgress: 100 });
      }
      imageObj.uploadProgress = progress;
    }, 200);
  });
};

const ProductForm = ({
  initialData = {},
  mode = 'create',
  onSubmit,
  onCancel,
  onDelete,
  loading = false,
  className,
  ...props
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    supplier: '',
    description: '',
    price: '',
    cost: '',
    minStock: '',
    maxStock: '',
    currentStock: '',
    reorderPoint: '',
    location: '',
    barcode: '',
    weight: '',
    dimensions: '',
    tags: '',
    status: 'active',
    unit: '',
    expirationDate: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  
  // Image upload state
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState([]);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const fileInputRef = useRef(null);
  
  // Categories and tags state
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Define field configurations
  const fieldConfigs = {
    name: {
      label: 'Product Name',
      type: 'text',
      required: true,
      rules: [
        validationRules.required,
        validationRules.minLength(2, 'Product name must be at least 2 characters'),
        validationRules.maxLength(100, 'Product name must be no more than 100 characters')
      ]
    },
    sku: {
      label: 'SKU',
      type: 'text',
      required: true,
      rules: [
        validationRules.required,
        validationRules.pattern(/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens')
      ]
    },
    category: {
      label: 'Category',
      type: 'select',
      required: true,
      options: availableCategories.map(cat => ({
        value: cat.id,
        label: cat.name,
        icon: cat.icon,
        color: cat.color
      })),
      rules: [validationRules.required],
      loading: categoriesLoading
    },
    supplier: {
      label: 'Supplier',
      type: 'text',
      rules: [validationRules.maxLength(100)]
    },
    description: {
      label: 'Description',
      type: 'textarea',
      rows: 3,
      rules: [validationRules.maxLength(500)]
    },
    price: {
      label: 'Selling Price',
      type: 'number',
      required: true,
      prefix: '$',
      step: '0.01',
      rules: [
        validationRules.required,
        validationRules.number,
        validationRules.positive
      ]
    },
    cost: {
      label: 'Cost Price',
      type: 'number',
      prefix: '$',
      step: '0.01',
      rules: [
        validationRules.number,
        validationRules.positive
      ]
    },
    currentStock: {
      label: 'Current Stock',
      type: 'number',
      required: true,
      rules: [
        validationRules.required,
        validationRules.number,
        validationRules.min(0)
      ]
    },
    minStock: {
      label: 'Minimum Stock',
      type: 'number',
      rules: [
        validationRules.number,
        validationRules.min(0)
      ]
    },
    maxStock: {
      label: 'Maximum Stock',
      type: 'number',
      rules: [
        validationRules.number,
        validationRules.min(0)
      ]
    },
    reorderPoint: {
      label: 'Reorder Point',
      type: 'number',
      rules: [
        validationRules.number,
        validationRules.min(0)
      ]
    },
    location: {
      label: 'Storage Location',
      type: 'text',
      rules: [validationRules.maxLength(50)]
    },
    barcode: {
      label: 'Barcode',
      type: 'text',
      rules: [
        validationRules.pattern(/^\d+$/, 'Barcode must contain only numbers')
      ]
    },
    weight: {
      label: 'Weight (kg)',
      type: 'number',
      step: '0.01',
      rules: [
        validationRules.number,
        validationRules.positive
      ]
    },
    dimensions: {
      label: 'Dimensions (L×W×H cm)',
      type: 'text',
      placeholder: 'e.g., 30×20×10',
      rules: [validationRules.maxLength(50)]
    },
    tags: {
      label: 'Tags',
      type: 'text',
      placeholder: 'Comma-separated tags',
      helperText: 'Separate tags with commas',
      rules: [validationRules.maxLength(200)]
    },
    status: {
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'discontinued', label: 'Discontinued' }
      ],
      rules: [validationRules.required]
    },
    unit: {
      label: 'Unit of Measurement',
      type: 'select',
      options: [
        { value: 'pcs', label: 'Pieces' },
        { value: 'kg', label: 'Kilograms' },
        { value: 'g', label: 'Grams' },
        { value: 'l', label: 'Liters' },
        { value: 'ml', label: 'Milliliters' },
        { value: 'm', label: 'Meters' },
        { value: 'cm', label: 'Centimeters' },
        { value: 'box', label: 'Boxes' },
        { value: 'pack', label: 'Packs' }
      ],
      rules: [validationRules.maxLength(20)]
    },
    expirationDate: {
      label: 'Expiration Date',
      type: 'date',
      helperText: 'Leave empty for non-perishable items',
      rules: []
    }
  };

  // Fetch categories and tags data
  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      setCategoriesLoading(true);
      try {
        const [categoriesData, tagsData] = await Promise.all([
          inventoryService.getCategories(),
          inventoryService.getTags()
        ]);
        setAvailableCategories(categoriesData);
        setAvailableTags(tagsData);
      } catch (error) {
        console.error('Failed to fetch categories and tags:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategoriesAndTags();
  }, []);

  // Initialize selected tags from initial data
  useEffect(() => {
    if (initialData.tags) {
      // Handle different tag formats (array of IDs, objects, or strings)
      const tags = Array.isArray(initialData.tags) 
        ? initialData.tags.map(tag => {
            if (typeof tag === 'string') {
              // Find tag by name or create a temporary one
              const foundTag = availableTags.find(t => t.name === tag || t.id === tag);
              return foundTag || { id: tag, name: tag, color: '#10b981', icon: 'tag' };
            }
            return tag;
          })
        : [];
      setSelectedTags(tags);
    }
  }, [initialData.tags, availableTags]);

  // Validate a single field
  const validateField = useCallback((name, value) => {
    const config = fieldConfigs[name];
    if (!config || !config.rules) return null;

    for (const rule of config.rules) {
      const error = rule(value);
      if (error) return error;
    }

    // Cross-field validation
    if (name === 'maxStock' && formData.minStock && Number(value) < Number(formData.minStock)) {
      return 'Maximum stock must be greater than minimum stock';
    }
    if (name === 'minStock' && formData.maxStock && Number(value) > Number(formData.maxStock)) {
      return 'Minimum stock must be less than maximum stock';
    }
    if (name === 'cost' && formData.price && Number(value) > Number(formData.price)) {
      return 'Cost price should typically be less than selling price';
    }

    return null;
  }, [formData]);

  // Validate entire form
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    Object.keys(fieldConfigs).forEach(name => {
      const error = validateField(name, formData[name]);
      if (error) {
        newErrors[name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  // Handle field changes
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    setIsDirty(true);

    // Validate field on change if it was previously touched
    if (touched[name] || errors[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  // Handle field blur
  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Build payload matching backend API schema exactly
    const processedData = {
      name: formData.name,
      quantity: formData.currentStock ? Number(formData.currentStock) : 0,
      price: formData.price ? Number(formData.price) : 0
    };
    
    // SKU is only allowed during creation, not updates
    if (mode === 'create') {
      processedData.sku = formData.sku;
    }
    
    // Add optional fields only if they have valid values
    if (formData.category && formData.category.trim()) {
      processedData.category = formData.category.trim();
    }
    
    if (formData.supplier && formData.supplier.trim()) {
      // Ensure supplier meets validation requirements (1-255 chars, string)
      const supplierValue = formData.supplier.trim();
      if (supplierValue.length >= 1 && supplierValue.length <= 255) {
        processedData.supplier = supplierValue;
      }
    } else {
      // Backend seems to require supplier field - provide minimal valid value
      processedData.supplier = "Unknown";
    }
    
    if (formData.description && formData.description.trim()) {
      processedData.description = formData.description.trim();
    }
    
    if (formData.cost) {
      processedData.cost = Number(formData.cost);
    }
    
    if (formData.unit && formData.unit.trim()) {
      processedData.unit = formData.unit.trim();
    }
    
    if (formData.location && formData.location.trim()) {
      processedData.location = formData.location.trim();
    }
    
    if (formData.barcode && formData.barcode.trim()) {
      processedData.barcode = formData.barcode.trim();
    }
    
    // Backend expects minThreshold instead of minStock (must be integer >= 0)
    if (formData.minStock) {
      const minThreshold = Math.max(0, Math.floor(Number(formData.minStock)));
      processedData.minThreshold = minThreshold;
    }
    
    // reorderPoint is only allowed during creation, not updates
    if (mode === 'create' && formData.reorderPoint) {
      processedData.reorderPoint = Number(formData.reorderPoint);
    }
    
    if (formData.weight) {
      processedData.weight = Number(formData.weight);
    }
    
    if (formData.dimensions && formData.dimensions.trim()) {
      processedData.dimensions = formData.dimensions.trim();
    }
    
    if (formData.expirationDate) {
      processedData.expirationDate = formData.expirationDate;
    }
    
    // Add selected tags
    if (selectedTags.length > 0) {
      processedData.tags = selectedTags.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        icon: tag.icon,
        isNew: tag.isNew || false
      }));
    }
    
    // Remove null values to avoid backend validation issues
    Object.keys(processedData).forEach(key => {
      if (processedData[key] === null || processedData[key] === '') {
        delete processedData[key];
      }
    });

    console.log('📦 ProductForm - Mode:', mode, '- Processed data being sent:', processedData);
    
    // Include images in submission
    if (images.length > 0) {
      processedData.images = images.map((img, index) => ({
        id: img.id,
        url: img.url,
        name: img.name,
        isPrimary: index === primaryImageIndex,
        size: img.size,
        type: img.type,
        dimensions: img.dimensions
      }));
    }
    
    onSubmit?.(processedData);
  };

  // Image upload handlers
  const handleFileSelect = async (files) => {
    const fileArray = Array.from(files);
    
    // Check total file count
    if (images.length + fileArray.length > MAX_FILES) {
      setUploadErrors(prev => [...prev, {
        id: Date.now(),
        message: `Maximum ${MAX_FILES} images allowed. You can upload ${MAX_FILES - images.length} more.`
      }]);
      return;
    }

    const validFiles = [];
    const newErrors = [];

    // Validate each file
    for (const file of fileArray) {
      const errors = validateImageFile(file);
      if (errors.length === 0) {
        validFiles.push(file);
      } else {
        newErrors.push({
          id: Date.now() + Math.random(),
          message: `${file.name}: ${errors.join(', ')}`
        });
      }
    }

    // Add validation errors
    if (newErrors.length > 0) {
      setUploadErrors(prev => [...prev, ...newErrors]);
    }

    // Process valid files
    if (validFiles.length > 0) {
      try {
        const imagePromises = validFiles.map(createImagePreview);
        const newImages = await Promise.all(imagePromises);
        
        setImages(prev => [...prev, ...newImages]);
        setUploadingImages(prev => [...prev, ...newImages.map(img => img.id)]);
        setIsDirty(true);

        // Simulate upload for each image
        newImages.forEach(async (imageObj) => {
          try {
            const uploadedImage = await simulateUpload(imageObj);
            setImages(prev => prev.map(img => 
              img.id === uploadedImage.id ? uploadedImage : img
            ));
            setUploadingImages(prev => prev.filter(id => id !== uploadedImage.id));
          } catch (error) {
            setUploadErrors(prev => [...prev, {
              id: Date.now() + Math.random(),
              message: `Failed to upload ${imageObj.name}: ${error.message}`
            }]);
            setUploadingImages(prev => prev.filter(id => id !== imageObj.id));
          }
        });
      } catch (error) {
        setUploadErrors(prev => [...prev, {
          id: Date.now(),
          message: `Failed to process images: ${error.message}`
        }]);
      }
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [images.length]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  const removeImage = (imageId) => {
    setImages(prev => {
      const newImages = prev.filter(img => img.id !== imageId);
      // Adjust primary index if needed
      if (primaryImageIndex >= newImages.length) {
        setPrimaryImageIndex(Math.max(0, newImages.length - 1));
      }
      return newImages;
    });
    setUploadingImages(prev => prev.filter(id => id !== imageId));
    setIsDirty(true);
  };

  const setPrimaryImage = (index) => {
    setPrimaryImageIndex(index);
    setIsDirty(true);
  };

  const removeAllImages = () => {
    setImages([]);
    setUploadingImages([]);
    setPrimaryImageIndex(0);
    setIsDirty(true);
  };

  const dismissError = (errorId) => {
    setUploadErrors(prev => prev.filter(error => error.id !== errorId));
  };

  // Calculate form status
  const hasErrors = Object.keys(errors).some(key => errors[key]);
  const hasRequiredFields = Object.keys(fieldConfigs)
    .filter(key => fieldConfigs[key].required)
    .every(key => formData[key] && formData[key].toString().trim());

  const formStatus = hasErrors ? 'invalid' : hasRequiredFields ? 'valid' : 'incomplete';

  const getStatusBadge = () => {
    switch (formStatus) {
      case 'valid':
        return <Badge variant="success" size="sm">Valid</Badge>;
      case 'invalid':
        return <Badge variant="error" size="sm">Has Errors</Badge>;
      default:
        return <Badge variant="secondary" size="sm">Incomplete</Badge>;
    }
  };

  // Get error summary
  const errorList = Object.keys(errors).filter(key => errors[key]).map(key => ({
    field: fieldConfigs[key]?.label || key,
    message: errors[key]
  }));

  return (
    <FormContainer
      onSubmit={handleSubmit}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      <FormHeader>
        <FormTitle>
          <Icon name={mode === 'create' ? 'plus' : 'edit'} size={24} />
          <Typography variant="h4" weight="semibold">
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </Typography>
        </FormTitle>
        
        <FormStatus>
          {getStatusBadge()}
          <ValidationIcon status={formStatus}>
            <Icon 
              name={formStatus === 'valid' ? 'checkCircle' : formStatus === 'invalid' ? 'error' : 'clock'} 
              size={20} 
            />
          </ValidationIcon>
        </FormStatus>
      </FormHeader>

      {errorList.length > 0 && (
        <ErrorSummary
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          <Typography variant="subtitle2" weight="medium" color="error">
            Please fix the following errors:
          </Typography>
          <ErrorList>
            {errorList.map(({ field, message }) => (
              <li key={field}>
                <Typography variant="body2" color="error">
                  <strong>{field}:</strong> {message}
                </Typography>
              </li>
            ))}
          </ErrorList>
        </ErrorSummary>
      )}

      {/* Basic Information */}
      <FormSection>
        <SectionHeader>
          <SectionIcon>
            <Icon name="info" size={16} />
          </SectionIcon>
          <Typography variant="h6" weight="medium">
            Basic Information
          </Typography>
        </SectionHeader>
        
        <FieldGrid columns={2}>
          <FormField
            {...fieldConfigs.name}
            name="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            error={errors.name}
          />
          <FormField
            {...fieldConfigs.sku}
            name="sku"
            value={formData.sku}
            onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
            onBlur={() => handleBlur('sku')}
            error={errors.sku}
          />
          <FormField
            {...fieldConfigs.category}
            name="category"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            onBlur={() => handleBlur('category')}
            error={errors.category}
          />
          <FormField
            {...fieldConfigs.supplier}
            name="supplier"
            value={formData.supplier}
            onChange={(e) => handleChange('supplier', e.target.value)}
            onBlur={() => handleBlur('supplier')}
            error={errors.supplier}
          />
          <FieldGroup span={2}>
            <FormField
              {...fieldConfigs.description}
              name="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              error={errors.description}
              showCharacterCount
              maxLength={500}
            />
          </FieldGroup>
        </FieldGrid>
      </FormSection>

      {/* Pricing */}
      <FormSection>
        <SectionHeader>
          <SectionIcon>
            <Icon name="trending" size={16} />
          </SectionIcon>
          <Typography variant="h6" weight="medium">
            Pricing
          </Typography>
        </SectionHeader>
        
        <FieldGrid columns={2}>
          <FormField
            {...fieldConfigs.price}
            name="price"
            value={formData.price}
            onChange={(e) => handleChange('price', e.target.value)}
            onBlur={() => handleBlur('price')}
            error={errors.price}
          />
          <FormField
            {...fieldConfigs.cost}
            name="cost"
            value={formData.cost}
            onChange={(e) => handleChange('cost', e.target.value)}
            onBlur={() => handleBlur('cost')}
            error={errors.cost}
          />
        </FieldGrid>
      </FormSection>

      {/* Inventory */}
      <FormSection>
        <SectionHeader>
          <SectionIcon>
            <Icon name="products" size={16} />
          </SectionIcon>
          <Typography variant="h6" weight="medium">
            Inventory Management
          </Typography>
        </SectionHeader>
        
        <FieldGrid columns={3}>
          <FormField
            {...fieldConfigs.currentStock}
            name="currentStock"
            value={formData.currentStock}
            onChange={(e) => handleChange('currentStock', e.target.value)}
            onBlur={() => handleBlur('currentStock')}
            error={errors.currentStock}
          />
          <FormField
            {...fieldConfigs.minStock}
            name="minStock"
            value={formData.minStock}
            onChange={(e) => handleChange('minStock', e.target.value)}
            onBlur={() => handleBlur('minStock')}
            error={errors.minStock}
          />
          <FormField
            {...fieldConfigs.maxStock}
            name="maxStock"
            value={formData.maxStock}
            onChange={(e) => handleChange('maxStock', e.target.value)}
            onBlur={() => handleBlur('maxStock')}
            error={errors.maxStock}
          />
          <FormField
            {...fieldConfigs.reorderPoint}
            name="reorderPoint"
            value={formData.reorderPoint}
            onChange={(e) => handleChange('reorderPoint', e.target.value)}
            onBlur={() => handleBlur('reorderPoint')}
            error={errors.reorderPoint}
          />
          <FormField
            {...fieldConfigs.location}
            name="location"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            onBlur={() => handleBlur('location')}
            error={errors.location}
          />
          <FormField
            {...fieldConfigs.status}
            name="status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            onBlur={() => handleBlur('status')}
            error={errors.status}
          />
        </FieldGrid>
      </FormSection>

      {/* Additional Details */}
      <FormSection>
        <SectionHeader>
          <SectionIcon>
            <Icon name="settings" size={16} />
          </SectionIcon>
          <Typography variant="h6" weight="medium">
            Additional Details
          </Typography>
        </SectionHeader>
        
        <FieldGrid columns={2}>
          <FormField
            {...fieldConfigs.barcode}
            name="barcode"
            value={formData.barcode}
            onChange={(e) => handleChange('barcode', e.target.value)}
            onBlur={() => handleBlur('barcode')}
            error={errors.barcode}
          />
          <FormField
            {...fieldConfigs.unit}
            name="unit"
            value={formData.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
            onBlur={() => handleBlur('unit')}
            error={errors.unit}
          />
          <FormField
            {...fieldConfigs.weight}
            name="weight"
            value={formData.weight}
            onChange={(e) => handleChange('weight', e.target.value)}
            onBlur={() => handleBlur('weight')}
            error={errors.weight}
          />
          <FormField
            {...fieldConfigs.expirationDate}
            name="expirationDate"
            value={formData.expirationDate}
            onChange={(e) => handleChange('expirationDate', e.target.value)}
            onBlur={() => handleBlur('expirationDate')}
            error={errors.expirationDate}
          />
          <FormField
            {...fieldConfigs.dimensions}
            name="dimensions"
            value={formData.dimensions}
            onChange={(e) => handleChange('dimensions', e.target.value)}
            onBlur={() => handleBlur('dimensions')}
            error={errors.dimensions}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Typography variant="subtitle2" weight="medium">
              Product Tags
            </Typography>
            <TagSelector
              availableTags={availableTags}
              selectedTags={selectedTags}
              onChange={setSelectedTags}
              placeholder="Search and add tags..."
              maxTags={10}
              allowCreate={true}
            />
            <Typography variant="caption" color="secondary">
              Add relevant tags to help categorize and find this product
            </Typography>
          </div>
        </FieldGrid>
      </FormSection>

      {/* Product Images */}
      <FormSection>
        <SectionHeader>
          <SectionIcon>
            <Icon name="image" size={16} />
          </SectionIcon>
          <Typography variant="h6" weight="medium">
            Product Images
          </Typography>
        </SectionHeader>
        
        <ImageUploadSection>
          {/* Upload Error Messages */}
          {uploadErrors.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {uploadErrors.map((error) => (
                <UploadError
                  key={error.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Icon name="error" size={16} color="red.600" />
                  <Typography variant="body2" color="error" style={{ flex: 1 }}>
                    {error.message}
                  </Typography>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => dismissError(error.id)}
                  >
                    <Icon name="x" size={14} />
                  </Button>
                </UploadError>
              ))}
            </div>
          )}

          {/* Image Summary */}
          {images.length > 0 && (
            <ImageSummary>
              <SummaryStats>
                <Stat>
                  <Icon name="image" size={16} />
                  <Typography variant="body2" weight="medium">
                    {images.length} / {MAX_FILES} images
                  </Typography>
                </Stat>
                <Stat>
                  <Icon name="database" size={16} />
                  <Typography variant="body2">
                    {formatFileSize(images.reduce((total, img) => total + img.size, 0))}
                  </Typography>
                </Stat>
                {images.length > 0 && (
                  <Stat>
                    <Icon name="star" size={16} />
                    <Typography variant="body2">
                      Primary: {images[primaryImageIndex]?.name || 'None'}
                    </Typography>
                  </Stat>
                )}
              </SummaryStats>
              <BulkActions>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={removeAllImages}
                  disabled={uploadingImages.length > 0}
                >
                  <Icon name="trash" size={14} />
                  Clear All
                </Button>
              </BulkActions>
            </ImageSummary>
          )}

          <ImageUploadArea>
            {/* Drop Zone */}
            <DropZone
              isDragActive={isDragActive}
              hasImages={images.length > 0}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleDropZoneClick}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <DropZoneIcon>
                <Icon name={isDragActive ? "upload" : "image"} size={32} />
              </DropZoneIcon>
              
              <DropZoneText>
                <Typography variant="subtitle1" weight="medium" align="center">
                  {isDragActive ? 'Drop images here' : 'Upload Product Images'}
                </Typography>
                <Typography variant="body2" color="secondary" align="center" style={{ marginTop: '8px' }}>
                  {images.length === 0 
                    ? `Drag & drop up to ${MAX_FILES} images, or click to browse`
                    : `Add ${MAX_FILES - images.length} more images`
                  }
                </Typography>
                <Typography variant="body2" color="tertiary" align="center" style={{ marginTop: '4px' }}>
                  JPG, PNG, WebP up to {formatFileSize(MAX_FILE_SIZE)} each
                </Typography>
              </DropZoneText>

              <HiddenFileInput
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_TYPES.join(',')}
                multiple
                onChange={handleFileInputChange}
                aria-label="Upload product images"
              />
            </DropZone>

            {/* Image Previews */}
            {images.length > 0 && (
              <ImagePreviewGrid imageCount={images.length}>
                {images.map((image, index) => (
                  <ImagePreviewCard
                    key={image.id}
                    isPrimary={index === primaryImageIndex}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {index === primaryImageIndex && (
                      <PrimaryBadge variant="primary" size="xs">
                        Primary
                      </PrimaryBadge>
                    )}

                    <PreviewImage
                      src={image.url}
                      alt={image.name}
                      loading="lazy"
                    />

                    <ImageOverlay>
                      <ImageMetadata>
                        <Typography variant="caption" weight="medium" style={{ color: 'white' }}>
                          {image.name}
                        </Typography>
                        <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.8)' }}>
                          {formatFileSize(image.size)} • {image.dimensions.width}×{image.dimensions.height}
                        </Typography>
                      </ImageMetadata>

                      <ImageActions>
                        {index !== primaryImageIndex && (
                          <ImageActionButton
                            variant="secondary"
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPrimaryImage(index);
                            }}
                            title="Set as primary image"
                          >
                            <Icon name="star" size={16} />
                          </ImageActionButton>
                        )}
                        <ImageActionButton
                          variant="danger"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(image.id);
                          }}
                          title="Remove image"
                        >
                          <Icon name="trash" size={16} />
                        </ImageActionButton>
                      </ImageActions>
                    </ImageOverlay>

                    {/* Upload Progress */}
                    {uploadingImages.includes(image.id) && (
                      <UploadProgress>
                        <ProgressBar
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: image.uploadProgress / 100 }}
                          transition={{ duration: 0.2 }}
                        />
                      </UploadProgress>
                    )}
                  </ImagePreviewCard>
                ))}
              </ImagePreviewGrid>
            )}
          </ImageUploadArea>

          <SizeLimit>
            <Icon name="info" size={16} />
            <Typography variant="body2">
              <strong>Image Guidelines:</strong> Use high-quality images (1200×1200px recommended). 
              The first image will be the primary product image shown in listings.
            </Typography>
          </SizeLimit>
        </ImageUploadSection>
      </FormSection>

      <FormActions>
        <ActionsLeft>
          {mode === 'edit' && onDelete && (
            <Button
              type="button"
              variant="danger"
              onClick={onDelete}
              disabled={loading}
            >
              <Icon name="delete" size={16} />
              Delete Product
            </Button>
          )}
        </ActionsLeft>

        <ActionsRight>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={hasErrors || !hasRequiredFields}
          >
            <Icon name="save" size={16} />
            {mode === 'create' ? 'Create Product' : 'Save Changes'}
          </Button>
        </ActionsRight>
      </FormActions>
    </FormContainer>
  );
};

export default ProductForm;