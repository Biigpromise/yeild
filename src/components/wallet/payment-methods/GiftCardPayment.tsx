
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface GiftCardPaymentProps {
  onDetailsChange: (details: any) => void;
  details: any;
  userPoints: number;
}

interface GiftCard {
  id: string;
  provider: string;
  denomination: number;
  points_required: number;
  stock_quantity: number;
  image_url: string;
}

export const GiftCardPayment = ({ onDetailsChange, details, userPoints }: GiftCardPaymentProps) => {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGiftCards();
  }, []);

  const loadGiftCards = async () => {
    try {
      const { data, error } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('is_active', true)
        .order('provider, denomination');
      
      if (!error && data) {
        setGiftCards(data);
      }
    } catch (error) {
      console.error('Error loading gift cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGiftCard = (giftCard: GiftCard) => {
    onDetailsChange({
      ...details,
      giftCardId: giftCard.id,
      giftCardProvider: giftCard.provider,
      giftCardDenomination: giftCard.denomination,
      amount: giftCard.points_required
    });
  };

  const groupedCards = giftCards.reduce((acc, card) => {
    if (!acc[card.provider]) {
      acc[card.provider] = [];
    }
    acc[card.provider].push(card);
    return acc;
  }, {} as Record<string, GiftCard[]>);

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-20 bg-gray-200 rounded"></div>
      ))}
    </div>;
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedCards).map(([provider, cards]) => (
        <div key={provider}>
          <h4 className="font-semibold mb-3 capitalize">
            {provider.replace('_', ' ')} Gift Cards
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cards.map((card) => {
              const canAfford = userPoints >= card.points_required;
              const isSelected = details.giftCardId === card.id;
              
              return (
                <Card 
                  key={card.id}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  } ${!canAfford ? 'opacity-50' : 'hover:shadow-md'}`}
                  onClick={() => canAfford && handleSelectGiftCard(card)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={card.image_url} 
                        alt={`${card.provider} gift card`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <h5 className="font-medium">${card.denomination}</h5>
                      <p className="text-sm text-muted-foreground">
                        {card.points_required.toLocaleString()} points
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant={canAfford ? "default" : "secondary"}>
                          {canAfford ? "Available" : "Insufficient Points"}
                        </Badge>
                        {card.stock_quantity && (
                          <span className="text-xs text-muted-foreground">
                            Stock: {card.stock_quantity}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Gift cards are delivered digitally via email within 1-2 business days. 
          Make sure your email address is up to date in your profile.
        </p>
      </div>
    </div>
  );
};
