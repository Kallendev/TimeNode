import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/app/slices/authSlice";
import { useLoginMutation } from "@/app/slices/usersApiSlice";

const accentColor = "hsl(192.9 82.3% 31%)"; // TimeNode main color

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // RTK Query login hook
  const [login, { isLoading, error }] = useLoginMutation();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();

      // Save to Redux + localStorage
      dispatch(setCredentials(res));

      // Redirect by role
      if (res.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/employee");
      }
    } catch (err) {
      alert(err?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Card className="w-full max-w-md p-6 shadow-lg border border-gray-200 bg-white">
        <CardHeader>
          <CardTitle
            className="text-center text-2xl font-bold"
            style={{ color: accentColor }}
          >
            TimeNode Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <Label htmlFor="email" className="text-black">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="mt-1 border-gray-300 text-black placeholder-gray-500 focus:ring-2"
                style={{ "--tw-ring-color": accentColor }}
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password" className="text-black">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1 border-gray-300 text-black placeholder-gray-500 pr-10 focus:ring-2"
                  style={{ "--tw-ring-color": accentColor }}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full text-white rounded-xl py-2 shadow-md disabled:opacity-60"
              style={{ backgroundColor: accentColor }}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            {/* Error */}
            {error && (
              <p className="text-red-600 text-center text-sm mt-2">
                {error?.data?.message || "Login failed"}
              </p>
            )}

            {/* Forgot Password + Register */}
            <div className="flex justify-between text-sm text-gray-600">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="hover:underline"
                >
                  Forgot password?
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="hover:underline"
                >
                  Register
                </button>
              </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
