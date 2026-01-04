import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Common countries for the platform
const COUNTRIES = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'IN', name: 'India' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'AU', name: 'Australia' },
];

interface TaskLocationSelectorProps {
  locationType: string;
  allowedCountries: string[];
  onLocationTypeChange: (type: string) => void;
  onCountriesChange: (countries: string[]) => void;
}

export const TaskLocationSelector: React.FC<TaskLocationSelectorProps> = ({
  locationType,
  allowedCountries,
  onLocationTypeChange,
  onCountriesChange
}) => {
  const handleAddCountry = (countryCode: string) => {
    if (!allowedCountries.includes(countryCode)) {
      onCountriesChange([...allowedCountries, countryCode]);
    }
  };

  const handleRemoveCountry = (countryCode: string) => {
    onCountriesChange(allowedCountries.filter(c => c !== countryCode));
  };

  const getCountryName = (code: string) => {
    return COUNTRIES.find(c => c.code === code)?.name || code;
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        <Label className="font-medium">Location Targeting</Label>
      </div>
      
      <div>
        <Label htmlFor="locationType" className="text-sm">Target Audience Location</Label>
        <Select value={locationType} onValueChange={onLocationTypeChange}>
          <SelectTrigger id="locationType" className="mt-1">
            <SelectValue placeholder="Select location type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="global">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Global (All countries)
              </div>
            </SelectItem>
            <SelectItem value="specific">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Specific Countries
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {locationType === 'specific' && (
        <div className="space-y-3">
          <div>
            <Label className="text-sm">Add Countries</Label>
            <Select onValueChange={handleAddCountry}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a country to add" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.filter(c => !allowedCountries.includes(c.code)).map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {allowedCountries.length > 0 && (
            <div>
              <Label className="text-sm mb-2 block">Selected Countries</Label>
              <div className="flex flex-wrap gap-2">
                {allowedCountries.map((code) => (
                  <Badge
                    key={code}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    {getCountryName(code)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive/20"
                      onClick={() => handleRemoveCountry(code)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {allowedCountries.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No countries selected. Add at least one country for location targeting.
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {locationType === 'global' 
          ? 'Task will be visible to users from all countries'
          : `Task will only be visible to users from: ${allowedCountries.length > 0 ? allowedCountries.map(getCountryName).join(', ') : 'no countries selected'}`
        }
      </p>
    </div>
  );
};
