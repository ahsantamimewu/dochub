"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ListChecks,
  PlusCircle,
  Edit,
  Trash2,
  Settings2,
  ShieldAlert,
} from "lucide-react";

interface AdminFeature {
  icon: React.ReactNode;
  text: string;
  description: string;
}

const adminFeaturesList: AdminFeature[] = [
  {
    icon: <PlusCircle className="w-5 h-5 text-blue-500" />,
    text: "Add New Sections",
    description: "Organize documentation by creating new top-level categories.",
  },
  {
    icon: <Edit className="w-5 h-5 text-yellow-500" />,
    text: "Edit Existing Sections",
    description: "Modify titles, icons, and descriptions of sections.",
  },
  {
    icon: <Trash2 className="w-5 h-5 text-red-500" />,
    text: "Delete Sections",
    description: "Remove sections that are no longer relevant.",
  },
  {
    icon: <PlusCircle className="w-5 h-5 text-green-500" />,
    text: "Add New Resources", // Changed from Add New Sections to avoid duplicate text
    description: "Add new documents, links, or files within sections.",
  },
  {
    icon: <Edit className="w-5 h-5 text-purple-500" />,
    text: "Edit Existing Resources", // Changed from Edit Existing Sections
    description:
      "Update details of existing resources like titles, URLs, and tags.",
  },
  {
    icon: <Trash2 className="w-5 h-5 text-pink-500" />,
    text: "Delete Resources", // Changed from Delete Sections
    description: "Remove outdated or incorrect resources from sections.",
  },
  {
    icon: <Settings2 className="w-5 h-5 text-indigo-500" />,
    text: "Manage Content Structure",
    description:
      "Overall control over the organization and presentation of documentation.",
  },
];

interface AdminFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminFeaturesModal({
  isOpen,
  onClose,
}: AdminFeaturesModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl font-semibold">
            <ShieldAlert className="w-7 h-7 mr-3 text-indigo-600" />
            Admin Mode Capabilities
          </DialogTitle>
          <DialogDescription className="mt-2 text-gray-600">
            As an administrator, you have the following content management
            privileges:
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {adminFeaturesList.map((feature, index) => (
            <div
              key={index}
              className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-shrink-0 mr-3 mt-1">{feature.icon}</div>
              <div>
                <h4 className="font-medium text-gray-800">{feature.text}</h4>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="mt-2">
          <Button onClick={onClose} variant="outline">
            Got it!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
