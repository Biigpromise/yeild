
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Banknote, CreditCard, Smartphone, Building2, Globe } from "lucide-react";
import { currencyService, SupportedCountry } from "@/services/currencyService";
import { paystackService } from "@/services/paystackService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const pointPackages = [
  { points: 1000, usdPrice: 1, popular: false },
  { points: 2500, usdPrice: 2.25, popular: true, savings: "10% off" },
  { points: 5000, usdPrice: 4, popular: false, savings: "20% off" },
  { points: 10000, usdPrice: 7, popular: false, savings: "30% off" },
];

export const MultiCurrencyPayment = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [supportedCountries, setSupportedCountries] = useState<SupportedCountry[]>([]);
  const [currentCountry, setCurrentCountry] = useState<SupportedCountry | null>(null);

  useEffect(() => {
    const countries = currencyService.getSupportedCountries();
    setSupportedCountries(countries);
    
    // Auto-detect user's country (defaulting to Nigeria)
    currencyService.getUserCountryFromIP().then(countryCode => {
      const country = countries.find(c => c.code === countryCode);
      if (country) {
        setSelectedCountry(countryCode);
        setCurrentCountry(country);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const country = supportedCountries.find(c => c.code === selectedCountry);
      setCurrentCountry(country || null);
    }
  }, [selectedCountry, supportedCountries]);

  const handlePurchase = async (packageIndex: number, points: number, usdPrice: number) => {
    if (!user?.email) {
      toast.error("Please log in to purchase points");
      return;
    }

    if (!currentCountry) {
      toast.error("Please select your country");
      return;
    }

    setLoading(packageIndex);
    try {
      const localPrice = currencyService.convertUSDToLocal(usdPrice, currentCountry.currency.code);
      const reference = `points_${user.id}_${Date.now()}`;
      
      if (currentCountry.paymentProvider === 'paystack') {
        const response = await paystackService.initializePayment(
          user.email,
          localPrice,
          reference
        );

        if (response.status && response.data.authorization_url) {
          window.open(response.data.authorization_url, '_blank');
          toast.success("Redirecting to payment...");
        } else {
          throw new Error("Failed to initialize payment");
        }
      } else {
        // For other providers (Stripe, PayPal), we'd implement similar logic
        toast.info(`${currentCountry.paymentProvider} integration coming soon for ${currentCountry.name}`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initialize payment. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  if (!currentCountry) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Select Your Country
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Choose your country to see pricing" />
            </SelectTrigger>
            <SelectContent>
              {supportedCountries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name} ({country.currency.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Buy Points - {currentCountry.name} ({currentCountry.currency.code})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedCountries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name} ({country.currency.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline">
              1000 points = {currencyService.formatCurrency(currencyService.convertUSDToLocal(1, currentCountry.currency.code), currentCountry.currency.code)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pointPackages.map((pkg, index) => {
              const localPrice = currencyService.convertUSDToLocal(pkg.usdPrice, currentCountry.currency.code);
              
              return (
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
                      {currencyService.formatCurrency(localPrice, currentCountry.currency.code)}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      ≈ ${pkg.usdPrice.toFixed(2)} USD
                    </div>
                    
                    {pkg.savings && (
                      <Badge variant="outline" className="text-green-600 mb-3">
                        {pkg.savings}
                      </Badge>
                    )}
                    
                    <Button
                      className="w-full"
                      onClick={() => handlePurchase(index, pkg.points, pkg.usdPrice)}
                      disabled={loading === index}
                      variant={pkg.popular ? "default" : "outline"}
                    >
                      {loading === index ? "Processing..." : "Buy Now"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Available Payment Methods for {currentCountry.name}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {currentCountry.currency.withdrawalMethods.includes('bank_transfer') && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-green-500" />
                  Bank Transfer
                </div>
              )}
              {(currentCountry.paymentProvider === 'paystack' || currentCountry.paymentProvider === 'stripe') && (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  Cards
                </div>
              )}
              {currentCountry.currency.code === 'NGN' && (
                <>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-purple-500" />
                    USSD
                  </div>
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-orange-500" />
                    QR Code
                  </div>
                </>
              )}
              {currentCountry.currency.withdrawalMethods.includes('mpesa') && (
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-green-600" />
                  M-Pesa
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            <p>• Payments are processed securely through {currentCountry.paymentProvider}</p>
            <p>• Points are added to your account instantly upon successful payment</p>
            <p>• All prices shown in {currentCountry.currency.name} ({currentCountry.currency.code})</p>
            <p>• Universal points system - earn and spend globally!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
