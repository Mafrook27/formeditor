// Simple Login Page - Hardcoded credentials
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Hardcoded credentials
    if (username === "admin" && password === "123") {
      setIsLoading(true);

      // Store auth token
      localStorage.setItem("auth_token", "logged-in");

      // Simulate loading
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE - Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 items-center justify-center text-white"
        style={{
          background: "linear-gradient(135deg, #2962FF 0%, #00BFA5 100%)",
        }}
      >
        <div
          className="w-full flex flex-col items-center justify-center px-8"
          style={{ maxWidth: "550px" }}
        >
          {/* Logo */}
          <div className="mb-8">
            <svg
              className="w-[340px] h-[85px]"
              viewBox="0 0 687 192"
              fill="white"
            >
              <path d="m151.4 79.7q3.2-5 8.8-8.1 5.7-3 13.2-3 8.9 0 16 4.4 7.2 4.5 11.3 12.8 4.2 8.4 4.2 19.4 0 11-4.2 19.4-4.1 8.3-11.3 12.9-7.1 4.5-16 4.5-7.4 0-13.2-3-5.6-3.1-8.8-8v44h-21.9v-105.4h21.9zm31.2 25.4q0-8.1-4.6-12.8-4.4-4.7-11.1-4.7-6.5 0-11.1 4.7-4.5 4.8-4.5 13 0 8.2 4.5 12.9 4.6 4.7 11.1 4.7 6.5 0 11.1-4.7 4.6-4.9 4.6-13.1zm29.4 0q0-11 4.1-19.3 4.3-8.3 11.4-12.8 7.2-4.5 16-4.5 7.6 0 13.2 3.1 5.8 3.1 8.8 8.1v-10.1h21.9v71.4h-21.9v-10.1q-3.2 5-8.9 8-5.6 3.1-13.2 3.1-8.7 0-15.9-4.5-7.1-4.6-11.4-12.9-4.1-8.4-4.1-19.5zm53.5 0.2q0-8.2-4.6-13-4.4-4.7-11-4.7-6.5 0-11.1 4.7-4.5 4.7-4.5 12.8 0 8.2 4.5 13.1 4.6 4.7 11.1 4.7 6.6 0 11-4.7 4.6-4.7 4.6-12.9zm59.7-23.8q3.8-5.9 9.6-9.2 5.7-3.5 12.8-3.5v23.2h-6.1q-8.1 0-12.2 3.5-4.1 3.5-4.1 12.3v33.2h-21.9v-71.4h21.9zm76.5 59.5l-21.8-30v30h-21.9v-94.7h21.9v52.3l21.6-29h27.1l-29.7 35.8 29.9 35.6zm57.4-16.9h28.6v16.9h-50.5v-89.9h21.9zm140.8-72.9v89.8h-21.8v-53.9l-20.1 53.9h-17.7l-20.2-54v54h-21.9v-89.8h25.8l25.3 62.2 24.9-62.2zm48.3 90.7q-9.9 0-17.7-3.2-7.8-3.2-12.5-9.5-4.6-6.2-4.9-15.1h23.3q0.5 5 3.4 7.7 3 2.6 7.7 2.6 4.9 0 7.7-2.2 2.8-2.3 2.8-6.3 0-3.3-2.3-5.5-2.2-2.1-5.5-3.6-3.2-1.4-9.2-3.2-8.7-2.6-14.2-5.3-5.5-2.7-9.5-8-3.9-5.2-3.9-13.7 0-12.5 9-19.5 9.1-7.2 23.7-7.2 14.9 0 24 7.2 9 7 9.7 19.7h-23.7q-0.3-4.4-3.2-6.8-2.9-2.6-7.5-2.6-4 0-6.4 2.2-2.5 2-2.5 6 0 4.4 4.1 6.8 4.1 2.4 12.8 5.2 8.7 3 14.1 5.7 5.5 2.7 9.5 7.8 3.9 5.1 3.9 13.2 0 7.7-3.9 13.9-3.9 6.3-11.3 10-7.4 3.7-17.5 3.7z" />
              <path
                fillRule="evenodd"
                fill="none"
                stroke="white"
                strokeWidth="12"
                d="m69.4 108c0 0-37.2 6.8-37.2-28.7 0-26.8 67.6-18.6 67.6-18.6l-16.9-18.6h-16.9v-13.6l-20.3-13.5v27.1h-13.5c0 0-18.6 3.3-18.6 23.6 0 23.7 18.6 20.3 18.6 20.3m22 0c0 0 37.2-3.3 37.2 25.4 0 22-32.1 22-32.1 22h-43.9l20.3 18.6h13.6v10.2l17.2 15.2v-25.4c0 0 18.6 2 24.9 0 9.8-3.1 17.5-8.4 18.6-18.6 1.7-15.2-13.5-22-13.5-22"
              />
            </svg>
          </div>

          {/* Illustration */}
          <div className="mb-12">
            <svg
              className="w-[380px] h-[260px]"
              viewBox="0 0 400 280"
              fill="none"
            >
              <rect
                x="80"
                y="40"
                width="240"
                height="180"
                rx="12"
                fill="white"
                fillOpacity="0.95"
              />
              <rect
                x="80"
                y="40"
                width="240"
                height="40"
                rx="12"
                fill="white"
              />
              <rect x="80" y="68" width="240" height="12" fill="#f0f0f0" />
              <circle cx="105" cy="60" r="8" fill="#FF5252" />
              <circle cx="130" cy="60" r="8" fill="#FFB74D" />
              <circle cx="155" cy="60" r="8" fill="#4CAF50" />
              <rect
                x="100"
                y="160"
                width="25"
                height="40"
                rx="4"
                fill="#2962FF"
                fillOpacity="0.8"
              />
              <rect
                x="135"
                y="140"
                width="25"
                height="60"
                rx="4"
                fill="#00BFA5"
                fillOpacity="0.8"
              />
              <rect
                x="170"
                y="120"
                width="25"
                height="80"
                rx="4"
                fill="#2962FF"
                fillOpacity="0.8"
              />
              <rect
                x="205"
                y="100"
                width="25"
                height="100"
                rx="4"
                fill="#00BFA5"
                fillOpacity="0.8"
              />
              <rect
                x="240"
                y="130"
                width="25"
                height="70"
                rx="4"
                fill="#2962FF"
                fillOpacity="0.8"
              />
              <rect
                x="275"
                y="110"
                width="25"
                height="90"
                rx="4"
                fill="#00BFA5"
                fillOpacity="0.8"
              />
              <circle cx="340" cy="70" r="28" fill="white" fillOpacity="0.2" />
              <text
                x="340"
                y="80"
                textAnchor="middle"
                fill="white"
                fontSize="28"
                fontWeight="bold"
              >
                $
              </text>
              <ellipse
                cx="60"
                cy="200"
                rx="25"
                ry="8"
                fill="white"
                fillOpacity="0.3"
              />
              <ellipse
                cx="60"
                cy="192"
                rx="25"
                ry="8"
                fill="white"
                fillOpacity="0.4"
              />
              <ellipse
                cx="60"
                cy="184"
                rx="25"
                ry="8"
                fill="white"
                fillOpacity="0.5"
              />
              <ellipse
                cx="60"
                cy="176"
                rx="25"
                ry="8"
                fill="white"
                fillOpacity="0.6"
              />
              <path
                d="M330 180 L360 150 L350 150 L350 130 L370 130 L370 160 L360 160 L330 190"
                fill="white"
                fillOpacity="0.4"
              />
            </svg>
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-3 tracking-wide">
              Loan Management System
            </h1>
            <p className="text-base opacity-80 leading-relaxed max-w-md">
              A modern, cloud-based and end-to-end Loan Management Platform
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center"
        style={{ backgroundColor: "#f5f5f5", padding: "16px" }}
      >
        <div className="w-full" style={{ maxWidth: "450px" }}>
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <svg
              className="w-72 h-20 mx-auto"
              viewBox="0 0 687 192"
              fill="#2962FF"
            >
              <path d="m151.4 79.7q3.2-5 8.8-8.1 5.7-3 13.2-3 8.9 0 16 4.4 7.2 4.5 11.3 12.8 4.2 8.4 4.2 19.4 0 11-4.2 19.4-4.1 8.3-11.3 12.9-7.1 4.5-16 4.5-7.4 0-13.2-3-5.6-3.1-8.8-8v44h-21.9v-105.4h21.9zm31.2 25.4q0-8.1-4.6-12.8-4.4-4.7-11.1-4.7-6.5 0-11.1 4.7-4.5 4.8-4.5 13 0 8.2 4.5 12.9 4.6 4.7 11.1 4.7 6.5 0 11.1-4.7 4.6-4.9 4.6-13.1zm29.4 0q0-11 4.1-19.3 4.3-8.3 11.4-12.8 7.2-4.5 16-4.5 7.6 0 13.2 3.1 5.8 3.1 8.8 8.1v-10.1h21.9v71.4h-21.9v-10.1q-3.2 5-8.9 8-5.6 3.1-13.2 3.1-8.7 0-15.9-4.5-7.1-4.6-11.4-12.9-4.1-8.4-4.1-19.5zm53.5 0.2q0-8.2-4.6-13-4.4-4.7-11-4.7-6.5 0-11.1 4.7-4.5 4.7-4.5 12.8 0 8.2 4.5 13.1 4.6 4.7 11.1 4.7 6.6 0 11-4.7 4.6-4.7 4.6-12.9zm59.7-23.8q3.8-5.9 9.6-9.2 5.7-3.5 12.8-3.5v23.2h-6.1q-8.1 0-12.2 3.5-4.1 3.5-4.1 12.3v33.2h-21.9v-71.4h21.9zm76.5 59.5l-21.8-30v30h-21.9v-94.7h21.9v52.3l21.6-29h27.1l-29.7 35.8 29.9 35.6zm57.4-16.9h28.6v16.9h-50.5v-89.9h21.9zm140.8-72.9v89.8h-21.8v-53.9l-20.1 53.9h-17.7l-20.2-54v54h-21.9v-89.8h25.8l25.3 62.2 24.9-62.2zm48.3 90.7q-9.9 0-17.7-3.2-7.8-3.2-12.5-9.5-4.6-6.2-4.9-15.1h23.3q0.5 5 3.4 7.7 3 2.6 7.7 2.6 4.9 0 7.7-2.2 2.8-2.3 2.8-6.3 0-3.3-2.3-5.5-2.2-2.1-5.5-3.6-3.2-1.4-9.2-3.2-8.7-2.6-14.2-5.3-5.5-2.7-9.5-8-3.9-5.2-3.9-13.7 0-12.5 9-19.5 9.1-7.2 23.7-7.2 14.9 0 24 7.2 9 7 9.7 19.7h-23.7q-0.3-4.4-3.2-6.8-2.9-2.6-7.5-2.6-4 0-6.4 2.2-2.5 2-2.5 6 0 4.4 4.1 6.8 4.1 2.4 12.8 5.2 8.7 3 14.1 5.7 5.5 2.7 9.5 7.8 3.9 5.1 3.9 13.2 0 7.7-3.9 13.9-3.9 6.3-11.3 10-7.4 3.7-17.5 3.7z" />
              <path
                fillRule="evenodd"
                fill="none"
                stroke="#2962FF"
                strokeWidth="12"
                d="m69.4 108c0 0-37.2 6.8-37.2-28.7 0-26.8 67.6-18.6 67.6-18.6l-16.9-18.6h-16.9v-13.6l-20.3-13.5v27.1h-13.5c0 0-18.6 3.3-18.6 23.6 0 23.7 18.6 20.3 18.6 20.3m22 0c0 0 37.2-3.3 37.2 25.4 0 22-32.1 22-32.1 22h-43.9l20.3 18.6h13.6v10.2l17.2 15.2v-25.4c0 0 18.6 2 24.9 0 9.8-3.1 17.5-8.4 18.6-18.6 1.7-15.2-13.5-22-13.5-22"
              />
            </svg>
          </div>

          <h2 className="text-[1.75rem] font-bold text-center mb-1">Login</h2>
          <p
            className="text-center text-gray-500 mb-6"
            style={{ fontSize: "0.9rem" }}
          >
            Please login to access your account.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-red-600 font-medium">{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Demo Credentials Info */}
          <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Demo Credentials:</strong>
              <br />
              Username:{" "}
              <code className="bg-blue-100 px-2 py-0.5 rounded">admin</code>
              <br />
              Password:{" "}
              <code className="bg-blue-100 px-2 py-0.5 rounded">123</code>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="mb-5">
              <Label
                htmlFor="username"
                className="text-gray-600 mb-2 block text-sm"
              >
                Username
              </Label>
              <Input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="h-[48px] rounded-lg text-base"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <Label
                htmlFor="password"
                className="text-gray-600 mb-2 block text-sm"
              >
                Password
              </Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-[48px] rounded-lg text-base"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-[48px] rounded-lg font-bold text-[15px] hover:opacity-90"
              style={{ backgroundColor: "#2962FF" }}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
