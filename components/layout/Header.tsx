"use client";

import {
  Menu,
  FolderOpen,
  LogOut,
  Search,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  adminMode: boolean;
  setAdminMode: (mode: boolean) => void;
  handleLogout: () => void;
  user: any;
}

export function Header({
  searchTerm,
  setSearchTerm,
  adminMode,
  setAdminMode,
  handleLogout,
  user,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Image
                src="/icons/logo.png"
                alt="DocHub Logo"
                width={32}
                height={32}
                className="rounded"
              />
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <h1 className="text-xl font-bold text-gray-900">DocHub</h1>
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search"
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <Button
                variant={adminMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const newAdminMode = !adminMode;
                  setAdminMode(newAdminMode);
                  if (typeof window !== "undefined") {
                    if (newAdminMode)
                      localStorage.setItem("docHubAdminMode", "true");
                    else localStorage.removeItem("docHubAdminMode");
                  }
                }}
                className={`flex items-center transition-colors duration-200 ${
                  adminMode
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : ""
                }`}
              >
                {adminMode ? (
                  <ShieldCheck className="w-4 h-4 mr-2" />
                ) : (
                  <UserCog className="w-4 h-4 mr-2" />
                )}
                {adminMode ? "Admin" : "User"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="ml-3"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="grid gap-4 py-4">
                  <Button
                    variant={adminMode ? "default" : "outline"}
                    onClick={() => {
                      const newAdminMode = !adminMode;
                      setAdminMode(newAdminMode);
                      if (typeof window !== "undefined") {
                        if (newAdminMode)
                          localStorage.setItem("docHubAdminMode", "true");
                        else localStorage.removeItem("docHubAdminMode");
                      }
                    }}
                    className="flex items-center justify-start gap-2"
                  >
                    {adminMode ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : (
                      <UserCog className="w-5 h-5" />
                    )}
                    <span>{adminMode ? "Admin Mode" : "User Mode"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="flex items-center justify-start gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
