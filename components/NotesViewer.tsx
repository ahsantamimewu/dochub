'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, Copy, StickyNote } from 'lucide-react';
import { DocumentLink } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface NotesViewerProps {
  isOpen: boolean;
  onClose: () => void;
  resource?: DocumentLink;
  onEdit?: () => void;
}

export function NotesViewer({ isOpen, onClose, resource, onEdit }: NotesViewerProps) {
  const { toast } = useToast();

  if (!resource) {
    return null;
  }

  const copyToClipboard = async () => {
    if (resource.content) {
      try {
        await navigator.clipboard.writeText(resource.content);
        toast({
          title: "Copied!",
          description: "Notes content copied to clipboard.",
        });
      } catch (err) {
        toast({
          title: "Failed to copy",
          description: "Could not copy content to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pr-10"> {/* Add right padding to avoid overlap with close button */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="flex items-center gap-2 mb-1">
                <StickyNote className="w-5 h-5" />
                {resource.title}
                <Badge variant="outline">Notes</Badge>
              </DialogTitle>
              {resource.description && (
                <p className="text-sm text-gray-600">{resource.description}</p>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0 mt-1"> {/* Add margin-top to align better */}
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex items-center gap-1"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="flex items-center gap-1"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Notes Content */}
        <div className="flex-1 overflow-auto">
          {!resource.content ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No content in this note.
            </div>
          ) : (
            <div className="bg-white border rounded-lg p-6">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                  {resource.content}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
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

        {/* Metadata */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          {resource.createdAt && (
            <span>
              Created: {new Date(resource.createdAt.seconds * 1000).toLocaleDateString()}
            </span>
          )}
          {resource.updatedAt && resource.createdAt && (
            <span className="ml-4">
              Updated: {new Date(resource.updatedAt.seconds * 1000).toLocaleDateString()}
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
