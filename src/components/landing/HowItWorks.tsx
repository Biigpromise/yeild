
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const HowItWorks = () => {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-yeild-yellow">How It Works</h2>
        </div>
        
        <div className="grid md:grid-cols-1 gap-8 max-w-2xl mx-auto">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="w-12 h-12 bg-yeild-yellow rounded-full flex items-center justify-center mb-4">
                <span className="text-black font-bold text-xl">1</span>
              </div>
              <CardTitle className="text-white text-2xl">Sign Up as an Operator</CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Create your Operator account in under 2 minutes and verify your profile.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="w-12 h-12 bg-yeild-yellow rounded-full flex items-center justify-center mb-4">
                <span className="text-black font-bold text-xl">2</span>
              </div>
              <CardTitle className="text-white text-2xl">Execute Orders</CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Browse the Discovery Hub and accept Execution Orders that match your rank and skills.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="w-12 h-12 bg-yeild-yellow rounded-full flex items-center justify-center mb-4">
                <span className="text-black font-bold text-xl">3</span>
              </div>
              <CardTitle className="text-white text-2xl">Earn Credits</CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                YEILD verifies your proof, then Credits (1 = ₦1) are released to your wallet after a 7-day escrow.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
};
