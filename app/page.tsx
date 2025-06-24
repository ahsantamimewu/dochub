"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  MessageCircle,
  FlaskConical,
  Users,
  DollarSign,
  ShoppingCart,
  FolderOpen,
  ExternalLink,
  Edit3,
  Plus,
  ChevronDown,
  ChevronUp,
  Settings,
  LogOut,
  UserCog,
  ShieldCheck,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResourceModal } from "@/components/ResourceModal";
import { SectionModal } from "@/components/SectionModal";
import LoginPage from "@/components/LoginPage";
import { AdminFeaturesModal } from "@/components/AdminFeaturesModal";
import { useAuth } from "@/firebase/auth";
import { db } from "@/firebase/config";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  onSnapshot,
  where,
} from "firebase/firestore";
import { getIconByName } from "@/lib/icons";
import { useToast } from "@/hooks/use-toast";

interface DocumentLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags?: string[];
  sectionId?: string;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  iconName: string;
  description: string;
  color: string;
  links: DocumentLink[];
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

export default function DocumentationHub() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [adminMode, setAdminMode] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [windowWidth, setWindowWidth] = useState(0);
  const [isAdminFeaturesModalOpen, setIsAdminFeaturesModalOpen] = useState(false);

  // Use the auth context
  const { user, loading, isAdmin, setIsAdmin, logout } = useAuth();
  const { toast } = useToast();

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

  // Fetch sections and links from Firestore
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);

    // Create a query to get all sections ordered by title
    const sectionsQuery = query(
      collection(db, "sections"),
      orderBy("title", "asc")
    );

    // Set up a real-time listener for sections
    const unsubscribe = onSnapshot(
      sectionsQuery,
      async (sectionSnapshot) => {
        try {
          // Get all links in one query to avoid multiple reads
          const linksQuery = query(collection(db, "links"));
          const linksSnapshot = await getDocs(linksQuery);
          const linksMap: { [key: string]: DocumentLink[] } = {};

          // Group links by section ID
          linksSnapshot.forEach((linkDoc) => {
            const linkData = linkDoc.data() as DocumentLink;
            // Use the document ID as the link ID
            const link = {
              ...linkData,
              id: linkDoc.id, // Put id at the end to overwrite any existing id in linkData
            };

            const sectionId = linkData.sectionId;
            if (sectionId) {
              if (!linksMap[sectionId]) {
                linksMap[sectionId] = [];
              }
              linksMap[sectionId].push(link);
            }
          });

          // Map sections with their links
          const sectionsData = sectionSnapshot.docs.map((sectionDoc) => {
            const sectionData = sectionDoc.data();

            return {
              id: sectionDoc.id,
              title: sectionData.title || "",
              description: sectionData.description || "",
              color:
                sectionData.color ||
                "bg-gray-50 border-gray-200 hover:bg-gray-100",
              iconName: sectionData.iconName || "FolderOpen",
              icon: getIconByName(sectionData.iconName || "FolderOpen"),
              links: linksMap[sectionDoc.id] || [],
              createdAt: sectionData.createdAt,
              updatedAt: sectionData.updatedAt,
              createdBy: sectionData.createdBy,
            } as Section;
          });

          setSections(sectionsData);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          // Set an empty array instead of using mock data
          setSections([]);
          setIsLoading(false);
          toast({
            title: "Error loading data",
            description:
              "Could not fetch the latest data. Please try refreshing the page.",
            variant: "destructive",
          });
        }
      },
      (error) => {
        console.error("Error setting up listener:", error);
        setSections([]);
        setIsLoading(false);
        toast({
          title: "Connection error",
          description: "Could not establish connection to the database. Please check your internet connection and try again.",
          variant: "destructive",
        });
      }
    );

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [user, toast]);

  // Effect to check admin status
  useEffect(() => {
    if (user) {
      // For demo purposes, we're setting admin mode from localStorage
      // In a production app, you'd check a user's role in Firestore
      const storedAdminMode = localStorage.getItem("docHubAdminMode");
      setAdminMode(storedAdminMode === "true");
      if (storedAdminMode === "true") {
        setIsAdmin(true);
      }
    }
  }, [user, setIsAdmin]);

  // Effect to handle window resize
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
      setExpandedSections([]);
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout failed",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isExpanded = (sectionId: string) =>
    expandedSections.includes(sectionId);

  const openLink = (url: string) => {
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Resource CRUD operations
  const handleAddResource = (sectionId: string) => {
    setResourceModal({
      isOpen: true,
      mode: "add",
      resource: undefined,
      sectionId,
    });
  };

  const handleEditResource = (resource: DocumentLink, sectionId: string) => {
    setResourceModal({
      isOpen: true,
      mode: "edit",
      resource,
      sectionId,
    });
  };

  const handleSaveResource = async (resource: DocumentLink) => {
    try {
      if (resourceModal.mode === "add") {
        // Add new resource
        await addDoc(collection(db, "links"), {
          title: resource.title,
          url: resource.url,
          description: resource.description || "",
          tags: resource.tags || [],
          sectionId: resourceModal.sectionId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: user?.uid || "",
        });

        toast({
          title: "Resource added",
          description: "The resource has been added successfully.",
        });
      } else {
        // Update existing resource
        const resourceRef = doc(db, "links", resource.id);
        await updateDoc(resourceRef, {
          title: resource.title,
          url: resource.url,
          description: resource.description || "",
          tags: resource.tags || [],
          updatedAt: serverTimestamp(),
        });

        toast({
          title: "Resource updated",
          description: "The resource has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error saving resource:", error);
      toast({
        title: "Error",
        description: "There was a problem saving the resource. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      await deleteDoc(doc(db, "links", resourceId));
      toast({
        title: "Resource deleted",
        description: "The resource has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast({
        title: "Error",
        description: "There was a problem deleting the resource. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Section CRUD operations
  const handleAddSection = () => {
    setSectionModal({
      isOpen: true,
      mode: "add",
      section: undefined,
    });
  };

  const handleEditSection = (section: Section) => {
    // Update the section with the FirebaseSection interface
    const sectionData = {
      id: section.id,
      title: section.title,
      description: section.description,
      color: section.color,
      iconName: section.iconName,
      icon: section.icon,
      links: section.links,
    };

    setSectionModal({
      isOpen: true,
      mode: "edit",
      section: sectionData,
    });
  };

  const handleSaveSection = async (section: Section) => {
    try {
      if (sectionModal.mode === "add") {
        // Add new section
        await addDoc(collection(db, "sections"), {
          title: section.title,
          description: section.description,
          color: section.color,
          iconName: section.iconName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: user?.uid || "",
        });

        toast({
          title: "Section added",
          description: "The section has been added successfully.",
        });
      } else {
        // Update existing section
        const sectionRef = doc(db, "sections", section.id);
        await updateDoc(sectionRef, {
          title: section.title,
          description: section.description,
          color: section.color,
          iconName: section.iconName,
          updatedAt: serverTimestamp(),
        });

        toast({
          title: "Section updated",
          description: "The section has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error saving section:", error);
      toast({
        title: "Error",
        description: "There was a problem saving the section. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    try {
      // Delete the section
      await deleteDoc(doc(db, "sections", sectionId));

      // Delete all links in the section
      const linksQuery = query(
        collection(db, "links"),
        where("sectionId", "==", sectionId)
      );
      const linksSnapshot = await getDocs(linksQuery);

      const deletePromises = linksSnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      toast({
        title: "Section deleted",
        description:
          "The section and all its resources have been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting section:", error);
      toast({
        title: "Error",
        description: "There was a problem deleting the section. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSectionTitle = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    return section?.title || "Unknown Section";
  };

  // Conditional Rendering for Login Page
  if (loading) {
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DocHub</h1>
                <p className="text-sm text-gray-600">
                  Central Documentation Hub
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user && (
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
              )}

              {user && (
                <Button
                  variant={adminMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const newAdminMode = !adminMode;
                    setAdminMode(newAdminMode);
                    if (typeof window !== "undefined") {
                      if (newAdminMode)
                        localStorage.setItem("docHubAdminMode", "true");
                      else localStorage.removeItem("docHubAdminMode");
                    }
                  }}
                  className={`hidden sm:flex items-center transition-colors duration-200 ${
                    adminMode
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : ""
                  }`}
                >
                  {adminMode ? (
                    <ShieldCheck className="w-4 h-4 mr-2" />
                  ) : (
                    <UserCog className="w-4 h-4 mr-2" />
                  )}
                  {adminMode ? "Admin Mode" : "User Mode"}
                </Button>
              )}
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden sm:flex"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-600 mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-700">
              Loading your hub...
            </h3>
            <p className="text-gray-500 mt-2">
              Fetching your sections and resources
            </p>
          </div>
        ) : (
          <>
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
                      onClick={handleAddSection}
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

            {/* Mobile Admin Toggle and Logout */}
            <div className="sm:hidden mb-6 space-y-3">
              {user && (
                <Button
                  variant={adminMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const newAdminMode = !adminMode;
                    setAdminMode(newAdminMode);
                    if (typeof window !== "undefined") {
                      if (newAdminMode)
                        localStorage.setItem("docHubAdminMode", "true");
                      else localStorage.removeItem("docHubAdminMode");
                    }
                  }}
                  className={`w-full flex items-center justify-center transition-colors duration-200 ${
                    adminMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""
                  }`}
                >
                  {adminMode ? (
                    <ShieldCheck className="w-4 h-4 mr-2" />
                  ) : (
                    <UserCog className="w-4 h-4 mr-2" />
                  )}
                  {adminMode ? "Admin Mode Active" : "Switch to Admin Mode"}
                </Button>
              )}

              {user && adminMode && (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAdminFeaturesModalOpen(true)}
                    className="w-full flex items-center h-10 justify-center bg-cyan-800 text-white border-0 focus:ring-0 focus:outline-none shadow-none hover:bg-cyan-900 hover:text-white"
                    style={{ backgroundColor: "#155e75" }}
                  >
                    <Info className="w-4 h-4 mr-2" />
                    Admin Features
                  </Button>
                  <Button
                    onClick={handleAddSection}
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center h-10 justify-center bg-cyan-800 text-white border-0 focus:ring-0 focus:outline-none shadow-none hover:bg-cyan-900 hover:text-white"
                    style={{ backgroundColor: "#155e75" }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Section
                  </Button>
                </div>
              )}
            </div>

            {/* Sections Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredData.map((section) => (
                <Card
                  key={section.id}
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
                            onClick={() => handleEditSection(section)}
                            className="hidden sm:flex"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSection(section.id)}
                          className="md:hidden"
                        >
                          {isExpanded(section.id) ? (
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
                        onClick={() => handleEditSection(section)}
                        className="sm:hidden w-full mt-2"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Section
                      </Button>
                    )}
                  </CardHeader>

                  <CardContent
                    className={`space-y-3 ${
                      windowWidth < 768 && !isExpanded(section.id)
                        ? "hidden"
                        : "block"
                    }`}
                  >
                    {section.links.map((link) => (
                      <div
                        key={link.id}
                        className="group p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => openLink(link.url)}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                                {link.title}
                              </h4>
                              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                            </div>

                            {link.description && (
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                {link.description}
                              </p>
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
                              onClick={() => handleEditResource(link, section.id)}
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    {adminMode && (
                      <Button
                        variant="outline"
                        className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400 bg-transparent"
                        onClick={() => handleAddResource(section.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Resource
                      </Button>
                    )}
                  </CardContent>
                </Card>
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

            {/* Footer */}
            <footer className="mt-16 py-8 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Built for startup teams • Last updated:{" "}
                  {new Date().toLocaleDateString()}
                </p>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Badge variant="outline" className="text-xs">
                    {sections.reduce(
                      (acc, section) => acc + section.links.length,
                      0
                    )}{" "}
                    Total Resources
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {sections.length} Categories
                  </Badge>
                </div>
              </div>
            </footer>
          </>
        )}
      </main>

      {/* Modals */}
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
