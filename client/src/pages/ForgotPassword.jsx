import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
} from "@/app/slices/usersApiSlice";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const accentColor = "hsl(192.9 82.3% 31%)"; // TimeNode main color

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const navigate = useNavigate();

  const [requestReset, { isLoading: isRequesting }] =
    useRequestPasswordResetMutation();
  const [resetPassword, { isLoading: isResetting }] =
    useResetPasswordMutation();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    try {
      await requestReset(email).unwrap();
      alert("✅ OTP sent to your email!");
      setStep(2);
    } catch (err) {
      alert(err?.data?.error || "Failed to send OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await resetPassword({ email, otp, newPassword }).unwrap();
      alert("🎉 Password reset successful! Redirecting to login...");
      
      // Reset state
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");

      // Navigate to login after success
      navigate("/login");
    } catch (err) {
      alert(err?.data?.error || "Password reset failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <Card className="w-full max-w-md p-6 shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle
            className="text-center text-2xl font-bold"
            style={{ color: accentColor }}
          >
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleRequestReset} className="space-y-5">
              {/* Email Input */}
              <div>
                <Label htmlFor="email" className="text-black">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 border-gray-300 text-black placeholder-gray-500 focus:ring-2"
                  style={{ "--tw-ring-color": accentColor }}
                  required
                />
              </div>

              {/* Send OTP Button */}
              <Button
                type="submit"
                disabled={isRequesting}
                className="w-full text-white rounded-xl py-2 shadow-md disabled:opacity-60"
                style={{ backgroundColor: accentColor }}
              >
                {isRequesting ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* OTP Input */}
              <div>
                <Label htmlFor="otp" className="text-black">
                  OTP
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mt-1 border-gray-300 text-black placeholder-gray-500 focus:ring-2"
                  style={{ "--tw-ring-color": accentColor }}
                  required
                />
              </div>

              {/* New Password Input */}
              <div>
                <Label htmlFor="newPassword" className="text-black">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 border-gray-300 text-black placeholder-gray-500 focus:ring-2"
                  style={{ "--tw-ring-color": accentColor }}
                  required
                />
              </div>

              {/* Reset Password Button */}
              <Button
                type="submit"
                disabled={isResetting}
                className="w-full text-white rounded-xl py-2 shadow-md disabled:opacity-60"
                style={{ backgroundColor: accentColor }}
              >
                {isResetting ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Remembered your password?{" "}
            <Link
              to="/login"
              style={{ color: accentColor }}
              className="font-medium"
            >
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
