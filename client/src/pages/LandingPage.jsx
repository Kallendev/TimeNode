import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Logo from "@/assets/TimeNode logo.png";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center bg-white text-black px-6">
  {/* Logo at Top Left */}
  <div className="absolute top-6 left-6 flex items-center space-x-2">
    <img
      src={Logo}
      alt="TimeNode Logo"
      className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto"
    />
  </div>


      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-20 text-center space-y-6 mt-30 mb-26">
        <h1 className="text-4xl md:text-6xl font-bold animate-breathe">
          Welcome to <span className="text-[hsl(192,82.3%,31%)]">TimeNode</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
          Your ultimate time tracking and productivity tool — simple, powerful,
          and made for you.
        </p>

        <div className="flex space-x-4 pt-4">
          <Button
            onClick={() => navigate("/register")}
            className="px-8 py-4 rounded-2xl font-semibold text-white text-lg bg-[hsl(192,82.3%,31%)] hover:opacity-90 transition"
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/login")}
            className="px-8 py-4 rounded-2xl font-semibold text-lg border-[hsl(192,82.3%,31%)] text-[hsl(192,82.3%,31%)] hover:bg-[hsl(192,82.3%,31%)] hover:text-white transition"
          >
            Login
          </Button>
        </div>
      </section>

      {/* Why Choose TimeNode */}
      <section className="max-w-6xl mx-auto mb-20 w-full px-6">
        <h2 className="text-3xl font-bold text-center mb-10 ">
          Why Choose <span className="text-[hsl(192,82.3%,31%)]">TimeNode?</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-md border border-gray-200 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl">⚡ Speed & Simplicity</CardTitle>
            </CardHeader>
            <CardContent>
              Start timers in one click. No clutter, just productivity.
            </CardContent>
          </Card>

          <Card className="shadow-md border border-gray-200 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl">📊 Actionable Insights</CardTitle>
            </CardHeader>
            <CardContent>
              Understand exactly where your time goes with visual analytics.
            </CardContent>
          </Card>

          <Card className="shadow-md border border-gray-200 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl">🌍 Work Anywhere</CardTitle>
            </CardHeader>
            <CardContent>
              Sync seamlessly across devices and collaborate with your team.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20 w-full">
        <Card className="shadow-md border border-gray-200 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-[hsl(192,82.3%,31%)] text-xl">⏳ Easy Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            Start and stop timers instantly, or log hours manually with ease.
          </CardContent>
        </Card>

        <Card className="shadow-md border border-gray-200 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-[hsl(192,82.3%,31%)] text-xl">📊 Smart Reports</CardTitle>
          </CardHeader>
          <CardContent>
            Visual insights into how your time is spent across projects.
          </CardContent>
        </Card>

        <Card className="shadow-md border border-gray-200 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-[hsl(192,82.3%,31%)] text-xl">🌍 Team Friendly</CardTitle>
          </CardHeader>
          <CardContent>
            Manage teams, assign tasks, and collaborate seamlessly.
          </CardContent>
        </Card>
      </section>

      {/* Testimonial Section */}
      <section className="max-w-3xl mx-auto text-center mb-20 px-6">
        <p className="italic text-gray-600 text-lg md:text-xl">
          "TimeNode makes tracking effortless. I finish projects faster and feel more in control of my day."
        </p>
        <p className="mt-3 font-semibold text-[hsl(192,82.3%,31%)]">— Sarah, Project Manager</p>
      </section>

      {/* Final CTA */}
      <section className="text-center mb-24">
        <h2 className="text-3xl font-bold mb-4">Ready to reclaim your time?</h2>
        <Button
          onClick={() => navigate("/register")}
          className="px-10 py-5 rounded-2xl text-lg font-semibold text-white bg-[hsl(192,82.3%,31%)] hover:opacity-90 transition"
        >
          Get Started
        </Button>
      </section>

      {/* Footer */}
      <footer className="absolute bottom-6 text-sm text-gray-500 text-center w-full">
        © {new Date().getFullYear()} TimeNode. All rights reserved.
      </footer>
    </div>
  );
}
