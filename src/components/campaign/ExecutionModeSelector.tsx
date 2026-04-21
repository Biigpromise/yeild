import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, MapPin, CheckCircle2 } from 'lucide-react';
import { EXECUTION_MODES, type ExecutionMode } from '@/types/execution';

interface ExecutionModeSelectorProps {
  value: ExecutionMode | null;
  onChange: (mode: ExecutionMode) => void;
}

const MODE_ICONS: Record<ExecutionMode, React.ReactNode> = {
  digital: <Globe className="w-6 h-6" />,
  field: <MapPin className="w-6 h-6" />,
};

export const ExecutionModeSelector: React.FC<ExecutionModeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Choose Execution Mode</h3>
        <p className="text-sm text-muted-foreground">
          This determines which operator ranks can pick up your order and how proof is verified.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXECUTION_MODES.map((mode) => {
          const isSelected = value === mode.id;
          return (
            <Card
              key={mode.id}
              role="button"
              tabIndex={0}
              onClick={() => onChange(mode.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange(mode.id);
                }
              }}
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                isSelected ? 'border-primary border-2 ring-2 ring-primary/20' : 'border-border'
              }`}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {MODE_ICONS[mode.id]}
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </div>

                <div>
                  <h4 className="font-semibold text-foreground">{mode.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{mode.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Platform fee</span>
                    <span className="font-medium text-foreground">
                      {mode.platformFeeMin}–{mode.platformFeeMax}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Creation fee</span>
                    <span className="font-medium text-foreground">
                      ₦{(mode.id === 'field' ? 50000 : 10000).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Best for:</p>
                  <div className="flex flex-wrap gap-1">
                    {mode.useCases.slice(0, 3).map((uc) => (
                      <Badge key={uc} variant="secondary" className="text-[10px] font-normal">
                        {uc}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
