
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// This page is deprecated - redirecting to the main auth flow
const BrandSignup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the main auth flow with brand type
    navigate('/auth?type=brand', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Redirecting to brand signup...</div>
    </div>
  );
};

export default BrandSignup;
