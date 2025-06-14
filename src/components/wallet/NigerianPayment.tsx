
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Banknote, CreditCard, Smartphone, Building2 } from "lucide-react";
import { paystackService } from "@/services/paystackService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const pointPackages = [
  { points: 1000, price: 100, popular: false },
  { points: 2500, price: 225, popular: true, savings: "10% off" },
  { points: 5000, price: 400, popular: false, savings: "20% off" },
  { points: 10000, price: 700, popular: false, savings: "30% off" },
];

export const NigerianPayment = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<number | null>(null);

  const handlePurchase = async (packageIndex: number, points: number, price: number) => {
    if (!user?.email) {
      toast.error("Please log in to purchase points");
      return;
    }

    setLoading(packageIndex);
    try {
      const reference = `points_${user.id}_${Date.now()}`;
      
      const response = await paystackService.initializePayment(
        user.email,
        price,
        reference
      );

      if (response.status && response.data.authorization_url) {
        // Open Paystack checkout in new tab
        window.open(response.data.authorization_url, '_blank');
        toast.success("Redirecting to payment...");
      } else {
        throw new Error("Failed to initialize payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initialize payment. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Buy Points with Nigerian Naira
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pointPackages.map((pkg, index) => (
              <Card key={index} className={`relative ${pkg.popular ? 'ring-2 ring-blue-500' : ''}`}>
                {pkg.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {pkg.points.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">Points</div>
                  
                  <div className="text-xl font-semibold mb-1">
                    {paystackService.formatNaira(pkg.price)}
                  </div>
                  
                  {pkg.savings && (
                    <Badge variant="outline" className="text-green-600 mb-3">
                      {pkg.savings}
                    </Badge>
                  )}
                  
                  <Button
                    className="w-full"
                    onClick={() => handlePurchase(index, pkg.points, pkg.price)}
                    disabled={loading === index}
                    variant={pkg.popular ? "default" : "outline"}
                  >
                    {loading === index ? "Processing..." : "Buy Now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Accepted Payment Methods
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-500" />
                Debit/Credit Cards
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-green-500" />
                Bank Transfer
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-purple-500" />
                USSD
              </div>
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-orange-500" />
                QR Code
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            <p>• Payments are processed securely through Paystack</p>
            <p>• Points are added to your account instantly upon successful payment</p>
            <p>• All prices are in Nigerian Naira (₦)</p>
            <p>• Contact support if you experience any issues</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
