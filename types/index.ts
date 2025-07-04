import React from "react";

export type ResourceType = 'file' | 'table' | 'notes';

export interface TableColumn {
  name: string;
  id: string;
}

export interface TableRow {
  id: string;
  data: { [columnId: string]: string };
}

export interface TableData {
  columns: TableColumn[];
  rows: TableRow[];
}

export interface DocumentLink {
  id: string;
  title: string;
  type: ResourceType;
  // For file type
  url?: string;
  // For table type
  tableData?: TableData;
  // For notes type
  content?: string;
  // Common fields
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
