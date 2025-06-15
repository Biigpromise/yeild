
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useResendBrandConfirmation } from "@/hooks/useResendBrandConfirmation";
import { useState } from "react";

interface SubmittedScreenProps {
  email: string | null;
  company: string | null;
}

const SubmittedScreen = ({ email, company }: SubmittedScreenProps) => {
  const navigate = useNavigate();
  const { resend, resendLoading } = useResendBrandConfirmation();
  // Track if user has clicked resend or not for feedback
  const [didResend, setDidResend] = useState(false);

  return (
    <div className="text-center p-8 bg-gray-900/50 rounded-lg">
      <h1 className="text-2xl font-bold">Thank You for Applying!</h1>
      <p className="text-gray-400 mt-4">
        Your application has been submitted for review.
      </p>
      <p className="text-gray-400 mt-2">
        Please check your email to confirm your account. Once confirmed, you can log in to check your application status.
      </p>
      <Button onClick={() => navigate('/login')} className="mt-6 yeild-btn-primary">
        Go to Login
      </Button>
      <div className="mt-4">
        <Button
          variant="outline"
          onClick={async () => {
            setDidResend(true);
            await resend(email, company);
          }}
          disabled={resendLoading}
          className="yeild-btn-secondary"
        >
          {resendLoading ? "Resending..." : "Resend Confirmation Email"}
        </Button>
      </div>
      <div className="mt-4 text-sm text-gray-400">
        Didn&apos;t get the email? Check your spam or click above to resend.
        {didResend && !resendLoading ? (
          <span className="block mt-1 text-yeild-yellow font-semibold">If you don&apos;t see it after a few minutes, please contact support!</span>
        ) : null}
      </div>
    </div>
  );
};

export default SubmittedScreen;
