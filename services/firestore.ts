import { db } from "@/firebase/config";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { DocumentLink, Section } from "@/types";

// Resource CRUD operations
export const addResource = (
  resource: Omit<DocumentLink, "id">,
  sectionId: string,
  userId: string
) => {
  return addDoc(collection(db, "links"), {
    ...resource,
    sectionId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
  });
};

export const updateResource = (resource: DocumentLink) => {
  const resourceRef = doc(db, "links", resource.id);
  
  // Base update data
  const updateData: any = {
    title: resource.title,
    type: resource.type,
    description: resource.description || "",
    tags: resource.tags || [],
    updatedAt: serverTimestamp(),
  };

  // Add type-specific fields
  if (resource.type === 'file' && resource.url) {
    updateData.url = resource.url;
  } else if (resource.type === 'table' && resource.tableData) {
    updateData.tableData = resource.tableData;
  } else if (resource.type === 'notes' && resource.content) {
    updateData.content = resource.content;
  }

  return updateDoc(resourceRef, updateData);
};

export const deleteResource = (resourceId: string) => {
  return deleteDoc(doc(db, "links", resourceId));
};

// Section CRUD operations
export const addSection = (
  section: {
    title: string;
    description: string;
    color: string;
    iconName: string;
  },
  userId: string
) => {
  return addDoc(collection(db, "sections"), {
    ...section,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
  });
};

export const updateSection = (section: Section) => {
  const sectionRef = doc(db, "sections", section.id);
  return updateDoc(sectionRef, {
    title: section.title,
    description: section.description,
    color: section.color,
    iconName: section.iconName,
    // Note: we don't save the 'icon' property as it's a React component
    updatedAt: serverTimestamp(),
  });
};

export const deleteSection = async (sectionId: string) => {
  // First, delete all links within the section
  const linksQuery = query(
    collection(db, "links"),
    where("sectionId", "==", sectionId)
  );
  const linksSnapshot = await getDocs(linksQuery);
  const deletePromises = linksSnapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  // Then, delete the section itself
  return deleteDoc(doc(db, "sections", sectionId));
};
