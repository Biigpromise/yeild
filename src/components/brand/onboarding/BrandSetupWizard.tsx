import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Building2, ShieldCheck, Sparkles } from 'lucide-react';
import { autoAssignDifficulty, DIFFICULTY_POINT_MINIMUMS, getDifficultyLabel, getDifficultyDescription } from '@/constants/taskDifficulty';

const INDUSTRIES = [
  { value: 'fintech', label: 'Fintech / Banking' },
  { value: 'ecommerce', label: 'E-commerce / Retail' },
  { value: 'saas', label: 'SaaS / Software' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'consumer_electronics', label: 'Consumer Electronics' },
  { value: 'telecom', label: 'Telecommunications' },
  { value: 'travel', label: 'Travel / Hospitality' },
  { value: 'edtech', label: 'EdTech' },
  { value: 'fmcg', label: 'FMCG / Consumer Goods' },
  { value: 'other', label: 'Other' },
];

const COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt',
  'United Kingdom', 'United States', 'Canada', 'Germany', 'United Arab Emirates', 'Global / Remote',
];

const PROOF_OPTIONS = [
  { id: 'screenshot', label: 'Screenshot', mode: 'digital' },
  { id: 'video', label: 'Video Recording', mode: 'digital' },
  { id: 'screen_recording', label: 'Screen Recording', mode: 'digital' },
  { id: 'review', label: 'Written Review', mode: 'digital' },
  { id: 'geo', label: 'Geo-tagged Photo', mode: 'field' },
  { id: 'id_verification', label: 'ID Verification (KYC)', mode: 'field' },
  { id: 'in_person_visit', label: 'In-person Visit', mode: 'field' },
];

interface BrandSetupWizardProps {
  onComplete: (recommendation: Recommendation) => void;
  onSkip?: () => void;
}

export interface Recommendation {
  industry: string;
  country: string;
  city: string;
  proofTypes: string[];
  executionMode: 'digital' | 'field';
  difficulty: ReturnType<typeof autoAssignDifficulty>;
  minPointsPerTask: number;
}

export const BrandSetupWizard: React.FC<BrandSetupWizardProps> = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState(0);
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [proofTypes, setProofTypes] = useState<string[]>([]);

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  const recommendation: Recommendation = useMemo(() => {
    const hasFieldProof = proofTypes.some(
      (p) => PROOF_OPTIONS.find((o) => o.id === p)?.mode === 'field'
    );
    const executionMode: 'digital' | 'field' = hasFieldProof ? 'field' : 'digital';
    const difficulty = autoAssignDifficulty(executionMode, proofTypes);
    return {
      industry,
      country,
      city,
      proofTypes,
      executionMode,
      difficulty,
      minPointsPerTask: DIFFICULTY_POINT_MINIMUMS[difficulty],
    };
  }, [industry, country, city, proofTypes]);

  const toggleProof = (id: string) => {
    setProofTypes((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const canContinue =
    (step === 0 && !!industry) ||
    (step === 1 && !!country) ||
    (step === 2 && proofTypes.length > 0) ||
    step === 3;

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else onComplete(recommendation);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary">
              Step {step + 1} of {totalSteps}
            </Badge>
            {onSkip && (
              <Button variant="ghost" size="sm" onClick={onSkip}>
                Skip for now
              </Button>
            )}
          </div>
          <Progress value={progress} className="h-2" />
          <CardTitle className="mt-4">
            {step === 0 && 'What industry are you in?'}
            {step === 1 && 'Where do you need execution?'}
            {step === 2 && 'What verification do you require?'}
            {step === 3 && 'Your recommended setup'}
          </CardTitle>
          <CardDescription>
            {step === 0 && 'We use this to match you with the right operator pool.'}
            {step === 1 && 'Geography determines field availability and operator ranks.'}
            {step === 2 && 'Pick every proof type your campaigns must collect.'}
            {step === 3 && 'Based on your answers, here is the recommended execution profile.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 0 && (
            <div className="space-y-2">
              <Label htmlFor="industry">
                <Building2 className="inline h-4 w-4 mr-1" />
                Industry
              </Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i.value} value={i.value}>
                      {i.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Country / Region
                </Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City (optional)</Label>
                <Input
                  id="city"
                  placeholder="e.g. Lagos, Nairobi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <Label>
                <ShieldCheck className="inline h-4 w-4 mr-1" />
                Required proof types
              </Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {PROOF_OPTIONS.map((p) => {
                  const checked = proofTypes.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className="flex items-center gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-accent"
                    >
                      <Checkbox checked={checked} onCheckedChange={() => toggleProof(p.id)} />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{p.label}</div>
                        <div className="text-xs text-muted-foreground capitalize">{p.mode} mode</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4 bg-accent/30">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Recommended Profile</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <Stat label="Execution Mode" value={recommendation.executionMode === 'field' ? 'Field' : 'Digital'} />
                  <Stat label="Difficulty" value={getDifficultyLabel(recommendation.difficulty)} />
                  <Stat label="Min Points / Task" value={recommendation.minPointsPerTask.toLocaleString()} />
                  <Stat label="Geography" value={[recommendation.city, recommendation.country].filter(Boolean).join(', ') || '—'} />
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {getDifficultyDescription(recommendation.difficulty)}
                </p>
              </div>
              <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                Difficulty and minimums are set by the platform based on execution mode and proof complexity.
                Admins may adjust these during execution order approval.
              </div>
            </div>
          )}
        </CardContent>

        <div className="flex items-center justify-between p-6 pt-0">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button onClick={handleNext} disabled={!canContinue}>
            {step === totalSteps - 1 ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1" /> Finish
              </>
            ) : (
              <>
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="font-semibold">{value}</div>
  </div>
);

export default BrandSetupWizard;
