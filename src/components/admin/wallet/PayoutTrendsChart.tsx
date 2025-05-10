
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type PayoutTrendsChartProps = {
  data: Array<{
    name: string;
    amount: number;
  }>;
};

export const PayoutTrendsChart: React.FC<PayoutTrendsChartProps> = ({ data }) => {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Payout Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#FFDE59" 
                strokeWidth={2}
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
