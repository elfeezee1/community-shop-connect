import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MessageCircle, FileText } from "lucide-react";

export default function VendorSupport() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Vendor Support</h1>
          <p className="text-muted-foreground">Get help with your vendor account and store management</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="Enter your issue subject" />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea placeholder="Describe your issue in detail" rows={4} />
              </div>
              <Button className="w-full">Send Message</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">vendor-support@ecomance.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Documentation</p>
                  <p className="text-sm text-muted-foreground">View vendor guides</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">How do I update my product listings?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Go to your Vendor Dashboard and click on the product you want to edit. Make your changes and click save.
              </p>
            </div>
            <div>
              <h3 className="font-medium">How do I process orders?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Orders appear in your dashboard. You can update order status and manage fulfillment from there.
              </p>
            </div>
            <div>
              <h3 className="font-medium">How do I get paid?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Payments are processed weekly and transferred to your registered bank account.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}