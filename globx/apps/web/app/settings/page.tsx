"use client";

import { useSession } from "next-auth/react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signOut } from "next-auth/react";
import { User, Shield, Bell, Key, LogOut } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">Settings</h1>
          <p className="text-text-secondary">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-bg-secondary border border-border rounded-2xl p-4 space-y-2">
              <button className="w-full text-left px-4 py-2 rounded-lg bg-accent-primary/20 text-accent-primary font-medium">
                Profile
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-bg-tertiary text-text-secondary transition-colors">
                Security
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-bg-tertiary text-text-secondary transition-colors">
                Notifications
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-bg-tertiary text-text-secondary transition-colors">
                API Keys
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Section */}
            <div className="bg-bg-secondary border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="h-5 w-5 text-accent-primary" />
                <h2 className="text-xl font-semibold text-text-primary">Profile</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-text-secondary mb-2 block">
                    Display Name
                  </Label>
                  <Input
                    id="name"
                    defaultValue={session?.user?.name || ""}
                    className="bg-bg-tertiary border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-text-secondary mb-2 block">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={session?.user?.email || ""}
                    disabled
                    className="bg-bg-tertiary border-border text-text-muted"
                  />
                  <p className="text-xs text-text-muted mt-1">Email cannot be changed</p>
                </div>

                <Button className="bg-accent-primary hover:bg-accent-light text-white">
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-bg-secondary border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-5 w-5 text-accent-primary" />
                <h2 className="text-xl font-semibold text-text-primary">Security</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" className="text-sm font-medium text-text-secondary mb-2 block">
                    Current Password
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    className="bg-bg-tertiary border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword" className="text-sm font-medium text-text-secondary mb-2 block">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    className="bg-bg-tertiary border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-text-secondary mb-2 block">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="bg-bg-tertiary border-border"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-bg-tertiary rounded-xl">
                  <div>
                    <div className="font-medium text-text-primary">Two-Factor Authentication</div>
                    <div className="text-sm text-text-secondary">Add an extra layer of security</div>
                  </div>
                  <Button variant="outline" className="border-border">
                    Enable
                  </Button>
                </div>

                <Button className="bg-accent-primary hover:bg-accent-light text-white">
                  Update Password
                </Button>
              </div>
            </div>

            {/* Sign Out */}
            <div className="bg-bg-secondary border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">Sign Out</div>
                  <div className="text-sm text-text-secondary">Sign out of your account</div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="border-accent-sell text-accent-sell hover:bg-accent-sell/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
