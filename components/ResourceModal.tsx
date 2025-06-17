'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface DocumentLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags?: string[];
}

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  resource?: DocumentLink;
  sectionTitle: string;
  onSave: (resource: DocumentLink) => void;
  onDelete?: (resourceId: string) => void;
}

export function ResourceModal({
  isOpen,
  onClose,
  mode,
  resource,
  sectionTitle,
  onSave,
  onDelete
}: ResourceModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (resource && mode === 'edit') {
      setFormData({
        title: resource.title || '',
        url: resource.url || '',
        description: resource.description || '',
        tags: resource.tags || []
      });
    } else {
      setFormData({
        title: '',
        url: '',
        description: '',
        tags: []
      });
    }
    setTagInput('');
  }, [resource, mode, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const validateForm = () => {
    return formData.title.trim() && formData.url.trim();
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    const resourceData: DocumentLink = {
      id: resource?.id || `resource_${Date.now()}`,
      title: formData.title.trim(),
      url: formData.url.trim(),
      description: formData.description.trim() || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined
    };

    try {
      await onSave(resourceData);
      onClose();
    } catch (error) {
      console.error('Error saving resource:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!resource?.id || !onDelete) return;
    
    setIsLoading(true);
    try {
      await onDelete(resource.id);
      onClose();
    } catch (error) {
      console.error('Error deleting resource:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'add' ? (
              <>
                <Plus className="w-5 h-5" />
                Add New Resource
              </>
            ) : (
              <>
                <Edit3 className="w-5 h-5" />
                Edit Resource
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? `Add a new resource to ${sectionTitle}`
              : `Edit resource in ${sectionTitle}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Daily Standup Template"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full"
            />
          </div>

          {/* URL Field */}
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this resource..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full min-h-[80px]"
            />
          </div>

          {/* Tags Field */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {mode === 'edit' && onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!validateForm() || isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}