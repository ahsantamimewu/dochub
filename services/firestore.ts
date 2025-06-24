import { db } from '@/firebase/config';
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
} from 'firebase/firestore';
import { DocumentLink, Section } from '@/types';

// Resource CRUD operations
export const addResource = (resource: Omit<DocumentLink, 'id'>, sectionId: string, userId: string) => {
  return addDoc(collection(db, 'links'), {
    ...resource,
    sectionId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
  });
};

export const updateResource = (resource: DocumentLink) => {
  const resourceRef = doc(db, 'links', resource.id);
  return updateDoc(resourceRef, {
    title: resource.title,
    url: resource.url,
    description: resource.description || '',
    tags: resource.tags || [],
    updatedAt: serverTimestamp(),
  });
};

export const deleteResource = (resourceId: string) => {
  return deleteDoc(doc(db, 'links', resourceId));
};

// Section CRUD operations
export const addSection = (section: Omit<Section, 'id' | 'links'>, userId: string) => {
  return addDoc(collection(db, 'sections'), {
    ...section,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
  });
};

export const updateSection = (section: Section) => {
  const sectionRef = doc(db, 'sections', section.id);
  return updateDoc(sectionRef, {
    title: section.title,
    description: section.description,
    color: section.color,
    iconName: section.iconName,
    updatedAt: serverTimestamp(),
  });
};

export const deleteSection = async (sectionId: string) => {
  // First, delete all links within the section
  const linksQuery = query(collection(db, 'links'), where('sectionId', '==', sectionId));
  const linksSnapshot = await getDocs(linksQuery);
  const deletePromises = linksSnapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  // Then, delete the section itself
  return deleteDoc(doc(db, 'sections', sectionId));
};
