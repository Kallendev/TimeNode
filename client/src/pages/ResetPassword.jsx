import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useResetPasswordMutation } from "@/app/slices/usersApiSlice";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const accentColor = "hsl(192.9 82.3% 31%)"; // TimeNode accent color

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await resetPassword({ token, password }).unwrap();
      alert("Password reset successful! 🎉 Redirecting to login...");
      navigate("/login"); // auto-redirect to login
    } catch (error) {
      alert(error?.data?.message || "Reset failed");
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
            Reset Password
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <Label htmlFor="password" className="text-black">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 border-gray-300 text-black placeholder-gray-500 focus:ring-2"
                style={{ "--tw-ring-color": accentColor }}
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" className="text-black">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 border-gray-300 text-black placeholder-gray-500 focus:ring-2"
                style={{ "--tw-ring-color": accentColor }}
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full text-white rounded-xl py-2 shadow-md disabled:opacity-60"
              style={{ backgroundColor: accentColor }}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Remembered your password?{" "}
            <Link to="/login" style={{ color: accentColor }} className="font-medium">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
