import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  DocumentData,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from './config';

// Types
export interface DocumentLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags?: string[];
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

export interface Section {
  id: string;
  title: string;
  iconName: string; // Store icon name instead of React node
  description: string;
  color: string;
  order?: number;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

// Sections
export const getSections = async () => {
  try {
    const sectionsQuery = query(collection(db, 'sections'), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(sectionsQuery);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as Section;
    });
  } catch (error) {
    console.error('Error getting sections:', error);
    throw error;
  }
};

export const addSection = async (section: Omit<Section, 'id'>, userId: string) => {
  try {
    // Get the current count of sections for ordering
    const sectionsQuery = query(collection(db, 'sections'));
    const querySnapshot = await getDocs(sectionsQuery);
    const order = querySnapshot.size;

    const docRef = await addDoc(collection(db, 'sections'), {
      ...section,
      order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId
    });
    
    return {
      id: docRef.id,
      ...section
    };
  } catch (error) {
    console.error('Error adding section:', error);
    throw error;
  }
};

export const updateSection = async (id: string, section: Partial<Section>) => {
  try {
    const sectionRef = doc(db, 'sections', id);
    await updateDoc(sectionRef, {
      ...section,
      updatedAt: serverTimestamp()
    });
    
    return {
      id,
      ...section
    };
  } catch (error) {
    console.error('Error updating section:', error);
    throw error;
  }
};

export const deleteSection = async (id: string) => {
  try {
    // Delete the section
    await deleteDoc(doc(db, 'sections', id));
    
    // Delete all links in the section
    const linksQuery = query(collection(db, 'links'), where('sectionId', '==', id));
    const querySnapshot = await getDocs(linksQuery);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    return id;
  } catch (error) {
    console.error('Error deleting section:', error);
    throw error;
  }
};

// Links
export const getLinks = async (sectionId?: string) => {
  try {
    let linksQuery;
    
    if (sectionId) {
      linksQuery = query(
        collection(db, 'links'), 
        where('sectionId', '==', sectionId),
        orderBy('title', 'asc')
      );
    } else {
      linksQuery = query(collection(db, 'links'), orderBy('title', 'asc'));
    }
    
    const querySnapshot = await getDocs(linksQuery);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as DocumentLink;
    });
  } catch (error) {
    console.error('Error getting links:', error);
    throw error;
  }
};

export const addLink = async (link: Omit<DocumentLink, 'id'> & { sectionId: string }, userId: string) => {
  try {
    const docRef = await addDoc(collection(db, 'links'), {
      ...link,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId
    });
    
    return {
      id: docRef.id,
      ...link
    };
  } catch (error) {
    console.error('Error adding link:', error);
    throw error;
  }
};

export const updateLink = async (id: string, link: Partial<DocumentLink>) => {
  try {
    const linkRef = doc(db, 'links', id);
    await updateDoc(linkRef, {
      ...link,
      updatedAt: serverTimestamp()
    });
    
    return {
      id,
      ...link
    };
  } catch (error) {
    console.error('Error updating link:', error);
    throw error;
  }
};

export const deleteLink = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'links', id));
    return id;
  } catch (error) {
    console.error('Error deleting link:', error);
    throw error;
  }
};

// Users
export const createUserProfile = async (uid: string, data: any) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...data,
      createdAt: serverTimestamp(),
      isAdmin: false, // Default to non-admin
    });
    return uid;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, data: any) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return uid;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
