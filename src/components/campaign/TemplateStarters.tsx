import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { type ExecutionMode } from '@/types/execution';
import { Smartphone, Home, Store, Beaker, ClipboardCheck, FileSearch } from 'lucide-react';

export interface TemplateStarter {
  id: string;
  mode: ExecutionMode;
  category: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const TEMPLATES: TemplateStarter[] = [
  {
    id: 'app-test',
    mode: 'digital',
    category: 'App Testing & QA',
    title: 'Test our new app',
    description: 'Operators install your app, complete onboarding, and submit a screen recording proving the flow works.',
    icon: <Smartphone className="w-5 h-5" />,
  },
  {
    id: 'fintech-onboard',
    mode: 'digital',
    category: 'Product Trial & Review',
    title: 'Verify fintech onboarding',
    description: 'Operators sign up, complete KYC, and submit confirmation ID. Used to validate signup funnels.',
    icon: <ClipboardCheck className="w-5 h-5" />,
  },
  {
    id: 'survey',
    mode: 'digital',
    category: 'Survey & Research',
    title: 'Targeted survey response',
    description: 'Operators complete your survey form and submit confirmation. Demographics auto-verified.',
    icon: <FileSearch className="w-5 h-5" />,
  },
  {
    id: 'property-visit',
    mode: 'field',
    category: 'Property / Real Estate Visit',
    title: 'Verify property listing',
    description: 'Operators visit the property, take GPS-tagged photos, and confirm address matches the listing.',
    icon: <Home className="w-5 h-5" />,
  },
  {
    id: 'mystery-shop',
    mode: 'field',
    category: 'Mystery Shopping',
    title: 'Mystery shop retail store',
    description: 'Operators visit your store, complete a checklist, and submit photos + receipt as proof.',
    icon: <Store className="w-5 h-5" />,
  },
  {
    id: 'product-trial',
    mode: 'field',
    category: 'Product Trial & Review',
    title: 'Sample product trial',
    description: 'Operators collect a sample, test it, and submit a video review with verifiable timestamp.',
    icon: <Beaker className="w-5 h-5" />,
  },
];

interface TemplateStartersProps {
  mode: ExecutionMode;
  onSelect: (template: TemplateStarter) => void;
}

export const TemplateStarters: React.FC<TemplateStartersProps> = ({ mode, onSelect }) => {
  const filtered = TEMPLATES.filter((t) => t.mode === mode);

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-medium text-foreground">Quick start with a template</h4>
        <p className="text-xs text-muted-foreground">Tap one to pre-fill the title, type, and description. You can edit everything after.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((tpl) => (
          <Card
            key={tpl.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(tpl)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(tpl);
              }
            }}
            className="cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
          >
            <CardContent className="p-3 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">{tpl.icon}</div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{tpl.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{tpl.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
