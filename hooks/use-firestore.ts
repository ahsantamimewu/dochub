"use client";

import { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { getIconByName } from '@/lib/icons';
import { Section, DocumentLink } from '@/types';

export function useFirestore() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const sectionsQuery = query(collection(db, 'sections'), orderBy('title', 'asc'));
    const unsubscribeSections = onSnapshot(
      sectionsQuery,
      (sectionSnapshot) => {
        setSections((prevSections) => {
          const sectionsFromDB = sectionSnapshot.docs.map((doc) => {
            const data = doc.data();
            const existingSection = prevSections.find((s) => s.id === doc.id);
            return {
              id: doc.id,
              title: data.title || '',
              description: data.description || '',
              color: data.color || 'bg-gray-50 border-gray-200 hover:bg-gray-100',
              iconName: data.iconName || 'FolderOpen',
              icon: getIconByName(data.iconName || 'FolderOpen'),
              links: existingSection ? existingSection.links : [],
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              createdBy: data.createdBy,
            } as Section;
          });
          return sectionsFromDB;
        });
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching sections:', error);
        setSections([]);
        setIsLoading(false);
        toast({
          title: 'Error loading sections',
          description: 'Could not fetch sections. Please try refreshing the page.',
          variant: 'destructive',
        });
      }
    );

    const linksQuery = query(collection(db, 'links'), orderBy('createdAt', 'asc'));
    const unsubscribeLinks = onSnapshot(
      linksQuery,
      (linksSnapshot) => {
        const linksMap: { [key: string]: DocumentLink[] } = {};
        linksSnapshot.forEach((doc) => {
          const linkData = doc.data() as DocumentLink;
          const link = { ...linkData, id: doc.id };
          if (link.sectionId) {
            if (!linksMap[link.sectionId]) {
              linksMap[link.sectionId] = [];
            }
            linksMap[link.sectionId].push(link);
          }
        });

        setSections((prevSections) => {
          return prevSections.map((section) => ({
            ...section,
            links: linksMap[section.id] || [],
          }));
        });
      },
      (error) => {
        console.error('Error fetching links:', error);
        toast({
          title: 'Error loading links',
          description: 'Could not fetch links in real-time. Data may be stale.',
          variant: 'destructive',
        });
      }
    );

    return () => {
      unsubscribeSections();
      unsubscribeLinks();
    };
  }, [user, toast]);

  return { sections, isLoading };
}
