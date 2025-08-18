import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useDispatch } from "react-redux";
import { setCredentials } from "@/app/slices/authSlice";
import { useRegisterMutation } from "@/app/slices/usersApiSlice";

const accentColor = "hsl(192.9 82.3% 31%)"; // TimeNode Accent

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EMPLOYEE"); // default
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // RTK Query mutation hook
  const [register, { isLoading, error, isSuccess, data }] =
    useRegisterMutation();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await register({
        name,
        email,
        password,
        confirmPassword,
        role,
      }).unwrap(); // unwrap() gives you the actual response or throws error

      // Save to Redux + localStorage
      dispatch(setCredentials(res));

      // Redirect by role
      if (res.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/employee");
      }
    } catch (err) {
      alert(err?.data?.message || err.error || "Registration failed");
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
            TimeNode Register
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-black">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-black">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Role */}
            <div>
              <Label className="text-black">Role</Label>
              <Select onValueChange={setRole} defaultValue="EMPLOYEE">
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-black">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full text-white rounded-xl py-2 shadow-md disabled:opacity-60"
              style={{ backgroundColor: accentColor }}
            >
              {isLoading ? "Registering..." : "Register"}
            </Button>

            {/* Error */}
            {error && (
              <p className="text-red-600 text-center text-sm mt-2">
                {error?.data?.message || "Registration failed"}
              </p>
            )}

            {/* Already have account? */}
            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-medium"
                style={{ color: accentColor }}
              >
                Login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
