
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-yeild-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-6 text-gray-400 hover:text-white" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-8">
          <div className="text-center mb-12">
            <span className="text-yeild-yellow text-3xl font-bold">YEILD</span>
            <h1 className="text-3xl font-bold mt-4">Terms of Service</h1>
            <p className="text-gray-400 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing and using YEILD ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">2. Use License</h2>
            <p className="text-gray-300 leading-relaxed">
              Permission is granted to temporarily download one copy of YEILD per device for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to reverse engineer any software contained on the website</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">3. User Accounts</h2>
            <p className="text-gray-300 leading-relaxed">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for keeping your account information current.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">4. Task Completion and Rewards</h2>
            <p className="text-gray-300 leading-relaxed">
              YEILD provides a platform for completing tasks and earning rewards. Points earned through task completion can be redeemed for various rewards as outlined in our rewards program. We reserve the right to modify the rewards program at any time.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">5. Prohibited Uses</h2>
            <p className="text-gray-300 leading-relaxed">
              You may not use our service for any unlawful purpose or to solicit others to perform unlawful acts. You may not transmit any worms or viruses or any code of a destructive nature.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">6. Disclaimer</h2>
            <p className="text-gray-300 leading-relaxed">
              The information on this website is provided on an 'as is' basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms related to our website and the use of this website.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">7. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at support@yeild.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
