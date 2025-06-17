'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, Palette } from 'lucide-react';
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

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  links: DocumentLink[];
}

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  section?: Section;
  onSave: (section: Section) => void;
  onDelete?: (sectionId: string) => void;
}

const colorOptions = [
  { name: 'Blue', value: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { name: 'Purple', value: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
  { name: 'Green', value: 'bg-green-50 border-green-200 hover:bg-green-100' },
  { name: 'Yellow', value: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' },
  { name: 'Orange', value: 'bg-orange-50 border-orange-200 hover:bg-orange-100' },
  { name: 'Red', value: 'bg-red-50 border-red-200 hover:bg-red-100' },
  { name: 'Gray', value: 'bg-gray-50 border-gray-200 hover:bg-gray-100' },
  { name: 'Indigo', value: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100' },
];

export function SectionModal({
  isOpen,
  onClose,
  mode,
  section,
  onSave,
  onDelete
}: SectionModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: colorOptions[0].value
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (section && mode === 'edit') {
      setFormData({
        title: section.title || '',
        description: section.description || '',
        color: section.color || colorOptions[0].value
      });
    } else {
      setFormData({
        title: '',
        description: '',
        color: colorOptions[0].value
      });
    }
  }, [section, mode, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    return formData.title.trim() && formData.description.trim();
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    const sectionData: Section = {
      id: section?.id || `section_${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
      color: formData.color,
      icon: section?.icon,
      links: section?.links || []
    };

    try {
      await onSave(sectionData);
      onClose();
    } catch (error) {
      console.error('Error saving section:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!section?.id || !onDelete) return;
    
    setIsLoading(true);
    try {
      await onDelete(section.id);
      onClose();
    } catch (error) {
      console.error('Error deleting section:', error);
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
                Add New Section
              </>
            ) : (
              <>
                <Edit3 className="w-5 h-5" />
                Edit Section
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? 'Create a new documentation section'
              : 'Edit section details'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">Section Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Communication Protocols"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this section..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full min-h-[80px]"
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Color Theme
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => handleInputChange('color', color.value)}
                  className={`
                    p-3 rounded-lg border-2 transition-all duration-200 text-xs font-medium
                    ${color.value}
                    ${formData.color === color.value 
                      ? 'ring-2 ring-blue-500 ring-offset-2' 
                      : ''
                    }
                  `}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className={`p-4 rounded-lg border-2 ${formData.color}`}>
              <h3 className="font-semibold text-lg mb-1">
                {formData.title || 'Section Title'}
              </h3>
              <p className="text-sm text-gray-600">
                {formData.description || 'Section description will appear here...'}
              </p>
              <Badge variant="secondary" className="text-xs mt-2">
                0 resources
              </Badge>
            </div>
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
                Delete Section
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
              {isLoading ? 'Saving...' : 'Save Section'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}