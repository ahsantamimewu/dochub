"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Save, Palette } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { iconMap, availableIcons, getIconByName } from "@/lib/icons";

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
  iconName: string; // Added iconName property
  description: string;
  color: string;
  links: DocumentLink[];
}

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  section?: Section;
  onSave: (section: Section) => void;
  onDelete?: (sectionId: string) => void;
}

const colorOptions = [
  { name: "Blue", value: "bg-blue-50 border-blue-200 hover:bg-blue-100" },
  {
    name: "Purple",
    value: "bg-purple-50 border-purple-200 hover:bg-purple-100",
  },
  { name: "Green", value: "bg-green-50 border-green-200 hover:bg-green-100" },
  {
    name: "Yellow",
    value: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
  },
  {
    name: "Orange",
    value: "bg-orange-50 border-orange-200 hover:bg-orange-100",
  },
  { name: "Red", value: "bg-red-50 border-red-200 hover:bg-red-100" },
  { name: "Gray", value: "bg-gray-50 border-gray-200 hover:bg-gray-100" },
  {
    name: "Indigo",
    value: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
  },
];

export function SectionModal({
  isOpen,
  onClose,
  mode,
  section,
  onSave,
  onDelete,
}: SectionModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    color: colorOptions[0].value,
    iconName: "FolderOpen", // Default icon
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (section && mode === "edit") {
      setFormData({
        title: section.title || "",
        description: section.description || "",
        color: section.color || colorOptions[0].value,
        iconName: section.iconName || "FolderOpen",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        color: colorOptions[0].value,
        iconName: "FolderOpen",
      });
    }
  }, [section, mode, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    return formData.title.trim() && formData.description.trim();
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const sectionData: Section = {
        id: section?.id || `section-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        color: formData.color,
        iconName: formData.iconName,
        icon: getIconByName(formData.iconName),
        links: section?.links || [],
      };

      onSave(sectionData);
      onClose();
    } catch (error) {
      console.error("Error saving section:", error);
      // Error handling
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
      console.error("Error deleting section:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] p-0">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle>
              {mode === "add" ? "Add New Section" : "Edit Section"}
            </DialogTitle>
            <DialogDescription>
              {mode === "add"
                ? "Create a new section to organize your links and resources."
                : "Update the details of this section."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Section Title</Label>
              <Input
                id="title"
                placeholder="e.g. Research Documents"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Briefly describe this section..."
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="icon">Icon</Label>
                <CustomDropdown
                  options={availableIcons.map((iconName) => ({
                    label: iconName,
                    value: iconName,
                    icon: getIconByName(iconName),
                  }))}
                  value={formData.iconName}
                  onChange={(value) => handleInputChange("iconName", value)}
                  placeholder="Select an icon"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="color">Color</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => handleInputChange("color", value)}
                >
                  <SelectTrigger id="color">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded ${
                              color.value.split(" ")[0]
                            }`}
                          ></div>
                          <span>{color.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-2">
              <Label>Preview</Label>
              <div className={`mt-2 p-4 rounded-lg border-2 ${formData.color}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {getIconByName(formData.iconName)}
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {formData.title || "Section Title"}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {formData.description ||
                        "Section description will appear here..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2">
            {mode === "edit" && onDelete && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
                className="w-full sm:w-auto order-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading || !validateForm()}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
