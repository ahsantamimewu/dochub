'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, X, Table, FileText, StickyNote } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DocumentLink, ResourceType, TableColumn, TableRow, TableData } from '@/types';

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
  const [resourceType, setResourceType] = useState<ResourceType>('file');
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    content: '',
    tags: [] as string[]
  });
  const [tableData, setTableData] = useState<TableData>({
    columns: [{ id: 'col1', name: 'Column 1' }],
    rows: [{ id: 'row1', data: { col1: '' } }]  // Always start with one row
  });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (resource && mode === 'edit') {
      setResourceType(resource.type || 'file');
      setFormData({
        title: resource.title || '',
        url: resource.url || '',
        description: resource.description || '',
        content: resource.content || '',
        tags: resource.tags || []
      });
      if (resource.tableData) {
        setTableData(resource.tableData);
      }
    } else {
      setResourceType('file');
      setFormData({
        title: '',
        url: '',
        description: '',
        content: '',
        tags: []
      });
      setTableData({
        columns: [{ id: 'col1', name: 'Column 1' }],
        rows: [{ id: 'row1', data: { col1: '' } }]  // Always start with one row
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
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for this resource.",
        variant: "destructive"
      });
      return false;
    }
    
    // Type-specific validation
    if (resourceType === 'file') {
      if (!formData.url.trim()) {
        toast({
          title: "URL required",
          description: "Please provide a URL for the file resource.",
          variant: "destructive"
        });
        return false;
      }
      
      // Basic URL validation
      try {
        new URL(formData.url);
      } catch {
        toast({
          title: "Invalid URL",
          description: "Please provide a valid URL (e.g., https://example.com).",
          variant: "destructive"
        });
        return false;
      }
    } else if (resourceType === 'table') {
      if (tableData.columns.length === 0) {
        toast({
          title: "Missing Columns",
          description: "Please add at least one column to the table.",
          variant: "destructive"
        });
        return false;
      }
    } else if (resourceType === 'notes') {
      if (!formData.content.trim()) {
        toast({
          title: "Missing Content",
          description: "Please provide content for the notes.",
          variant: "destructive"
        });
        return false;
      }
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const resourceData: DocumentLink = {
        id: resource?.id || `resource-${Date.now()}`,
        title: formData.title,
        type: resourceType,
        description: formData.description || '',
        tags: formData.tags,
        // Keep existing section ID if editing
        sectionId: resource?.sectionId
      };

      // Add type-specific data
      if (resourceType === 'file') {
        resourceData.url = formData.url;
      } else if (resourceType === 'table') {
        resourceData.tableData = tableData;
      } else if (resourceType === 'notes') {
        resourceData.content = formData.content;
      }
      
      onSave(resourceData);
      onClose();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast({
        title: "Error",
        description: "There was a problem saving the resource. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!resource || !onDelete) return;
    
    setIsLoading(true);
    
    try {
      onDelete(resource.id);
      onClose();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        title: "Error",
        description: "There was a problem deleting the resource. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Table management functions
  const addColumn = () => {
    const newColumnId = `col${tableData.columns.length + 1}`;
    const newColumn: TableColumn = {
      id: newColumnId,
      name: `Column ${tableData.columns.length + 1}`
    };
    
    setTableData(prev => ({
      columns: [...prev.columns, newColumn],
      rows: prev.rows.length > 0 ? prev.rows.map(row => ({
        ...row,
        data: { ...row.data, [newColumnId]: '' }
      })) : [{ id: 'row1', data: Object.fromEntries([...prev.columns, newColumn].map(col => [col.id, ''])) }]
    }));
  };

  const removeColumn = (columnId: string) => {
    if (tableData.columns.length <= 1) return; // Keep at least one column
    
    setTableData(prev => ({
      columns: prev.columns.filter(col => col.id !== columnId),
      rows: prev.rows.map(row => {
        const { [columnId]: removed, ...restData } = row.data;
        return { ...row, data: restData };
      })
    }));
  };

  const updateColumnName = (columnId: string, name: string) => {
    setTableData(prev => ({
      ...prev,
      columns: prev.columns.map(col => 
        col.id === columnId ? { ...col, name } : col
      )
    }));
  };

  const addRow = () => {
    const newRow: TableRow = {
      id: `row${Date.now()}`,
      data: Object.fromEntries(tableData.columns.map(col => [col.id, '']))
    };
    
    setTableData(prev => ({
      ...prev,
      rows: [...prev.rows, newRow]
    }));
  };

  const removeRow = (rowId: string) => {
    setTableData(prev => {
      const newRows = prev.rows.filter(row => row.id !== rowId);
      // Always keep at least one row for input (even if empty)
      if (newRows.length === 0) {
        return {
          ...prev,
          rows: [{ id: `row${Date.now()}`, data: Object.fromEntries(prev.columns.map(col => [col.id, ''])) }]
        };
      }
      return {
        ...prev,
        rows: newRows
      };
    });
  };

  const updateRowData = (rowId: string, columnId: string, value: string) => {
    setTableData(prev => ({
      ...prev,
      rows: prev.rows.map(row => 
        row.id === rowId 
          ? { ...row, data: { ...row.data, [columnId]: value }}
          : row
      )
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Resource' : 'Edit Resource'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? `Add a new resource to the "${sectionTitle}" section.` 
              : `Update this resource in the "${sectionTitle}" section.`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Resource Type Selection (only for add mode) */}
          {mode === 'add' && (
            <div className="grid gap-2">
              <Label>Resource Type</Label>
              <Select value={resourceType} onValueChange={(value: ResourceType) => setResourceType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select resource type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      File/Link
                    </div>
                  </SelectItem>
                  <SelectItem value="table">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4" />
                      Table
                    </div>
                  </SelectItem>
                  <SelectItem value="notes">
                    <div className="flex items-center gap-2">
                      <StickyNote className="w-4 h-4" />
                      Notes
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Title (common for all types) */}
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              placeholder="e.g. Team Meeting Notes" 
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Type-specific fields */}
          {resourceType === 'file' && (
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input 
                id="url" 
                placeholder="https://docs.google.com/..." 
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}

          {resourceType === 'table' && (
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Table Structure</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addColumn}
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Column
                </Button>
              </div>
              
              {/* Column Headers */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Column Names:</Label>
                <div className="grid gap-2">
                  {tableData.columns.map((column, index) => (
                    <div key={column.id} className="flex gap-2">
                      <Input
                        placeholder={`Column ${index + 1}`}
                        value={column.name}
                        onChange={(e) => updateColumnName(column.id, e.target.value)}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      {tableData.columns.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeColumn(column.id)}
                          disabled={isLoading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Table Data */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-600">Table Data:</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addRow}
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Row
                  </Button>
                </div>
                
                {tableData.columns.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 border-2 border-dashed rounded">
                    Please add columns first to start creating your table.
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          {tableData.columns.map((column) => (
                            <th key={column.id} className="px-3 py-2 text-left font-medium">
                              {column.name}
                            </th>
                          ))}
                          <th className="px-3 py-2 w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(tableData.rows.length > 0 ? tableData.rows : [{ id: 'empty-row', data: Object.fromEntries(tableData.columns.map(col => [col.id, ''])) }]).map((row) => (
                          <tr key={row.id} className="border-b hover:bg-gray-50">
                            {tableData.columns.map((column) => (
                              <td key={column.id} className="px-3 py-2">
                                <Input
                                  value={row.data[column.id] || ''}
                                  onChange={(e) => {
                                    if (row.id === 'empty-row') {
                                      // If this is the placeholder row, create a real row
                                      const newRow = { id: `row${Date.now()}`, data: { [column.id]: e.target.value } };
                                      tableData.columns.forEach(col => {
                                        if (col.id !== column.id) {
                                          newRow.data[col.id] = '';
                                        }
                                      });
                                      setTableData(prev => ({
                                        ...prev,
                                        rows: [newRow]
                                      }));
                                    } else {
                                      updateRowData(row.id, column.id, e.target.value);
                                    }
                                  }}
                                  disabled={isLoading}
                                  className="border-0 bg-transparent p-0 focus:ring-0 focus:ring-offset-0"
                                  placeholder="Enter data..."
                                />
                              </td>
                            ))}
                            <td className="px-3 py-2">
                              {row.id !== 'empty-row' && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeRow(row.id)}
                                  disabled={isLoading}
                                  className="h-auto p-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Table Preview for Edit Mode */}
              {mode === 'edit' && tableData.rows.length > 0 && (
                <div className="grid gap-2">
                  <Label>Table Preview</Label>
                  <div className="border rounded-lg overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          {tableData.columns.map((column) => (
                            <th key={column.id} className="px-3 py-2 text-left font-medium">
                              {column.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.rows.slice(0, 5).map((row) => (
                          <tr key={row.id} className="border-b">
                            {tableData.columns.map((column) => (
                              <td key={column.id} className="px-3 py-2">
                                {row.data[column.id] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {tableData.rows.length > 5 && (
                      <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-t">
                        Showing 5 of {tableData.rows.length} rows
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {resourceType === 'notes' && (
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea 
                id="content" 
                placeholder="Write your notes here..." 
                rows={6}
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Description (common for all types) */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea 
              id="description" 
              placeholder="Briefly describe this resource..." 
              rows={2}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Tags (common for all types) */}
          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1 p-1.5">
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                id="tags" 
                placeholder="Add a tag and press Enter" 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={addTag} 
                disabled={!tagInput.trim() || isLoading}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          {mode === 'edit' && onDelete && (
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isLoading}
              className="mr-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}