
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bitcoin, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CryptoPaymentProps {
  onDetailsChange: (details: any) => void;
  details: any;
}

const cryptoOptions = [
  { id: 'bitcoin', name: 'Bitcoin (BTC)', symbol: 'BTC', icon: Bitcoin },
  { id: 'ethereum', name: 'Ethereum (ETH)', symbol: 'ETH', icon: Coins },
  { id: 'usdt', name: 'Tether (USDT)', symbol: 'USDT', icon: Coins },
];

const networkOptions = {
  ethereum: ['mainnet', 'polygon'],
  usdt: ['ethereum', 'tron', 'polygon', 'bsc'],
  bitcoin: ['mainnet'],
};

export const CryptoPayment = ({ onDetailsChange, details }: CryptoPaymentProps) => {
  const { user } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSavedAddresses();
  }, []);

  const loadSavedAddresses = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('crypto_addresses')
      .select('*')
      .eq('user_id', user.id);
    
    if (!error && data) {
      setSavedAddresses(data);
    }
  };

  const handleSaveAddress = async () => {
    if (!user || !details.cryptoType || !details.walletAddress) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('crypto_addresses')
        .insert({
          user_id: user.id,
          crypto_type: details.cryptoType,
          wallet_address: details.walletAddress,
          network: details.network || 'mainnet'
        });
      
      if (error) throw error;
      toast.success("Crypto address saved successfully!");
      loadSavedAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoChange = (crypto: string) => {
    onDetailsChange({
      ...details,
      cryptoType: crypto,
      network: networkOptions[crypto as keyof typeof networkOptions]?.[0] || 'mainnet'
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Cryptocurrency</Label>
        <Select value={details.cryptoType} onValueChange={handleCryptoChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select cryptocurrency" />
          </SelectTrigger>
          <SelectContent>
            {cryptoOptions.map((crypto) => {
              const IconComponent = crypto.icon;
              return (
                <SelectItem key={crypto.id} value={crypto.id}>
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    {crypto.name}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {details.cryptoType && networkOptions[details.cryptoType as keyof typeof networkOptions]?.length > 1 && (
        <div>
          <Label>Network</Label>
          <Select 
            value={details.network} 
            onValueChange={(network) => onDetailsChange({...details, network})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              {networkOptions[details.cryptoType as keyof typeof networkOptions]?.map((network) => (
                <SelectItem key={network} value={network}>
                  {network.charAt(0).toUpperCase() + network.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label>Wallet Address</Label>
        <Input
          placeholder="Enter your wallet address"
          value={details.walletAddress || ''}
          onChange={(e) => onDetailsChange({...details, walletAddress: e.target.value})}
        />
        <Button 
          type="button"
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={handleSaveAddress}
          disabled={loading || !details.cryptoType || !details.walletAddress}
        >
          Save Address
        </Button>
      </div>

      {savedAddresses.length > 0 && (
        <div>
          <Label>Saved Addresses</Label>
          <div className="space-y-2">
            {savedAddresses.map((addr) => (
              <Card key={addr.id} className="p-3 cursor-pointer hover:bg-muted/50" 
                    onClick={() => onDetailsChange({
                      ...details, 
                      cryptoType: addr.crypto_type,
                      walletAddress: addr.wallet_address,
                      network: addr.network
                    })}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{addr.crypto_type.toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      {addr.wallet_address.slice(0, 8)}...{addr.wallet_address.slice(-8)}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {addr.network}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Crypto withdrawals are processed within 24 hours. 
          Make sure your wallet address is correct - transactions cannot be reversed.
        </p>
      </div>
    </div>
  );
};
