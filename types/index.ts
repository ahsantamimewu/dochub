import React from "react";

export interface DocumentLink {
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

export interface Section {
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
