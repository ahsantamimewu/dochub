"use client";

import { Button } from "@/components/ui/button";
import { Info, Plus, Search } from "lucide-react";
import { SectionCard } from "@/components/sections/SectionCard";
import { Section, DocumentLink } from "@/types";

interface MainContentProps {
  sections: Section[];
  adminMode: boolean;
  searchTerm: string;
  windowWidth: number;
  onAddSection: () => void;
  onEditSection: (section: Section) => void;
  onAddResource: (sectionId: string) => void;
  onEditResource: (resource: DocumentLink, sectionId: string) => void;
  onViewTable: (resource: DocumentLink) => void;
  onViewNotes: (resource: DocumentLink) => void;
  setIsAdminFeaturesModalOpen: (isOpen: boolean) => void;
}

export function MainContent({
  sections,
  adminMode,
  searchTerm,
  windowWidth,
  onAddSection,
  onEditSection,
  onAddResource,
  onEditResource,
  onViewTable,
  onViewNotes,
  setIsAdminFeaturesModalOpen,
}: MainContentProps) {
  const filteredData = sections
    .map((section) => ({
      ...section,
      links: section.links.filter(
        (link) =>
          link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          link.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          link.tags?.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      ),
    }))
    .filter((section) => section.links.length > 0 || searchTerm === "");

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:max-w-7xl lg:mx-auto">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg text-gray-600 mb-2">
              Quick Access to Team Resources
            </h2>
            <p className="text-gray-500">
              Centralized access to all your team&apos;s Google Sheets and
              documentation. Click any link to open in a new tab.
            </p>
          </div>
          {adminMode && (
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdminFeaturesModalOpen(true)}
                className="flex items-center h-10 bg-cyan-700 text-white border-0 focus:ring-0 focus:outline-none shadow-none hover:bg-cyan-900 hover:text-white"
                style={{ backgroundColor: "#155e75" }}
              >
                <Info className="w-4 h-4 mr-2" />
                Admin Features
              </Button>
              <Button
                onClick={onAddSection}
                variant="outline"
                size="sm"
                className="flex items-center h-10 bg-cyan-700 text-white border-0 focus:ring-0 focus:outline-none shadow-none hover:bg-cyan-900 hover:text-white"
                style={{ backgroundColor: "#155e75" }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredData.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            adminMode={adminMode}
            onEditSection={onEditSection}
            onAddResource={onAddResource}
            onEditResource={onEditResource}
            onViewTable={onViewTable}
            onViewNotes={onViewNotes}
            windowWidth={windowWidth}
          />
        ))}
      </div>

      {filteredData.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No results found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search terms or browse all categories above.
          </p>
        </div>
      )}
    </main>
  );
}
