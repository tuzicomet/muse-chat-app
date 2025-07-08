import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";

// Sign up form fields
interface FormData {
  name: string;
  email: string;
  password: string;
}

const SignUpPage = () => {
  // Toggle for showing/hiding password input
  const [showPassword, setShowPassword] = useState(false);

  // State for user input in the signup form
  const [formData, setFormData] = useState<FormData>({
    // all fields set to empty string by default
    name: "",
    email: "",
    password: "",
  });

  return (
    // Full-height screen with centered form
    <div className="min-h-screen flex justify-center items-center p-6 sm:p-12">
      {/* Bounded container for the form content */}
      <div className="w-full max-w-md space-y-8">

        {/* Logo and heading */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-2 group">
            {/* Logo icon */}
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <MessageSquare className="size-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mt-2">Create Account</h1>
            <p className="text-base-content/60">Get started with your free account</p>
          </div>
        </div>

        {/* Signup form */}
        <form className="space-y-6">

          {/* Display Name input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Display Name</span>
            </label>
            <div className="relative">
              {/* User icon */}
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="size-5 text-base-content/40" />
              </div>
              {/* Display name text input */}
              <input
                type="text"
                className="input input-bordered w-full pl-10"
                placeholder="MuseUser"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          {/* Email input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Email</span>
            </label>
            <div className="relative">
              {/* Mail icon */}
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="size-5 text-base-content/40" />
              </div>
              {/* Email input field */}
              <input
                type="email"
                className="input input-bordered w-full pl-10"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Password input field with show/hide toggle */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Password</span>
            </label>
            <div className="relative">
              {/* Lock icon */}
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="size-5 text-base-content/40" />
              </div>
              {/* Password input field. 
              If showPassword is true, display the text, otherwise mask it as a password */}
              <input
                type={showPassword ? "text" : "password"}
                className="input input-bordered w-full pl-10"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {/* Toggle button to show/hide password */}
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="size-5 text-base-content/40" />
                ) : (
                  <Eye className="size-5 text-base-content/40" />
                )}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button type="button" className="btn btn-primary w-full">
            Create Account
          </button>
        </form>

        {/* Link to login page */}
        <div className="text-center">
          <p className="text-base-content/60">
            Already have an account?{" "}
            <Link to="/login" className="link link-primary">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
