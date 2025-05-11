
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, 
  TooltipProps
} from 'recharts';
import { WalletChartData } from "./types";
import { LoadingState } from "@/components/ui/loading-state";

type PayoutTrendsChartProps = {
  data: WalletChartData[];
  isLoading?: boolean;
};

export const PayoutTrendsChart: React.FC<PayoutTrendsChartProps> = ({ 
  data, 
  isLoading = false 
}) => {
  const [activeType, setActiveType] = useState<'all' | 'processed' | 'pending'>('all');
  
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-md shadow-md">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'processed', label: 'Processed' },
    { value: 'pending', label: 'Pending' }
  ];

  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Payout Trends</CardTitle>
        <div className="flex gap-2">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setActiveType(option.value as any)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                activeType === option.value 
                  ? 'bg-yellow-500/20 text-yellow-800' 
                  : 'hover:bg-muted'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          {isLoading ? (
            <LoadingState text="Loading chart data..." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  iconType="circle"
                  iconSize={8}
                />
                {(activeType === 'all' || activeType === 'processed') && (
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    name="Processed"
                    stroke="#FFDE59" 
                    strokeWidth={2}
                    dot={{ stroke: '#FFDE59', strokeWidth: 2, r: 4, fill: '#FFF' }}
                    activeDot={{ r: 6, stroke: '#FFDE59', strokeWidth: 2, fill: '#FFDE59' }} 
                  />
                )}
                {(activeType === 'all' || activeType === 'pending') && data[0]?.pending !== undefined && (
                  <Line 
                    type="monotone" 
                    dataKey="pending" 
                    name="Pending"
                    stroke="#94A3B8" 
                    strokeWidth={2}
                    dot={{ stroke: '#94A3B8', strokeWidth: 2, r: 4, fill: '#FFF' }}
                    activeDot={{ r: 6, stroke: '#94A3B8', strokeWidth: 2, fill: '#94A3B8' }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
