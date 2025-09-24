import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Store, Mail, Phone, MapPin, Globe, Camera } from "lucide-react";

export default function VendorProfile() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Vendor Profile</h1>
          <p className="text-muted-foreground">Manage your vendor account and business information</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src="" />
                <AvatarFallback>
                  <Store className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                <Camera className="w-4 h-4 mr-2" />
                Change Photo
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Business Name</label>
                  <Input placeholder="Your business name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Owner Name</label>
                  <Input placeholder="Your full name" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Business Description</label>
                <Textarea placeholder="Describe your business" rows={3} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="business@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input placeholder="+1 (555) 123-4567" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Business Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Street Address</label>
              <Input placeholder="123 Business Street" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">City</label>
                <Input placeholder="City" />
              </div>
              <div>
                <label className="text-sm font-medium">State</label>
                <Input placeholder="State" />
              </div>
              <div>
                <label className="text-sm font-medium">ZIP Code</label>
                <Input placeholder="12345" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Verification Status</p>
                <p className="text-sm text-muted-foreground">Your account verification status</p>
              </div>
              <Badge variant="secondary">Verified</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-6">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}