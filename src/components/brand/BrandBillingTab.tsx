import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Download, TrendingUp, DollarSign, Calendar, Star } from "lucide-react";

export const BrandBillingTab: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: "Starter",
      price: { monthly: 99, annual: 990 },
      description: "Perfect for small businesses starting their journey",
      features: [
        "Up to 5 campaigns",
        "Basic analytics",
        "Email support",
        "50 user engagements/month"
      ],
      popular: false
    },
    {
      name: "Growth",
      price: { monthly: 299, annual: 2990 },
      description: "Ideal for growing brands seeking more exposure",
      features: [
        "Unlimited campaigns",
        "Advanced analytics",
        "Priority support",
        "500 user engagements/month",
        "Custom brand page",
        "Performance insights"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: { monthly: 599, annual: 5990 },
      description: "For large brands with high-volume needs",
      features: [
        "Everything in Growth",
        "Dedicated account manager",
        "White-label solutions",
        "Unlimited engagements",
        "Custom integrations",
        "Priority campaign placement"
      ],
      popular: false
    }
  ];

  const currentPlan = plans[1]; // Growth plan as current
  const usageStats = {
    campaignsUsed: 8,
    campaignsLimit: "Unlimited",
    engagementsUsed: 347,
    engagementsLimit: 500,
    billingPeriod: "March 1 - March 31, 2024"
  };

  const recentInvoices = [
    { date: "March 1, 2024", amount: 299, status: "Paid", period: "March 2024" },
    { date: "February 1, 2024", amount: 299, status: "Paid", period: "February 2024" },
    { date: "January 1, 2024", amount: 299, status: "Paid", period: "January 2024" },
  ];

  return (
    <div className="space-y-6">
      {/* Current Plan & Usage */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Current Plan
            </CardTitle>
            <CardDescription>Your active subscription details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{currentPlan.name}</div>
                <div className="text-gray-600">{currentPlan.description}</div>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="text-3xl font-bold text-green-600">
              ${currentPlan.price.monthly}<span className="text-lg text-gray-500">/month</span>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Next billing: April 1, 2024</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Update Payment
                </Button>
                <Button variant="outline" size="sm">
                  Change Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Usage This Month
            </CardTitle>
            <CardDescription>{usageStats.billingPeriod}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Campaigns</span>
                <span>{usageStats.campaignsUsed} / {usageStats.campaignsLimit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: usageStats.campaignsLimit === "Unlimited" ? "60%" : "80%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>User Engagements</span>
                <span>{usageStats.engagementsUsed} / {usageStats.engagementsLimit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(usageStats.engagementsUsed / usageStats.engagementsLimit) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {usageStats.engagementsLimit - usageStats.engagementsUsed} engagements remaining
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Upgrade or downgrade your subscription anytime</CardDescription>
          <div className="flex items-center gap-4 mt-4">
            <Button
              variant={billingCycle === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === 'annual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBillingCycle('annual')}
            >
              Annual (Save 17%)
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="text-3xl font-bold">
                    ${plan.price[billingCycle]}
                    <span className="text-lg text-gray-500">
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.name === currentPlan.name ? 'outline' : 'default'}
                    disabled={plan.name === currentPlan.name}
                  >
                    {plan.name === currentPlan.name ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Billing History
          </CardTitle>
          <CardDescription>Your recent invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentInvoices.map((invoice, index) => (
              <div key={index}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{invoice.period}</div>
                    <div className="text-sm text-gray-500">{invoice.date}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">${invoice.amount}</div>
                      <Badge 
                        variant={invoice.status === 'Paid' ? 'default' : 'secondary'}
                        className={invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
                {index < recentInvoices.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};