import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useRef, useEffect } from 'react';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Progress from '../atoms/Progress';
import Modal from '../atoms/Modal';
import AlertCard from '../molecules/AlertCard';
import DataTable from './DataTable';
import useProductsStore from '../../store/productsStore';
import { useI18n } from '../../hooks/useI18n';

const BatchManagerContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const BatchManagerHeader = styled.div`
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.blue[25]} 0%, 
    ${props => props.theme.colors.blue[50]} 100%);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[4]};
  flex-wrap: wrap;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const HeaderIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: ${props => props.theme.spacing[3]};
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.blue[500]} 0%, 
    ${props => props.theme.colors.blue[600]} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex-wrap: wrap;
`;

const ActionSection = styled.div`
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing[4]};
`;

const ActionCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'variant'
})`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => getActionColor(props.variant, props.theme)};
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
    border-color: ${props => getActionColor(props.variant, props.theme)};
  }
`;

const ActionIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'variant'
})`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => getActionColor(props.variant, props.theme)}20;
  color: ${props => getActionColor(props.variant, props.theme)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const FileInputWrapper = styled.div`
  position: relative;
  overflow: hidden;
`;

const FileInput = styled.input`
  position: absolute;
  left: -9999px;
  opacity: 0;
`;

const DropZone = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['isDragOver', 'hasError'].includes(prop)
})`
  border: 2px dashed ${props => props.isDragOver ? props.theme.colors.blue[400] : 
    props.hasError ? props.theme.colors.red[300] : props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[8]};
  text-align: center;
  background: ${props => props.isDragOver ? props.theme.colors.blue[25] : 
    props.hasError ? props.theme.colors.red[25] : props.theme.colors.background.secondary};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: ${props => props.theme.colors.blue[400]};
    background: ${props => props.theme.colors.blue[25]};
  }
`;

const ProcessingSection = styled.div`
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
`;

const ProcessingCard = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
`;

const ProcessingHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing[3]};
  margin: ${props => props.theme.spacing[4]} 0;
`;

const StatItem = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary[600]};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ErrorList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-top: ${props => props.theme.spacing[4]};
`;

const ErrorItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.red[25]};
  border: 1px solid ${props => props.theme.colors.red[200]};
  border-radius: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const PreviewSection = styled.div`
  padding: ${props => props.theme.spacing[6]};
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

// Utility functions
const getActionColor = (variant, theme) => {
  const colors = {
    import: theme.colors?.blue?.[500] || '#3B82F6',
    export: theme.colors?.green?.[500] || '#10B981',
    template: theme.colors?.purple?.[500] || '#8B5CF6',
    bulk: theme.colors?.orange?.[500] || '#F97316'
  };
  return colors[variant] || colors.import;
};

const BatchProductManager = ({
  onImportComplete,
  onExportComplete,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [activeOperation, setActiveOperation] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processResults, setProcessResults] = useState(null);
  const [errors, setErrors] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Store connections
  const { products, fetchProducts, createProduct, updateProductAsync } = useProductsStore();

  // Sample template data structure
  const templateFields = [
    'name', 'sku', 'description', 'category', 'price', 'cost', 'quantity',
    'minThreshold', 'maxThreshold', 'supplier', 'barcode', 'unit', 
    'expirationDate', 'location', 'tags', 'status'
  ];

  // File format validation
  const validateFileFormat = useCallback((file) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json'
    ];
    
    const allowedExtensions = ['.csv', '.xlsx', '.xls', '.json'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    return allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
  }, []);

  // Parse CSV content
  const parseCSV = useCallback((content) => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV file must have header and at least one data row');
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length !== headers.length) continue;
      
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }
    
    return data;
  }, []);

  // Parse JSON content
  const parseJSON = useCallback((content) => {
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [data];
  }, []);

  // Validate product data
  const validateProductData = useCallback((data) => {
    const errors = [];
    const requiredFields = ['name', 'sku', 'price'];
    
    data.forEach((item, index) => {
      requiredFields.forEach(field => {
        if (!item[field] || item[field].toString().trim() === '') {
          errors.push({
            row: index + 1,
            field,
            message: `Missing required field: ${field}`,
            data: item
          });
        }
      });
      
      // Validate numeric fields
      if (item.price && isNaN(parseFloat(item.price))) {
        errors.push({
          row: index + 1,
          field: 'price',
          message: 'Price must be a valid number',
          data: item
        });
      }
      
      if (item.quantity && isNaN(parseInt(item.quantity))) {
        errors.push({
          row: index + 1,
          field: 'quantity',
          message: 'Quantity must be a valid integer',
          data: item
        });
      }
    });
    
    return errors;
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (file) => {
    if (!validateFileFormat(file)) {
      setErrors([{ message: 'Invalid file format. Please upload CSV, Excel, or JSON files only.' }]);
      return;
    }

    setUploadedFile(file);
    setErrors([]);
    setProcessing(true);

    try {
      const content = await file.text();
      let parsedData;

      if (file.name.endsWith('.json')) {
        parsedData = parseJSON(content);
      } else {
        parsedData = parseCSV(content);
      }

      const validationErrors = validateProductData(parsedData);
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
      }

      setPreviewData(parsedData);
      setActiveOperation('import-preview');
    } catch (error) {
      setErrors([{ message: `Failed to parse file: ${error.message}` }]);
    } finally {
      setProcessing(false);
    }
  }, [validateFileFormat, parseCSV, parseJSON, validateProductData]);

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  // Process import
  const processImport = useCallback(async () => {
    if (!previewData.length) return;

    setProcessing(true);
    const results = {
      total: previewData.length,
      successful: 0,
      failed: 0,
      errors: []
    };

    try {
      for (const item of previewData) {
        try {
          await createProduct({
            name: item.name,
            sku: item.sku,
            description: item.description || '',
            category: item.category || 'general',
            price: parseFloat(item.price) || 0,
            cost: parseFloat(item.cost) || 0,
            quantity: parseInt(item.quantity) || 0,
            minThreshold: parseInt(item.minThreshold) || 10,
            maxThreshold: parseInt(item.maxThreshold) || 100,
            supplier: item.supplier || '',
            barcode: item.barcode || '',
            unit: item.unit || 'units',
            expirationDate: item.expirationDate || null,
            location: item.location || '',
            tags: item.tags ? item.tags.split(';').map(tag => tag.trim()) : [],
            status: item.status || 'active'
          });
          results.successful++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            product: item.name || item.sku,
            error: error.message
          });
        }
      }

      setProcessResults(results);
      
      // Refresh products list
      await fetchProducts();
      
      // Call completion callback
      onImportComplete?.(results);
      
    } catch (error) {
      setErrors([{ message: `Import failed: ${error.message}` }]);
    } finally {
      setProcessing(false);
      setActiveOperation('import-results');
    }
  }, [previewData, createProduct, fetchProducts, onImportComplete]);

  // Export products
  const exportProducts = useCallback(async (format = 'csv') => {
    setProcessing(true);
    
    try {
      let content;
      let filename;
      let mimeType;

      if (format === 'csv') {
        const headers = templateFields.join(',');
        const rows = products.map(product => 
          templateFields.map(field => {
            const value = product[field];
            if (Array.isArray(value)) {
              return value.join(';');
            }
            return value || '';
          }).join(',')
        );
        
        content = [headers, ...rows].join('\n');
        filename = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else if (format === 'json') {
        content = JSON.stringify(products, null, 2);
        filename = `products_export_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onExportComplete?.({
        format,
        filename,
        recordCount: products.length
      });
      
    } catch (error) {
      setErrors([{ message: `Export failed: ${error.message}` }]);
    } finally {
      setProcessing(false);
    }
  }, [products, templateFields, onExportComplete]);

  // Download template
  const downloadTemplate = useCallback((format = 'csv') => {
    let content;
    let filename;
    let mimeType;

    if (format === 'csv') {
      const headers = templateFields.join(',');
      const sampleRow = [
        'Sample Product Name',
        'SAMPLE-001',
        'Sample product description',
        'electronics',
        '99.99',
        '75.00',
        '50',
        '10',
        '100',
        'Sample Supplier Co.',
        '1234567890123',
        'units',
        '2024-12-31',
        'Warehouse A',
        'tag1;tag2;tag3',
        'active'
      ].join(',');
      
      content = [headers, sampleRow].join('\n');
      filename = `product_import_template.csv`;
      mimeType = 'text/csv';
    } else if (format === 'json') {
      const sampleData = {
        name: 'Sample Product Name',
        sku: 'SAMPLE-001',
        description: 'Sample product description',
        category: 'electronics',
        price: '99.99',
        cost: '75.00',
        quantity: '50',
        minThreshold: '10',
        maxThreshold: '100',
        supplier: 'Sample Supplier Co.',
        barcode: '1234567890123',
        unit: 'units',
        expirationDate: '2024-12-31',
        location: 'Warehouse A',
        tags: 'tag1;tag2;tag3',
        status: 'active'
      };
      
      content = JSON.stringify([sampleData], null, 2);
      filename = `product_import_template.json`;
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [templateFields]);

  // Table columns for preview
  const previewColumns = [
    {
      key: 'name',
      header: 'Product Name',
      render: (value) => (
        <Typography variant="body2" weight="medium">
          {value}
        </Typography>
      )
    },
    {
      key: 'sku',
      header: 'SKU',
      render: (value) => (
        <Typography variant="body2" style={{ fontFamily: 'monospace' }}>
          {value}
        </Typography>
      )
    },
    {
      key: 'category',
      header: 'Category',
      render: (value) => (
        <Badge variant="secondary" size="sm">
          {value || 'General'}
        </Badge>
      )
    },
    {
      key: 'price',
      header: 'Price',
      render: (value) => (
        <Typography variant="body2" weight="medium">
          ₪{parseFloat(value || 0).toFixed(2)}
        </Typography>
      )
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (value) => (
        <Typography variant="body2">
          {parseInt(value || 0).toLocaleString()}
        </Typography>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge 
          variant={value === 'active' ? 'success' : 'secondary'} 
          size="sm"
        >
          {value || 'Active'}
        </Badge>
      )
    }
  ];

  const renderActionCards = () => (
    <ActionGrid>
      <ActionCard
        variant="import"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
        onClick={() => setActiveOperation('import')}
      >
        <ActionIcon variant="import">
          <Icon name="upload" size={24} />
        </ActionIcon>
        <Typography variant="h6" weight="semibold" style={{ marginBottom: '8px' }}>
          Import Products
        </Typography>
        <Typography variant="body2" color="secondary" style={{ marginBottom: '16px' }}>
          Upload CSV, Excel, or JSON files to add multiple products at once
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant="info" size="xs">CSV</Badge>
          <Badge variant="info" size="xs">Excel</Badge>
          <Badge variant="info" size="xs">JSON</Badge>
        </div>
      </ActionCard>

      <ActionCard
        variant="export"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
        onClick={() => setActiveOperation('export')}
      >
        <ActionIcon variant="export">
          <Icon name="download" size={24} />
        </ActionIcon>
        <Typography variant="h6" weight="semibold" style={{ marginBottom: '8px' }}>
          Export Products
        </Typography>
        <Typography variant="body2" color="secondary" style={{ marginBottom: '16px' }}>
          Download your product catalog in various formats for backup or analysis
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="caption" color="tertiary">
            {products.length} products ready
          </Typography>
        </div>
      </ActionCard>

      <ActionCard
        variant="template"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
        onClick={() => setActiveOperation('template')}
      >
        <ActionIcon variant="template">
          <Icon name="file-text" size={24} />
        </ActionIcon>
        <Typography variant="h6" weight="semibold" style={{ marginBottom: '8px' }}>
          Download Template
        </Typography>
        <Typography variant="body2" color="secondary" style={{ marginBottom: '16px' }}>
          Get a formatted template with sample data to ensure proper import format
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="info" size={14} />
          <Typography variant="caption" color="tertiary">
            Includes field guide
          </Typography>
        </div>
      </ActionCard>

      <ActionCard
        variant="bulk"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
        onClick={() => setActiveOperation('bulk-edit')}
      >
        <ActionIcon variant="bulk">
          <Icon name="edit-3" size={24} />
        </ActionIcon>
        <Typography variant="h6" weight="semibold" style={{ marginBottom: '8px' }}>
          Bulk Operations
        </Typography>
        <Typography variant="body2" color="secondary" style={{ marginBottom: '16px' }}>
          Perform bulk updates on multiple products simultaneously
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="caption" color="tertiary">
            Price, category, status
          </Typography>
        </div>
      </ActionCard>
    </ActionGrid>
  );

  const renderImportSection = () => (
    <ProcessingSection>
      <ProcessingCard>
        <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
          Import Products from File
        </Typography>
        
        <DropZone
          isDragOver={isDragOver}
          hasError={errors.length > 0}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <FileInputWrapper>
            <FileInput
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              onChange={(e) => {
                if (e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
          </FileInputWrapper>
          
          <Icon name="upload-cloud" size={48} style={{ marginBottom: '16px', opacity: 0.6 }} />
          <Typography variant="h6" style={{ marginBottom: '8px' }}>
            Drag & drop your file here
          </Typography>
          <Typography variant="body2" color="secondary" style={{ marginBottom: '16px' }}>
            Or click to browse files
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <Badge variant="outline" size="sm">CSV</Badge>
            <Badge variant="outline" size="sm">Excel</Badge>
            <Badge variant="outline" size="sm">JSON</Badge>
          </div>
        </DropZone>

        {errors.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <AlertCard 
              variant="error" 
              title="Import Errors"
              description={`Found ${errors.length} error(s) in the uploaded file:`}
            />
            <ErrorList>
              {errors.slice(0, 10).map((error, index) => (
                <ErrorItem key={index}>
                  <Icon name="alert-circle" size={16} color={theme => theme.colors.red[500]} />
                  <div style={{ flex: 1 }}>
                    <Typography variant="body2" weight="medium">
                      {error.row && `Row ${error.row}: `}{error.message}
                    </Typography>
                    {error.field && (
                      <Typography variant="caption" color="secondary">
                        Field: {error.field}
                      </Typography>
                    )}
                  </div>
                </ErrorItem>
              ))}
              {errors.length > 10 && (
                <Typography variant="caption" color="secondary" style={{ textAlign: 'center', padding: '8px' }}>
                  ... and {errors.length - 10} more errors
                </Typography>
              )}
            </ErrorList>
          </div>
        )}
      </ProcessingCard>
    </ProcessingSection>
  );

  const renderExportSection = () => (
    <ProcessingSection>
      <ProcessingCard>
        <ProcessingHeader>
          <Typography variant="h6" weight="semibold">
            Export Product Catalog
          </Typography>
          <Typography variant="body2" color="secondary">
            {products.length} products ready for export
          </Typography>
        </ProcessingHeader>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            onClick={() => exportProducts('csv')}
            disabled={processing || products.length === 0}
          >
            <Icon name="file-text" size={16} />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => exportProducts('json')}
            disabled={processing || products.length === 0}
          >
            <Icon name="code" size={16} />
            Export JSON
          </Button>
        </div>

        <Typography variant="body2" color="secondary" style={{ marginTop: '16px' }}>
          CSV format is recommended for Excel compatibility. JSON format preserves all data types and nested structures.
        </Typography>
      </ProcessingCard>
    </ProcessingSection>
  );

  const renderTemplateSection = () => (
    <ProcessingSection>
      <ProcessingCard>
        <ProcessingHeader>
          <Typography variant="h6" weight="semibold">
            Import Templates
          </Typography>
          <Typography variant="body2" color="secondary">
            Download formatted templates with sample data
          </Typography>
        </ProcessingHeader>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            onClick={() => downloadTemplate('csv')}
          >
            <Icon name="file-text" size={16} />
            CSV Template
          </Button>
          <Button
            variant="outline"
            onClick={() => downloadTemplate('json')}
          >
            <Icon name="code" size={16} />
            JSON Template
          </Button>
        </div>

        <div style={{ marginTop: '24px' }}>
          <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
            Required Fields:
          </Typography>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Badge variant="error" size="sm">name</Badge>
            <Badge variant="error" size="sm">sku</Badge>
            <Badge variant="error" size="sm">price</Badge>
          </div>

          <Typography variant="body2" weight="medium" style={{ margin: '16px 0 8px' }}>
            Optional Fields:
          </Typography>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {templateFields.filter(field => !['name', 'sku', 'price'].includes(field)).map(field => (
              <Badge key={field} variant="secondary" size="xs">{field}</Badge>
            ))}
          </div>
        </div>
      </ProcessingCard>
    </ProcessingSection>
  );

  const renderPreviewSection = () => (
    <PreviewSection>
      <PreviewHeader>
        <div>
          <Typography variant="h6" weight="semibold">
            Import Preview
          </Typography>
          <Typography variant="body2" color="secondary">
            Review {previewData.length} products before importing
          </Typography>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="outline"
            onClick={() => setActiveOperation(null)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={processImport}
            disabled={processing || errors.length > 0}
            loading={processing}
          >
            <Icon name="check" size={16} />
            Import {previewData.length} Products
          </Button>
        </div>
      </PreviewHeader>

      <DataTable
        data={previewData.slice(0, 100)} // Preview first 100 rows
        columns={previewColumns}
        pagination
        pageSize={10}
        searchable
        searchPlaceholder="Search preview data..."
        emptyStateTitle="No preview data"
        emptyStateDescription="Upload a valid file to see preview"
      />

      {previewData.length > 100 && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <Typography variant="body2" color="secondary">
            Showing first 100 products. Total: {previewData.length} products will be imported.
          </Typography>
        </div>
      )}
    </PreviewSection>
  );

  const renderResultsSection = () => (
    <ProcessingSection>
      <ProcessingCard>
        <ProcessingHeader>
          <Typography variant="h6" weight="semibold">
            Import Results
          </Typography>
          {processResults && (
            <Badge 
              variant={processResults.failed === 0 ? 'success' : 'warning'} 
              size="lg"
            >
              {processResults.successful}/{processResults.total} Successful
            </Badge>
          )}
        </ProcessingHeader>

        {processResults && (
          <StatsGrid>
            <StatItem>
              <StatValue>{processResults.total}</StatValue>
              <StatLabel>Total</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue style={{ color: getActionColor('export', props.theme) }}>
                {processResults.successful}
              </StatValue>
              <StatLabel>Successful</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue style={{ color: processResults.failed > 0 ? props.theme?.colors?.red?.[500] : undefined }}>
                {processResults.failed}
              </StatValue>
              <StatLabel>Failed</StatLabel>
            </StatItem>
          </StatsGrid>
        )}

        {processResults?.errors?.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <AlertCard 
              variant="warning" 
              title="Some Products Failed to Import"
              description={`${processResults.errors.length} products encountered errors:`}
            />
            <ErrorList>
              {processResults.errors.slice(0, 5).map((error, index) => (
                <ErrorItem key={index}>
                  <Icon name="alert-triangle" size={16} color={theme => theme.colors.yellow[500]} />
                  <div style={{ flex: 1 }}>
                    <Typography variant="body2" weight="medium">
                      {error.product}
                    </Typography>
                    <Typography variant="caption" color="secondary">
                      {error.error}
                    </Typography>
                  </div>
                </ErrorItem>
              ))}
              {processResults.errors.length > 5 && (
                <Typography variant="caption" color="secondary" style={{ textAlign: 'center', padding: '8px' }}>
                  ... and {processResults.errors.length - 5} more errors
                </Typography>
              )}
            </ErrorList>
          </div>
        )}

        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <Button
            variant="primary"
            onClick={() => {
              setActiveOperation(null);
              setUploadedFile(null);
              setPreviewData([]);
              setProcessResults(null);
              setErrors([]);
            }}
          >
            Start New Import
          </Button>
          <Button
            variant="outline"
            onClick={() => fetchProducts()}
          >
            <Icon name="refresh" size={16} />
            Refresh Products
          </Button>
        </div>
      </ProcessingCard>
    </ProcessingSection>
  );

  return (
    <BatchManagerContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      {/* Header */}
      <BatchManagerHeader>
        <HeaderContent>
          <HeaderLeft>
            <HeaderIcon>
              <Icon name="layers" size={28} />
            </HeaderIcon>
            <div>
              <Typography variant="h4" weight="bold">
                Batch Product Manager
              </Typography>
              <Typography variant="body2" color="secondary">
                Import, export, and manage products in bulk with advanced validation
              </Typography>
            </div>
          </HeaderLeft>
          <HeaderActions>
            <Badge variant="info" size="lg">
              {products.length} products
            </Badge>
            {activeOperation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveOperation(null)}
              >
                <Icon name="x" size={16} />
                Close
              </Button>
            )}
          </HeaderActions>
        </HeaderContent>
      </BatchManagerHeader>

      {/* Action Cards */}
      {!activeOperation && (
        <ActionSection>
          {renderActionCards()}
        </ActionSection>
      )}

      {/* Dynamic Sections */}
      <AnimatePresence mode="wait">
        {activeOperation === 'import' && (
          <motion.div
            key="import"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderImportSection()}
          </motion.div>
        )}

        {activeOperation === 'export' && (
          <motion.div
            key="export"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderExportSection()}
          </motion.div>
        )}

        {activeOperation === 'template' && (
          <motion.div
            key="template"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTemplateSection()}
          </motion.div>
        )}

        {activeOperation === 'import-preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderPreviewSection()}
          </motion.div>
        )}

        {activeOperation === 'import-results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderResultsSection()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Overlay */}
      <AnimatePresence>
        {processing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <div style={{
              background: props.theme?.colors?.background?.elevated || 'white',
              padding: '24px',
              borderRadius: '12px',
              textAlign: 'center',
              minWidth: '200px'
            }}>
              <Icon name="loader" size={32} className="animate-spin" style={{ marginBottom: '16px' }} />
              <Typography variant="h6">
                Processing...
              </Typography>
              <Typography variant="body2" color="secondary">
                Please wait while we process your request
              </Typography>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </BatchManagerContainer>
  );
};

export default BatchProductManager;