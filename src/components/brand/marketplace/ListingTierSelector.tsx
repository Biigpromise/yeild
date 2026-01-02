import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ListingTierSelectorProps {
  value: 'standard' | 'featured' | 'premium';
  onChange: (value: 'standard' | 'featured' | 'premium') => void;
  daysSelected: number;
}

export function ListingTierSelector({ value, onChange, daysSelected }: ListingTierSelectorProps) {
  const tiers = [
    {
      id: 'standard',
      name: 'Standard',
      price: 2500,
      icon: '📋',
      features: [
        'Basic listing',
        'Normal display order',
        'Standard visibility'
      ]
    },
    {
      id: 'featured',
      name: 'Featured',
      price: 5000,
      icon: '🌟',
      badge: 'Popular',
      features: [
        'Featured badge',
        'Highlighted card with gold border',
        'Priority in search results',
        'Better visibility'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 10000,
      icon: '👑',
      badge: 'Best Value',
      features: [
        'Premium badge',
        'Top 3 fixed positions',
        'Special gradient styling',
        'Animated glow effect',
        'Priority support',
        'Maximum visibility'
      ]
    }
  ];

  const selectedTier = tiers.find(t => t.id === value) || tiers[0];
  const totalCost = selectedTier.price * daysSelected;

  return (
    <div className="space-y-4">
      <div>
        <Label>Select Listing Tier</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Choose the visibility level for your listing
        </p>
      </div>

      <RadioGroup value={value} onValueChange={onChange as (value: string) => void}>
        <div className="grid gap-4 md:grid-cols-3">
          {tiers.map((tier) => {
            const tierTotalCost = tier.price * daysSelected;
            const isSelected = value === tier.id;
            
            return (
              <div
                key={tier.id}
                className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50'
                } ${
                  tier.id === 'featured' ? 'ring-2 ring-yellow-500/20' : ''
                } ${
                  tier.id === 'premium' ? 'ring-2 ring-purple-500/20' : ''
                }`}
                onClick={() => onChange(tier.id as any)}
              >
                {tier.badge && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    {tier.badge}
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <RadioGroupItem value={tier.id} id={tier.id} className="mt-1" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{tier.icon}</span>
                        <div>
                          <p className="font-semibold">{tier.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ₦{tier.price.toLocaleString()}/day
                          </p>
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {daysSelected > 0 && (
                      <div className="pt-3 border-t">
                        <p className="text-sm font-medium">
                          Total: ₦{tierTotalCost.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          for {daysSelected} {daysSelected === 1 ? 'day' : 'days'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </RadioGroup>

      {daysSelected > 0 && (
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">Total Cost</p>
              <p className="text-sm text-muted-foreground">
                {selectedTier.name} tier × {daysSelected} days
              </p>
            </div>
            <p className="text-2xl font-bold">₦{totalCost.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
