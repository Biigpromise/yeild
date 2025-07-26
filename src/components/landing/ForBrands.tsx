
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export const ForBrands = () => {
  return (
    <section className="py-20 bg-gray-900/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-primary">For Brands</h2>
        </div>
        
        <div className="grid md:grid-cols-1 gap-8 max-w-2xl mx-auto">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Reach Your Audience</CardTitle>
              <CardDescription className="text-gray-300 text-lg mb-6">
                Connect with targeted users who are interested in your products and services.
              </CardDescription>
              <Button 
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-fit shadow-yeild-button"
              >
                <Link to="/brand-signup">
                  Partner With Us
                </Link>
              </Button>
            </CardHeader>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Measurable Results</CardTitle>
              <CardDescription className="text-gray-300 text-lg mb-6">
                Track campaign performance and user engagement with our analytics dashboard.
              </CardDescription>
              <Button 
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800 w-fit"
              >
                View Case Studies
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
};
