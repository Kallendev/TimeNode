import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/TimeNode logo.png";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-white text-black px-6">
      {/* Logo at Top Left */}
     <div className="absolute top-6 left-6 flex items-center space-x-2">
        <img
          src={Logo}
          alt="TimeNode Logo"
          className="h-12 sm:h-16 md:h-20 lg:h-29 w-auto"
        />
      </div>


      {/* Welcome Title */}
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-center">
        Welcome to <span className="text-[hsl(192,82.3%,31%)]">TimeNode</span>
      </h1>

      {/* Subtext */}
      <p className="text-lg md:text-xl text-gray-600 max-w-lg text-center mb-8">
        Your ultimate time tracking and productivity tool — simple, powerful,
        and made for you.
      </p>

      {/* Buttons */}
      <div className="flex space-x-4">
        <Button
          onClick={() => navigate("/register")}
          className="px-6 py-3 rounded-2xl font-semibold text-white bg-[hsl(192,82.3%,31%)] hover:opacity-90 transition"
        >
          Get Started
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/login")}
          className="px-6 py-3 rounded-2xl font-semibold border-[hsl(192,82.3%,31%)] text-[hsl(192,82.3%,31%)] hover:bg-[hsl(192,82.3%,31%)] hover:text-white transition"
        >
          Login
        </Button>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-sm text-gray-500">
        © {new Date().getFullYear()} TimeNode. All rights reserved.
      </footer>
    </div>
  );
}
