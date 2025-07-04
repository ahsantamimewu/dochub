'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, ExternalLink, FileText, Table, StickyNote } from "lucide-react";
import { DocumentLink } from "@/types";

interface ResourceItemProps {
  link: DocumentLink;
  adminMode: boolean;
  onEdit: () => void;
  onOpenLink: (url: string) => void;
  onResourceClick: () => void;
}

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'table':
      return <Table className="w-4 h-4" />;
    case 'notes':
      return <StickyNote className="w-4 h-4" />;
    case 'file':
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const getResourceTypeLabel = (type: string) => {
  switch (type) {
    case 'table':
      return 'Table';
    case 'notes':
      return 'Notes';
    case 'file':
    default:
      return 'File';
  }
};

export function ResourceItem({ link, adminMode, onEdit, onOpenLink, onResourceClick }: ResourceItemProps) {
  const handleClick = () => {
    onResourceClick();
  };

  return (
    <div
      className="group p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={handleClick}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-1">
              {getResourceIcon(link.type)}
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                {getResourceTypeLabel(link.type)}
              </Badge>
            </div>
            <h4 className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
              {link.title}
            </h4>
            {link.type === 'file' && (
              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
            )}
          </div>

          {link.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {link.description}
            </p>
          )}

          {/* Show table preview */}
          {link.type === 'table' && link.tableData && link.tableData.columns.length > 0 && (
            <div className="text-xs text-gray-500 mb-2">
              Table: {link.tableData.columns.length} columns, {link.tableData.rows.length} rows
            </div>
          )}

          {/* Show notes preview */}
          {link.type === 'notes' && link.content && (
            <div className="text-xs text-gray-600 mb-2 line-clamp-2">
              {link.content.substring(0, 100)}...
            </div>
          )}

          {link.tags && link.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {link.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs px-2 py-0.5 h-auto"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {adminMode && (
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 flex-shrink-0"
            onClick={onEdit}
          >
            <Edit3 className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
