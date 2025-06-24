"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/hooks/use-firestore";
import {
  addResource,
  updateResource,
  deleteResource,
  addSection,
  updateSection,
  deleteSection,
} from "@/services/firestore";
import { DocumentLink, Section } from "@/types";

import LoginPage from "@/components/LoginPage";
import { Header } from "@/components/layout/Header";
import { MainContent } from "@/components/layout/MainContent";
import { ResourceModal } from "@/components/ResourceModal";
import { SectionModal } from "@/components/SectionModal";
import { AdminFeaturesModal } from "@/components/AdminFeaturesModal";
import { Badge } from "@/components/ui/badge";

export default function DocumentationHub() {
  const { user, loading, setIsAdmin, logout } = useAuth();
  const { toast } = useToast();
  const { sections, isLoading } = useFirestore();

  const [searchTerm, setSearchTerm] = useState("");
  const [adminMode, setAdminMode] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [isAdminFeaturesModalOpen, setIsAdminFeaturesModalOpen] = useState(false);

  // Modal states
  const [resourceModal, setResourceModal] = useState({
    isOpen: false,
    mode: "add" as "add" | "edit",
    resource: undefined as DocumentLink | undefined,
    sectionId: "",
  });

  const [sectionModal, setSectionModal] = useState({
    isOpen: false,
    mode: "add" as "add" | "edit",
    section: undefined as Section | undefined,
  });

  // Check admin status from local storage
  useEffect(() => {
    if (user) {
      const storedAdminMode = localStorage.getItem("docHubAdminMode");
      if (storedAdminMode === "true") {
        setAdminMode(true);
        setIsAdmin(true);
      }
    }
  }, [user, setIsAdmin]);

  // Handle window resize
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setAdminMode(false);
      setSearchTerm("");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout failed",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Resource CRUD handlers
  const handleAddResource = (sectionId: string) => {
    setResourceModal({ isOpen: true, mode: "add", resource: undefined, sectionId });
  };

  const handleEditResource = (resource: DocumentLink, sectionId: string) => {
    setResourceModal({ isOpen: true, mode: "edit", resource, sectionId });
  };

  const handleSaveResource = async (resource: DocumentLink) => {
    try {
      if (resourceModal.mode === "add") {
        await addResource(resource, resourceModal.sectionId, user?.uid || "");
        toast({ title: "Resource added", description: "The resource has been added successfully." });
      } else {
        await updateResource(resource);
        toast({ title: "Resource updated", description: "The resource has been updated successfully." });
      }
    } catch (error) {
      console.error("Error saving resource:", error);
      toast({ title: "Error", description: "There was a problem saving the resource.", variant: "destructive" });
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      await deleteResource(resourceId);
      toast({ title: "Resource deleted", description: "The resource has been deleted successfully." });
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast({ title: "Error", description: "There was a problem deleting the resource.", variant: "destructive" });
    }
  };

  // Section CRUD handlers
  const handleAddSection = () => {
    setSectionModal({ isOpen: true, mode: "add", section: undefined });
  };

  const handleEditSection = (section: Section) => {
    setSectionModal({ isOpen: true, mode: "edit", section });
  };

  const handleSaveSection = async (section: Section) => {
    try {
      if (sectionModal.mode === "add") {
        await addSection(section, user?.uid || "");
        toast({ title: "Section added", description: "The section has been added successfully." });
      } else {
        await updateSection(section);
        toast({ title: "Section updated", description: "The section has been updated successfully." });
      }
    } catch (error) {
      console.error("Error saving section:", error);
      toast({ title: "Error", description: "There was a problem saving the section.", variant: "destructive" });
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    try {
      await deleteSection(sectionId);
      toast({ title: "Section deleted", description: "The section and all its resources have been deleted successfully." });
    } catch (error) {
      console.error("Error deleting section:", error);
      toast({ title: "Error", description: "There was a problem deleting the section.", variant: "destructive" });
    }
  };

  const getSectionTitle = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    return section?.title || "Unknown Section";
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        adminMode={adminMode}
        setAdminMode={setAdminMode}
        handleLogout={handleLogout}
        user={user}
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-600 mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-700">Loading your hub...</h3>
          <p className="text-gray-500 mt-2">Fetching your sections and resources</p>
        </div>
      ) : (
        <MainContent
          sections={sections}
          adminMode={adminMode}
          searchTerm={searchTerm}
          windowWidth={windowWidth}
          onAddSection={handleAddSection}
          onEditSection={handleEditSection}
          onAddResource={handleAddResource}
          onEditResource={handleEditResource}
          setIsAdminFeaturesModalOpen={setIsAdminFeaturesModalOpen}
        />
      )}

      <footer className="mt-16 py-8 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Built for startup teams • Last updated: {new Date().toLocaleDateString()}
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="outline" className="text-xs">
              {sections.reduce((acc, section) => acc + section.links.length, 0)} Total Resources
            </Badge>
            <Badge variant="outline" className="text-xs">
              {sections.length} Categories
            </Badge>
          </div>
        </div>
      </footer>

      <ResourceModal
        isOpen={resourceModal.isOpen}
        onClose={() => setResourceModal((prev) => ({ ...prev, isOpen: false }))}
        mode={resourceModal.mode}
        resource={resourceModal.resource}
        sectionTitle={getSectionTitle(resourceModal.sectionId)}
        onSave={handleSaveResource}
        onDelete={handleDeleteResource}
      />

      <SectionModal
        isOpen={sectionModal.isOpen}
        onClose={() => setSectionModal((prev) => ({ ...prev, isOpen: false }))}
        mode={sectionModal.mode}
        section={sectionModal.section}
        onSave={handleSaveSection}
        onDelete={handleDeleteSection}
      />

      <AdminFeaturesModal
        isOpen={isAdminFeaturesModalOpen}
        onClose={() => setIsAdminFeaturesModalOpen(false)}
      />
    </div>
  );
}
