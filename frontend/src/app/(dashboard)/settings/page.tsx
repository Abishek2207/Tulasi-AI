"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/ModeToggle";
import { User, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6 max-w-3xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account and preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" /> Profile
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-xl font-bold text-primary">
                            U
                        </div>
                        <div>
                            <p className="font-medium">User Name</p>
                            <p className="text-sm text-muted-foreground">user@example.com</p>
                        </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        <Input placeholder="Display Name" defaultValue="User" />
                        <Input placeholder="Email" type="email" defaultValue="user@example.com" />
                    </div>
                    <Button>Save Changes</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Palette className="h-4 w-4" /> Appearance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Dark Mode</p>
                            <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
                        </div>
                        <ModeToggle />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Bell className="h-4 w-4" /> Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Notification settings will be available once the backend is connected.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4" /> Security
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button variant="outline">Change Password</Button>
                    <Button variant="destructive">Delete Account</Button>
                </CardContent>
            </Card>
        </div>
    );
}
