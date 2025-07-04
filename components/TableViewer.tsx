'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, Download, Search, Filter, Plus, X, Save } from 'lucide-react';
import { DocumentLink, TableData, TableRow } from '@/types';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface TableViewerProps {
  isOpen: boolean;
  onClose: () => void;
  resource?: DocumentLink;
  onEdit?: () => void;
  onSave?: (updatedResource: DocumentLink) => void;
}

export function TableViewer({ isOpen, onClose, resource, onEdit, onSave }: TableViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tableData, setTableData] = useState<TableData>({ columns: [], rows: [] });
  const { toast } = useToast();
  
  // Initialize table data when resource changes
  React.useEffect(() => {
    if (resource && resource.tableData) {
      setTableData({
        ...resource.tableData,
        // Ensure there's always at least one empty row for input
        rows: resource.tableData.rows.length > 0 
          ? resource.tableData.rows 
          : [{ id: `row${Date.now()}`, data: Object.fromEntries(resource.tableData.columns.map(col => [col.id, ''])) }]
      });
    }
  }, [resource]);
  
  if (!resource || !resource.tableData) {
    return null;
  }

  const { columns, rows } = isEditing ? tableData : resource.tableData;

  // Filter rows based on search term
  const filteredRows = rows.filter(row => {
    if (!searchTerm) return true;
    return columns.some(column => {
      const cellValue = row.data[column.id] || '';
      return cellValue.toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Table editing functions
  const addRow = () => {
    const newRow: TableRow = {
      id: `row${Date.now()}`,
      data: Object.fromEntries(columns.map(col => [col.id, '']))
    };
    
    setTableData(prev => ({
      ...prev,
      rows: [...prev.rows, newRow]
    }));
  };

  const removeRow = (rowId: string) => {
    setTableData(prev => {
      const newRows = prev.rows.filter(row => row.id !== rowId);
      // Always keep at least one row for input
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

  const handleSave = async () => {
    if (onSave && resource) {
      try {
        const updatedResource = {
          ...resource,
          tableData: tableData
        };
        await onSave(updatedResource);
        setIsEditing(false);
        toast({
          title: "Table saved",
          description: "Your changes have been saved successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save changes. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancelEdit = () => {
    // Reset to original data
    if (resource.tableData) {
      setTableData(resource.tableData);
    }
    setIsEditing(false);
  };

  const exportToCSV = () => {
    // Create CSV content
    const headers = columns.map(col => col.name).join(',');
    const csvRows = rows.map(row => 
      columns.map(col => {
        const value = row.data[col.id] || '';
        // Escape quotes and wrap in quotes if contains comma
        return value.includes(',') ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',')
    );
    
    const csvContent = [headers, ...csvRows].join('\n');
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resource.title}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pr-10"> {/* Add right padding to avoid overlap with close button */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="flex items-center gap-2 mb-1">
                {resource.title}
                <Badge variant="outline">Table</Badge>
              </DialogTitle>
              {resource.description && (
                <p className="text-sm text-gray-600">{resource.description}</p>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0 mt-1"> {/* Add margin-top to align better */}
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="flex items-center gap-1"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Data
                  </Button>
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onEdit}
                      className="flex items-center gap-1"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Structure
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Search and Filter Bar */}
        <div className="flex items-center gap-2 py-2 border-b">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search table data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              disabled={isEditing}
            />
          </div>
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={addRow}
              className="flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Row
            </Button>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{isEditing ? tableData.rows.length : filteredRows.length} of {isEditing ? tableData.rows.length : rows.length} rows</span>
            {columns.length > 0 && <span>• {columns.length} columns</span>}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto">
          {columns.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No columns defined for this table.
            </div>
          ) : (isEditing ? tableData.rows : filteredRows).length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              {isEditing ? "No data rows in this table." : "No matching rows found."}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-900 w-12">#</th>
                    {columns.map((column) => (
                      <th key={column.id} className="px-4 py-3 text-left font-medium text-gray-900">
                        {column.name}
                      </th>
                    ))}
                    {isEditing && <th className="px-4 py-3 w-12"></th>}
                  </tr>
                </thead>
                <tbody>
                  {(isEditing ? tableData.rows : filteredRows).map((row, index) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                        {index + 1}
                      </td>
                      {columns.map((column) => (
                        <td key={column.id} className="px-4 py-3">
                          {isEditing ? (
                            <Input
                              value={row.data[column.id] || ''}
                              onChange={(e) => updateRowData(row.id, column.id, e.target.value)}
                              className="border-0 bg-transparent p-0 focus:ring-0 focus:ring-offset-0"
                              placeholder="Enter data..."
                            />
                          ) : (
                            <div className="max-w-xs overflow-hidden">
                              <span className="break-words">
                                {row.data[column.id] || '-'}
                              </span>
                            </div>
                          )}
                        </td>
                      ))}
                      {isEditing && (
                        <td className="px-4 py-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRow(row.id)}
                            className="h-auto p-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Table Stats */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <span className="text-sm text-gray-600">Tags:</span>
            <div className="flex flex-wrap gap-1">
              {resource.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
