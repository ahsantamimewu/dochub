'use client';

import { FolderOpen, LogOut, Search, ShieldCheck, UserCog } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  adminMode: boolean;
  setAdminMode: (mode: boolean) => void;
  handleLogout: () => void;
  user: any;
}

export function Header({ searchTerm, setSearchTerm, adminMode, setAdminMode, handleLogout, user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DocHub</h1>
                <p className="text-sm text-gray-600">Central Documentation Hub</p>
              </div>
            </div>

            {/* Mobile buttons */}
            {user && (
              <div className="flex sm:hidden items-center gap-2">
                <Button
                  variant={adminMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const newAdminMode = !adminMode;
                    setAdminMode(newAdminMode);
                    if (typeof window !== 'undefined') {
                      if (newAdminMode) localStorage.setItem('docHubAdminMode', 'true');
                      else localStorage.removeItem('docHubAdminMode');
                    }
                  }}
                  className={`flex items-center transition-colors duration-200 ${
                    adminMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''
                  }`}>
                  {adminMode ? <ShieldCheck className="w-4 h-4" /> : <UserCog className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout} className="flex">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
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
                variant={adminMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  const newAdminMode = !adminMode;
                  setAdminMode(newAdminMode);
                  if (typeof window !== 'undefined') {
                    if (newAdminMode) localStorage.setItem('docHubAdminMode', 'true');
                    else localStorage.removeItem('docHubAdminMode');
                  }
                }}
                className={`hidden sm:flex items-center transition-colors duration-200 ${
                  adminMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''
                }`}>
                {adminMode ? <ShieldCheck className="w-4 h-4 mr-2" /> : <UserCog className="w-4 h-4 mr-2" />}
                {adminMode ? 'Admin Mode' : 'User Mode'}
              </Button>
            )}
            {user && (
              <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:flex">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
