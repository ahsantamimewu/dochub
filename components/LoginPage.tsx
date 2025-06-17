'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LogIn, ShieldCheck } from 'lucide-react'; // Changed icon

interface LoginPageProps {
  onLogin: (username?: string, password?: string) => void; // Updated to accept credentials
  loginError: string | null; // To display login errors
}

export default function LoginPage({ onLogin, loginError }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Welcome to DocHub</CardTitle>
          <CardDescription className="text-md text-gray-600 pt-2">
            Please enter your credentials to access the hub.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full"
              />
            </div>
            {loginError && (
              <p className="text-sm text-red-600 text-center">{loginError}</p>
            )}
            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:-translate-y-0.5"
            >
              <LogIn className="w-5 h-5 mr-3" />
              Login
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-6 text-center">
            For demo purposes, use username: admin, password: admin.
          </p>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          DocHub - Your Centralized Documentation Hub
        </p>
      </footer>
    </div>
  );
}
