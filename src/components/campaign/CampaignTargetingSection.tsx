import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Users, MapPin, Heart, Globe } from 'lucide-react';

interface TargetDemographics {
  ageRange: string;
  gender: string;
  location: string[];
  interests: string[];
  languages: string[];
}

interface CampaignTargetingSectionProps {
  targetData: TargetDemographics;
  onTargetDataChange: (data: TargetDemographics) => void;
}

const ageRanges = [
  '13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'
];

const genderOptions = [
  'All', 'Male', 'Female', 'Non-binary', 'Prefer not to specify'
];

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

const commonInterests = [
  'Technology', 'Fashion', 'Food & Dining', 'Travel', 'Sports', 'Music',
  'Movies & TV', 'Books', 'Gaming', 'Fitness', 'Beauty', 'Business',
  'Education', 'Art & Design', 'Photography', 'Cars', 'Real Estate',
  'Health & Wellness', 'Parenting', 'Finance', 'Politics', 'Environment'
];

const languages = [
  'English', 'Hausa', 'Yoruba', 'Igbo', 'Pidgin English', 'Fulfulde',
  'Kanuri', 'Ibibio', 'Tiv', 'Ijaw'
];

export const CampaignTargetingSection: React.FC<CampaignTargetingSectionProps> = ({
  targetData,
  onTargetDataChange
}) => {
  const [newLocation, setNewLocation] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const updateField = (field: keyof TargetDemographics, value: any) => {
    onTargetDataChange({
      ...targetData,
      [field]: value
    });
  };

  const addLocation = () => {
    if (newLocation && !targetData.location.includes(newLocation)) {
      updateField('location', [...targetData.location, newLocation]);
      setNewLocation('');
    }
  };

  const removeLocation = (location: string) => {
    updateField('location', targetData.location.filter(l => l !== location));
  };

  const addInterest = () => {
    if (newInterest && !targetData.interests.includes(newInterest)) {
      updateField('interests', [...targetData.interests, newInterest]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    updateField('interests', targetData.interests.filter(i => i !== interest));
  };

  const addLanguage = () => {
    if (newLanguage && !targetData.languages.includes(newLanguage)) {
      updateField('languages', [...targetData.languages, newLanguage]);
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    updateField('languages', targetData.languages.filter(l => l !== language));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-base font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Age Range *
          </Label>
          <Select value={targetData.ageRange} onValueChange={(value) => updateField('ageRange', value)}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select age range" />
            </SelectTrigger>
            <SelectContent>
              {ageRanges.map((range) => (
                <SelectItem key={range} value={range}>
                  {range} years
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-medium">Gender *</Label>
          <Select value={targetData.gender} onValueChange={(value) => updateField('gender', value)}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {genderOptions.map((gender) => (
                <SelectItem key={gender} value={gender}>
                  {gender}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-base font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Target Locations
        </Label>
        <div className="mt-2 space-y-3">
          <div className="flex gap-2">
            <Select value={newLocation} onValueChange={setNewLocation}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select state/location" />
              </SelectTrigger>
              <SelectContent>
                {nigerianStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" onClick={addLocation} disabled={!newLocation}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {targetData.location.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {targetData.location.map((location) => (
                <Badge key={location} variant="secondary" className="flex items-center gap-1">
                  {location}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeLocation(location)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Select specific states or regions where you want to target participants
        </p>
      </div>

      <div>
        <Label className="text-base font-medium flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Interests & Categories
        </Label>
        <div className="mt-2 space-y-3">
          <div className="flex gap-2">
            <Select value={newInterest} onValueChange={setNewInterest}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select interest category" />
              </SelectTrigger>
              <SelectContent>
                {commonInterests.map((interest) => (
                  <SelectItem key={interest} value={interest}>
                    {interest}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" onClick={addInterest} disabled={!newInterest}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {targetData.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {targetData.interests.map((interest) => (
                <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                  {interest}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeInterest(interest)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Choose interests that align with your campaign to reach the most relevant audience
        </p>
      </div>

      <div>
        <Label className="text-base font-medium flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Languages
        </Label>
        <div className="mt-2 space-y-3">
          <div className="flex gap-2">
            <Select value={newLanguage} onValueChange={setNewLanguage}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language} value={language}>
                    {language}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" onClick={addLanguage} disabled={!newLanguage}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {targetData.languages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {targetData.languages.map((language) => (
                <Badge key={language} variant="secondary" className="flex items-center gap-1">
                  {language}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeLanguage(language)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Specify languages that participants should be able to communicate in
        </p>
      </div>

      <Card className="bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800">
        <CardContent className="pt-6">
          <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Targeting Tips</h3>
          <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
            <li>• More specific targeting often leads to better campaign results</li>
            <li>• Consider your product/service's primary demographic</li>
            <li>• Location targeting helps with local market campaigns</li>
            <li>• Interest targeting ensures relevance to your brand</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};