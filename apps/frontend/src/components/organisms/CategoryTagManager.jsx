import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import FormField from '../molecules/FormField';
import Modal from '../atoms/Modal';
import inventoryService from '../../services/inventoryService';

const ManagerContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[6]};
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const TabSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const TabButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  border-bottom: 2px solid ${props => props.theme.colors.border.subtle};
  padding-bottom: ${props => props.theme.spacing[2]};
`;

const TabButton = styled(Button).withConfig({
  shouldForwardProp: (prop) => !['active'].includes(prop)
})`
  border-bottom: 2px solid transparent;
  border-radius: 0;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  
  ${props => props.active && css`
    background: transparent;
    color: ${props.theme.colors.primary[600]};
    border-bottom-color: ${props.theme.colors.primary[500]};
    font-weight: 600;
    
    &:hover {
      background: ${props.theme.colors.primary[25]};
    }
  `}
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
  min-height: 500px;
`;

const SearchSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  flex-wrap: wrap;
`;

const ItemsGrid = styled.div.withConfig({
  shouldForwardProp: (prop) => !['columns'].includes(prop)
})`
  display: grid;
  gap: ${props => props.theme.spacing[4]};
  
  ${props => props.columns === 1 && css`
    grid-template-columns: 1fr;
  `}
  
  ${props => props.columns === 2 && css`
    grid-template-columns: repeat(2, 1fr);
    
    @media (max-width: ${props.theme.breakpoints.md}) {
      grid-template-columns: 1fr;
    }
  `}
  
  ${props => props.columns === 3 && css`
    grid-template-columns: repeat(3, 1fr);
    
    @media (max-width: ${props.theme.breakpoints.lg}) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: ${props.theme.breakpoints.md}) {
      grid-template-columns: 1fr;
    }
  `}
`;

const ItemCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['itemType'].includes(prop)
})`
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary[300]};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  
  ${props => props.itemType === 'category' && css`
    border-left: 4px solid ${props.theme.colors.primary[500]};
  `}
  
  ${props => props.itemType === 'tag' && css`
    border-left: 4px solid ${props.theme.colors.green[500]};
  `}
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
  flex: 1;
`;

const ItemActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${ItemCard}:hover & {
    opacity: 1;
  }
`;

const ItemStats = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[4]};
  margin-top: ${props => props.theme.spacing[3]};
  padding-top: ${props => props.theme.spacing[3]};
  border-top: 1px solid ${props => props.theme.colors.border.subtle};
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[12]} ${props => props.theme.spacing[6]};
  text-align: center;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[12]} ${props => props.theme.spacing[6]};
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[2]};
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing[3]};
  padding-top: ${props => props.theme.spacing[4]};
  border-top: 1px solid ${props => props.theme.colors.border.subtle};
`;

const CategoryTagManager = ({
  onCategoryCreate,
  onCategoryEdit,
  onCategoryDelete,
  onTagCreate,
  onTagEdit,
  onTagDelete,
  className,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  
  // Modal states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: '#0ea5e9',
    icon: 'folder',
    parentId: null
  });
  
  const [tagForm, setTagForm] = useState({
    name: '',
    description: '',
    color: '#22c55e',
    icon: 'tag'
  });

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [categoriesData, tagsData] = await Promise.all([
        inventoryService.getCategories(),
        inventoryService.getTags()
      ]);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter items based on search
  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const filteredTags = useMemo(() => {
    return tags.filter(tag =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tags, searchTerm]);

  // Category handlers
  const handleCreateCategory = () => {
    setCategoryForm({
      name: '',
      description: '',
      color: '#0ea5e9',
      icon: 'folder',
      parentId: null
    });
    setEditingItem(null);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category) => {
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      color: category.color || '#0ea5e9',
      icon: category.icon || 'folder',
      parentId: category.parentId || null
    });
    setEditingItem(category);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (category) => {
    if (window.confirm(`Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`)) {
      setFormLoading(true);
      try {
        await inventoryService.deleteCategory(category.id);
        setCategories(prev => prev.filter(c => c.id !== category.id));
        onCategoryDelete?.(category);
      } catch (error) {
        setError(error.message);
      } finally {
        setFormLoading(false);
      }
    }
  };

  const handleCategoryFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingItem) {
        const updatedCategory = await inventoryService.updateCategory(editingItem.id, categoryForm);
        setCategories(prev => prev.map(c => c.id === editingItem.id ? updatedCategory : c));
        onCategoryEdit?.(updatedCategory);
      } else {
        const newCategory = await inventoryService.createCategory(categoryForm);
        setCategories(prev => [newCategory, ...prev]);
        onCategoryCreate?.(newCategory);
      }
      setShowCategoryForm(false);
      setEditingItem(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Tag handlers
  const handleCreateTag = () => {
    setTagForm({
      name: '',
      description: '',
      color: '#22c55e',
      icon: 'tag'
    });
    setEditingItem(null);
    setShowTagForm(true);
  };

  const handleEditTag = (tag) => {
    setTagForm({
      name: tag.name,
      description: tag.description || '',
      color: tag.color || '#22c55e',
      icon: tag.icon || 'tag'
    });
    setEditingItem(tag);
    setShowTagForm(true);
  };

  const handleDeleteTag = async (tag) => {
    if (window.confirm(`Are you sure you want to delete the tag "${tag.name}"? This action cannot be undone.`)) {
      setFormLoading(true);
      try {
        await inventoryService.deleteTag(tag.id);
        setTags(prev => prev.filter(t => t.id !== tag.id));
        onTagDelete?.(tag);
      } catch (error) {
        setError(error.message);
      } finally {
        setFormLoading(false);
      }
    }
  };

  const handleTagFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingItem) {
        const updatedTag = await inventoryService.updateTag(editingItem.id, tagForm);
        setTags(prev => prev.map(t => t.id === editingItem.id ? updatedTag : t));
        onTagEdit?.(updatedTag);
      } else {
        const newTag = await inventoryService.createTag(tagForm);
        setTags(prev => [newTag, ...prev]);
        onTagCreate?.(newTag);
      }
      setShowTagForm(false);
      setEditingItem(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowCategoryForm(false);
    setShowTagForm(false);
    setEditingItem(null);
    setFormLoading(false);
  };

  // Render category item
  const renderCategoryItem = (category) => (
    <ItemCard
      key={category.id}
      itemType="category"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <ItemHeader>
        <ItemInfo>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon 
              name={category.icon || 'folder'} 
              size={20} 
              style={{ color: category.color || '#0ea5e9' }} 
            />
            <Typography variant="h6" weight="semibold">
              {category.name}
            </Typography>
          </div>
          {category.description && (
            <Typography variant="body2" color="secondary">
              {category.description}
            </Typography>
          )}
        </ItemInfo>
        <ItemActions>
          <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
            <Icon name="edit" size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleDeleteCategory(category)}
            disabled={formLoading}
          >
            <Icon name="trash" size={14} />
          </Button>
        </ItemActions>
      </ItemHeader>
      
      <ItemStats>
        <StatItem>
          <Icon name="products" size={14} />
          <Typography variant="caption">
            {category.productCount || 0} products
          </Typography>
        </StatItem>
        {category.parentCategory && (
          <StatItem>
            <Icon name="arrow-up" size={14} />
            <Typography variant="caption">
              Parent: {category.parentCategory.name}
            </Typography>
          </StatItem>
        )}
        <StatItem>
          <Icon name="calendar" size={14} />
          <Typography variant="caption">
            Created {new Date(category.createdAt).toLocaleDateString()}
          </Typography>
        </StatItem>
      </ItemStats>
    </ItemCard>
  );

  // Render tag item
  const renderTagItem = (tag) => (
    <ItemCard
      key={tag.id}
      itemType="tag"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <ItemHeader>
        <ItemInfo>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge 
              variant="secondary" 
              size="sm"
              style={{ 
                backgroundColor: tag.color + '20',
                color: tag.color,
                border: `1px solid ${tag.color}40`
              }}
            >
              <Icon name={tag.icon || 'tag'} size={12} />
              {tag.name}
            </Badge>
          </div>
          {tag.description && (
            <Typography variant="body2" color="secondary">
              {tag.description}
            </Typography>
          )}
        </ItemInfo>
        <ItemActions>
          <Button variant="ghost" size="sm" onClick={() => handleEditTag(tag)}>
            <Icon name="edit" size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleDeleteTag(tag)}
            disabled={formLoading}
          >
            <Icon name="trash" size={14} />
          </Button>
        </ItemActions>
      </ItemHeader>
      
      <ItemStats>
        <StatItem>
          <Icon name="products" size={14} />
          <Typography variant="caption">
            {tag.productCount || 0} products
          </Typography>
        </StatItem>
        <StatItem>
          <Icon name="trending-up" size={14} />
          <Typography variant="caption">
            {tag.usageCount || 0} times used
          </Typography>
        </StatItem>
        <StatItem>
          <Icon name="calendar" size={14} />
          <Typography variant="caption">
            Created {new Date(tag.createdAt).toLocaleDateString()}
          </Typography>
        </StatItem>
      </ItemStats>
    </ItemCard>
  );

  if (loading) {
    return (
      <ManagerContainer className={className} {...props}>
        <LoadingState>
          <Icon name="loader" size={48} className="animate-spin" />
          <Typography variant="h6" style={{ marginTop: '1rem' }}>
            Loading categories and tags...
          </Typography>
        </LoadingState>
      </ManagerContainer>
    );
  }

  if (error) {
    return (
      <ManagerContainer className={className} {...props}>
        <EmptyState>
          <Icon name="alert-triangle" size={48} color="error" />
          <Typography variant="h6" style={{ marginTop: '1rem' }}>
            Failed to load data
          </Typography>
          <Typography variant="body2" color="secondary" style={{ marginBottom: '1rem' }}>
            {error}
          </Typography>
          <Button onClick={fetchData}>
            <Icon name="refresh" size={16} />
            Try Again
          </Button>
        </EmptyState>
      </ManagerContainer>
    );
  }

  const currentItems = activeTab === 'categories' ? filteredCategories : filteredTags;
  const currentCount = activeTab === 'categories' ? categories.length : tags.length;

  return (
    <ManagerContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
      {...props}
    >
      <HeaderSection>
        <HeaderTitle>
          <Icon name="folder-tree" size={24} />
          <div>
            <Typography variant="h4" weight="semibold">
              Category & Tag Management
            </Typography>
            <Typography variant="body2" color="secondary">
              Organize your products with categories and tags
            </Typography>
          </div>
        </HeaderTitle>
        
        <HeaderActions>
          <Button 
            variant="primary" 
            onClick={activeTab === 'categories' ? handleCreateCategory : handleCreateTag}
          >
            <Icon name="plus" size={16} />
            Add {activeTab === 'categories' ? 'Category' : 'Tag'}
          </Button>
        </HeaderActions>
      </HeaderSection>

      <TabSection>
        <TabButtons>
          <TabButton
            variant="ghost"
            active={activeTab === 'categories'}
            onClick={() => setActiveTab('categories')}
          >
            <Icon name="folder" size={16} />
            Categories ({categories.length})
          </TabButton>
          <TabButton
            variant="ghost"
            active={activeTab === 'tags'}
            onClick={() => setActiveTab('tags')}
          >
            <Icon name="tag" size={16} />
            Tags ({tags.length})
          </TabButton>
        </TabButtons>

        <ContentSection>
          <SearchSection>
            <FormField
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon="search"
              style={{ minWidth: '300px', flex: 1 }}
            />
            <Typography variant="body2" color="secondary">
              {currentItems.length} of {currentCount} {activeTab}
            </Typography>
          </SearchSection>

          {currentItems.length === 0 ? (
            <EmptyState>
              <Icon 
                name={activeTab === 'categories' ? 'folder-plus' : 'tag'} 
                size={48} 
                color="secondary" 
              />
              <Typography variant="h6" style={{ marginTop: '1rem' }}>
                {searchTerm ? 'No matching items found' : `No ${activeTab} yet`}
              </Typography>
              <Typography variant="body2" color="secondary" style={{ marginBottom: '1rem' }}>
                {searchTerm 
                  ? `Try a different search term`
                  : `Create your first ${activeTab.slice(0, -1)} to get started`
                }
              </Typography>
              {!searchTerm && (
                <Button 
                  variant="primary" 
                  onClick={activeTab === 'categories' ? handleCreateCategory : handleCreateTag}
                >
                  <Icon name="plus" size={16} />
                  Add {activeTab === 'categories' ? 'Category' : 'Tag'}
                </Button>
              )}
            </EmptyState>
          ) : (
            <ItemsGrid columns={3}>
              <AnimatePresence>
                {activeTab === 'categories' 
                  ? currentItems.map(renderCategoryItem)
                  : currentItems.map(renderTagItem)
                }
              </AnimatePresence>
            </ItemsGrid>
          )}
        </ContentSection>
      </TabSection>

      {/* Category Form Modal */}
      <Modal
        isOpen={showCategoryForm}
        onClose={handleFormCancel}
        title={editingItem ? 'Edit Category' : 'Create New Category'}
        size="md"
        preventCloseOnBackdropClick={formLoading}
      >
        <FormContainer onSubmit={handleCategoryFormSubmit}>
          <FormField
            label="Category Name"
            type="text"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Enter category name"
          />
          
          <FormField
            label="Description"
            type="textarea"
            rows={3}
            value={categoryForm.description}
            onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Optional description"
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Color"
              type="color"
              value={categoryForm.color}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
            />
            
            <FormField
              label="Icon"
              type="select"
              value={categoryForm.icon}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
              options={[
                { value: 'folder', label: '📁 Folder' },
                { value: 'box', label: '📦 Box' },
                { value: 'tag', label: '🏷️ Tag' },
                { value: 'star', label: '⭐ Star' },
                { value: 'heart', label: '❤️ Heart' },
                { value: 'shopping-bag', label: '🛍️ Shopping Bag' }
              ]}
            />
          </div>
          
          <FormActions>
            <Button type="button" variant="secondary" onClick={handleFormCancel} disabled={formLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={formLoading}>
              {editingItem ? 'Update' : 'Create'} Category
            </Button>
          </FormActions>
        </FormContainer>
      </Modal>

      {/* Tag Form Modal */}
      <Modal
        isOpen={showTagForm}
        onClose={handleFormCancel}
        title={editingItem ? 'Edit Tag' : 'Create New Tag'}
        size="md"
        preventCloseOnBackdropClick={formLoading}
      >
        <FormContainer onSubmit={handleTagFormSubmit}>
          <FormField
            label="Tag Name"
            type="text"
            value={tagForm.name}
            onChange={(e) => setTagForm(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Enter tag name"
          />
          
          <FormField
            label="Description"
            type="textarea"
            rows={3}
            value={tagForm.description}
            onChange={(e) => setTagForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Optional description"
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Color"
              type="color"
              value={tagForm.color}
              onChange={(e) => setTagForm(prev => ({ ...prev, color: e.target.value }))}
            />
            
            <FormField
              label="Icon"
              type="select"
              value={tagForm.icon}
              onChange={(e) => setTagForm(prev => ({ ...prev, icon: e.target.value }))}
              options={[
                { value: 'tag', label: '🏷️ Tag' },
                { value: 'hash', label: '# Hash' },
                { value: 'star', label: '⭐ Star' },
                { value: 'flag', label: '🚩 Flag' },
                { value: 'bookmark', label: '🔖 Bookmark' },
                { value: 'zap', label: '⚡ Lightning' }
              ]}
            />
          </div>
          
          <FormActions>
            <Button type="button" variant="secondary" onClick={handleFormCancel} disabled={formLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={formLoading}>
              {editingItem ? 'Update' : 'Create'} Tag
            </Button>
          </FormActions>
        </FormContainer>
      </Modal>
    </ManagerContainer>
  );
};

export default CategoryTagManager;