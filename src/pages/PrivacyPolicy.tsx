
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
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
            <span className="text-yeild-yellow text-3xl font-bold">🔐 YeildSocials.com</span>
            <h1 className="text-3xl font-bold mt-4">Privacy Policy</h1>
            <p className="text-gray-400 mt-2">Effective Date: 2nd August 2025</p>
          </div>

          <div className="text-gray-300 leading-relaxed mb-8">
            <p>YeildSocials.com respects your privacy and we are committed to protecting your personal data.</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">1. Information We Collect</h2>
            <p className="text-gray-300 leading-relaxed">
              We may collect:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Personal Info: Name, email, phone number, etc.</li>
              <li>Usage Data: IP address, browser type, device info</li>
              <li>Referral Data: When someone signs up through your link</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">2. How We Use Your Data</h2>
            <p className="text-gray-300 leading-relaxed">
              We use your data to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Create and manage your account</li>
              <li>Track referrals and reward users</li>
              <li>Improve our services</li>
              <li>Send updates and notifications</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">3. Sharing of Data</h2>
            <p className="text-gray-300 leading-relaxed">
              We do not sell your personal data. However, we may share it with:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Third-party service providers (like email tools or analytics)</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">4. Cookies</h2>
            <p className="text-gray-300 leading-relaxed">
              We use cookies to personalize content and analyze traffic. You can disable cookies in your browser settings, but some features may not work properly.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">5. Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We implement strong security measures to protect your data. However, no system is 100% secure, and we encourage you to protect your login details.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">6. Your Rights</h2>
            <p className="text-gray-300 leading-relaxed">
              You may:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Request access to your data</li>
              <li>Ask us to correct or delete it</li>
              <li>Withdraw your consent at any time</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">7. Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              We do not knowingly collect data from users under 13. If you believe a child has provided personal info, contact us to remove it.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">8. Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy. Changes will be posted on this page with the updated date.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-yeild-yellow">9. Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              Questions about this policy?
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

export default PrivacyPolicy;
