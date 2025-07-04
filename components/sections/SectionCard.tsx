'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Plus, Settings } from "lucide-react";
import { Section, DocumentLink } from "@/types";
import { ResourceItem } from './ResourceItem';

interface SectionCardProps {
  section: Section;
  adminMode: boolean;
  onEditSection: (section: Section) => void;
  onAddResource: (sectionId: string) => void;
  onEditResource: (resource: DocumentLink, sectionId: string) => void;
  onViewTable: (resource: DocumentLink) => void;
  onViewNotes: (resource: DocumentLink) => void;
  windowWidth: number;
}

export function SectionCard({ section, adminMode, onEditSection, onAddResource, onEditResource, onViewTable, onViewNotes, windowWidth }: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSection = () => {
    setIsExpanded(!isExpanded);
  };

  const openLink = (url: string) => {
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleResourceClick = (resource: DocumentLink) => {
    if (resource.type === 'table') {
      onViewTable(resource);
    } else if (resource.type === 'notes') {
      onViewNotes(resource);
    } else if (resource.type === 'file' && resource.url) {
      openLink(resource.url);
    }
  };

  return (
    <Card
      className={`transition-all duration-200 ${section.color} border-2`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              {section.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {section.links.length} resources
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {adminMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditSection(section)}
                className="hidden sm:flex"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSection}
              className="md:hidden"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <CardDescription className="text-sm">
          {section.description}
        </CardDescription>

        {adminMode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditSection(section)}
            className="sm:hidden w-full mt-2"
          >
            <Settings className="w-4 h-4 mr-2" />
            Edit Section
          </Button>
        )}
      </CardHeader>

      <CardContent
        className={`space-y-3 ${
          windowWidth < 768 && !isExpanded
            ? "hidden"
            : "block"
        }`}
      >
        {section.links.map((link) => (
          <ResourceItem
            key={link.id}
            link={link}
            adminMode={adminMode}
            onEdit={() => onEditResource(link, section.id)}
            onOpenLink={openLink}
            onResourceClick={() => handleResourceClick(link)}
          />
        ))}

        {adminMode && (
          <Button
            variant="outline"
            className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400 bg-transparent"
            onClick={() => onAddResource(section.id)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
