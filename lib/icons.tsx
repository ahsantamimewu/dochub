'use client';

import React from 'react';
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
  Briefcase,
  Calendar,
  Code,
  FileText,
  Gift,
  Globe,
  Home,
  Mail,
  Map,
  Music,
  Phone,
  PieChart,
  Star,
  Tag,
  Terminal,
  Truck,
  Video,
  Zap,
  // Import Image renamed as ImageIcon to avoid conflicts
  Image as ImageIcon
} from 'lucide-react';

// Map of icon names to React components
export const iconMap: Record<string, React.ReactNode> = {
  MessageCircle: <MessageCircle className="w-5 h-5" />,
  FlaskConical: <FlaskConical className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  DollarSign: <DollarSign className="w-5 h-5" />,
  ShoppingCart: <ShoppingCart className="w-5 h-5" />,
  FolderOpen: <FolderOpen className="w-5 h-5" />,
  ExternalLink: <ExternalLink className="w-5 h-5" />,
  Edit3: <Edit3 className="w-5 h-5" />,
  Plus: <Plus className="w-5 h-5" />,
  ChevronDown: <ChevronDown className="w-5 h-5" />,
  ChevronUp: <ChevronUp className="w-5 h-5" />,
  Settings: <Settings className="w-5 h-5" />,
  LogOut: <LogOut className="w-5 h-5" />,
  UserCog: <UserCog className="w-5 h-5" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5" />,
  Info: <Info className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
  Calendar: <Calendar className="w-5 h-5" />,
  Code: <Code className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  Gift: <Gift className="w-5 h-5" />,
  Globe: <Globe className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  // Using ImageIcon instead of Image
  ImageIcon: <ImageIcon className="w-5 h-5" />,
  Mail: <Mail className="w-5 h-5" />,
  Map: <Map className="w-5 h-5" />,
  Music: <Music className="w-5 h-5" />,
  Phone: <Phone className="w-5 h-5" />,
  PieChart: <PieChart className="w-5 h-5" />,
  Search: <Search className="w-5 h-5" />,
  Star: <Star className="w-5 h-5" />,
  Tag: <Tag className="w-5 h-5" />,
  Terminal: <Terminal className="w-5 h-5" />,
  Truck: <Truck className="w-5 h-5" />,
  Video: <Video className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
};

// Function to get icon by name
export const getIconByName = (name: string): React.ReactNode => {
  return iconMap[name] || <FolderOpen className="w-5 h-5" />;
};

// List of all available icons for selection
export const availableIcons = Object.keys(iconMap);
