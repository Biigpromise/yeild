
import React from "react";

function calculateStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Score can be up to 6
  if (score <= 2) return { label: "Weak", color: "bg-red-500", value: 1 };
  if (score <= 4) return { label: "Medium", color: "bg-yellow-400", value: 2 };
  return { label: "Strong", color: "bg-green-500", value: 3 };
}

interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  if (!password) return null;
  const { label, color, value } = calculateStrength(password);

  return (
    <div className="mt-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 h-2 bg-gray-700 rounded overflow-hidden">
          <div
            className={`transition-all h-2 rounded ${color}`}
            style={{
              width:
                value === 1
                  ? "33%"
                  : value === 2
                  ? "66%"
                  : "100%",
            }}
          />
        </div>
        <span className={`text-xs font-medium ${color === "bg-red-500" ? "text-red-500" : color === "bg-yellow-400" ? "text-yellow-400" : "text-green-500"}`}>
          {label}
        </span>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
