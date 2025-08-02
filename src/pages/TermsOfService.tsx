
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
            <span className="text-yeild-yellow text-3xl font-bold">YeildSocials.com</span>
            <h1 className="text-3xl font-bold mt-4">Terms and Conditions</h1>
            <p className="text-gray-400 mt-2">Effective Date: 2nd August 2025</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing or using YeildSocials.com ("we", "us", "our"), you agree to comply with and be bound by these Terms and Conditions. If you do not agree, do not use the website.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">2. Eligibility</h2>
            <p className="text-gray-300 leading-relaxed">
              You must be at least 13 years old (or the age of digital consent in your country) to use this platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">3. User Accounts</h2>
            <p className="text-gray-300 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account details and for all activities under your account. You agree to provide accurate and complete information when registering.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">4. Platform Use</h2>
            <p className="text-gray-300 leading-relaxed">
              Yeild is a social engagement and referral-based rewards platform. Users may participate by:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Creating an account</li>
              <li>Referring others</li>
              <li>Earning ranks and rewards based on activity</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              We may change, suspend, or terminate the services at any time.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">5. Earnings and Rewards</h2>
            <p className="text-gray-300 leading-relaxed">
              Earnings are based on user activity and referrals, and may be subject to change. We reserve the right to verify accounts, withhold payments for suspicious activities, or update reward rules.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">6. Prohibited Activities</h2>
            <p className="text-gray-300 leading-relaxed">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Use bots, automated tools, or fake accounts</li>
              <li>Harass or harm others</li>
              <li>Post or share illegal content</li>
              <li>Attempt to manipulate or exploit the platform unfairly</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">7. Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed">
              All content, logos, and materials on the site are owned by YeildSocials or licensed to us. You may not reproduce or reuse without written permission.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">8. Termination</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to suspend or terminate your access to the platform if you violate these terms or misuse the services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">9. Disclaimer</h2>
            <p className="text-gray-300 leading-relaxed">
              Yeild is provided "as is" and "as available." We do not guarantee uptime, earnings, or results.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">10. Governing Law</h2>
            <p className="text-gray-300 leading-relaxed">
              These terms are governed by the laws of Nigeria, and any disputes will be resolved in its courts.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">11. Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have questions about these Terms, contact us at:
            </p>
            <div className="text-gray-300 leading-relaxed ml-4">
              <p>📧 support@yeildsocials.com</p>
              <p className="mt-2">YeildSocials Concepts</p>
              <p>No 81 Zango Street Ungwan Romi</p>
              <p>Kaduna, Nigeria</p>
              <p>📞 +2349118408666</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
