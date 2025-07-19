import { ErrorMessage, Field, Form, Formik } from "formik";
import {
  AlertCircle,
  CheckCircle,
  Gavel,
  Lock,
  Mail,
  Moon,
  Phone,
  Shield,
  SunIcon,
  User,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { useAuth } from "../context/auth_context";
import { loginUser, registerUser, storeAuthData } from "../services/auth";

// Enhanced validation schema with stronger password requirements
const getValidationSchema = (isLogin: boolean) => {
  const baseSchema = {
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  };

  if (isLogin) {
    return Yup.object(baseSchema);
  }

  return Yup.object({
    ...baseSchema,
    firstName: Yup.string()
      .min(2, "First name must be at least 2 characters")
      .required("First Name is required"),
    lastName: Yup.string()
      .min(2, "Last name must be at least 2 characters")
      .required("Last Name is required"),
    phone: Yup.string()
      .matches(/^\+?[\d\s\-()]+$/, "Invalid phone number format")
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number must not exceed 15 digits")
      .required("Phone Number is required"),
    role: Yup.string()
      .oneOf(["Staff", "Court Admin", "Super Admin"], "Invalid role")
      .required("Role is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(
        /(?=.*[a-z])/,
        "Password must contain at least one lowercase letter"
      )
      .matches(
        /(?=.*[A-Z])/,
        "Password must contain at least one uppercase letter"
      )
      .matches(/(?=.*\d)/, "Password must contain at least one number")
      .matches(
        /(?=.*[@$!%*?&])/,
        "Password must contain at least one special character"
      )
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), ""], "Passwords must match")
      .required("Confirm Password is required"),
  });
};

const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center space-x-2 ${
        type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
      }`}
    >
      {type === "success" ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <AlertCircle className="w-5 h-5" />
      )}
      <span>{message}</span>
    </div>
  );
};

const AuthForm = ({
  isLogin,
  onToggle,
  darkMode,
}: {
  isLogin: boolean;
  onToggle: () => void;
  darkMode: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<null | {
    message: string;
    type: "success" | "error";
  }>(null);
  const [showAlreadyLoggedInModal, setShowAlreadyLoggedInModal] =
    useState(false);
  const { login, authData } = useAuth();

  // Check if the user is already logged in
  useEffect(() => {
    if (authData?.user) {
      setShowAlreadyLoggedInModal(true);

      setTimeout(() => {
        window.location.href = "/dashboard"; // Redirect to dashboard if already logged in
      }, 1560);
    }
  }, [authData]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "Court Admin" as const,
    password: "",
    confirmPassword: "",
  };

  const handleSubmit = async (
    values: typeof initialValues,
    {
      setSubmitting,
      setFieldError,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
      setFieldError: (field: string, message: string) => void;
    }
  ) => {
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login user
        const response = await loginUser({
          email: values.email,
          password: values.password,
        });

        if (response.success && response.user) {
          // Store auth data and update context
          const authData = {
            user: response.user,
            token: response.token || "",
            timestamp: Date.now(),
          };
          storeAuthData(response.user, response.token);
          login(authData);

          setToast({
            message: " Login successful",
            type: "success",
          });

          // Redirect to home page after successful login
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1500);
        } else {
          setToast({
            message: response.message || "Login failed",
            type: "error",
          });
        }
      } else {
        // Register user
        const response = await registerUser({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          role: values.role,
          password: values.password,
          confirmPassword: values.confirmPassword,
        });

        if (response.success && response.user) {
          // Store auth data and update context
          const authData = {
            user: response.user,
            token: response.token || "",
            timestamp: Date.now(),
          };
          storeAuthData(response.user, response.token);
          login(authData);

          setToast({
            message: "Account created successfully!",
            type: "success",
          });

          // Redirect to home page after successful registration
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1500);
        } else {
          setToast({
            message: response.message || "Registration failed",
            type: "error",
          });

          // Handle specific field errors
          if (response.message?.includes("email already exists")) {
            setFieldError("email", "This email is already registered");
          }
          if (response.message?.includes("phone number already exists")) {
            setFieldError("phone", "This phone number is already registered");
          }
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setToast({
        message: "An unexpected error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Already Logged In Modal */}
      {showAlreadyLoggedInModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Already Logged In
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  You're already authenticated! Redirecting to your dashboard...
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Loading...
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 rounded-2xl flex items-center justify-center">
            <img
              src={darkMode ? "/logo/icon-dark.png" : "/logo/icon-light.png"}
              alt="Kilungu Law Courts Logo"
              className="w-20 h-20 rounded-sm m-1"
            />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isLogin ? "Sign in to your account" : "Join Kilungu Law Courts"}
          </p>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={getValidationSchema(isLogin)}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Field
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                      <ErrorMessage
                        name="firstName"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Field
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                      <ErrorMessage
                        name="lastName"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Field
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                    <ErrorMessage
                      name="phone"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Field
                      as="select"
                      name="role"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="Staff">Staff</option>
                      <option value="Court Admin">Court Admin</option>
                      {/* <option value="Super Admin">Super Admin</option> */}
                    </Field>
                    <ErrorMessage
                      name="role"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Field
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Field
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {!isLogin && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Field
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>
                      {isLogin ? "Signing In..." : "Creating Account..."}
                    </span>
                  </div>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </Form>
          )}
        </Formik>

        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={onToggle}
              className="ml-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const Gallery = () => {
  const imageNames = ["4.jpg", "5.jpg", "6.jpg"];

  return (
    <div className="relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-500/10 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-6 relative z-10">
        {imageNames.map((name, index) => {
          const dimensions = {
            width: 250,
            height: 400,
          };
          return (
            <div
              key={index}
              className="group transform transition-all duration-500 hover:scale-105 hover:-translate-y-2"
              style={{ width: dimensions.width, height: dimensions.height }}
            >
              <img
                src={`/splash/${name}`}
                alt={`Kilungu Law Courts - Image ${index + 1}`}
                className="object-cover w-full h-full rounded-2xl"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    console.log("Online or Offline: ", navigator.onLine);
    const handleOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);
    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-400/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Offline indicator */}
      {/* {isOffline ||
        (!navigator.onLine && (
          <div className="fixed top-10 left-0 w-full bg-red-500/90 backdrop-blur-sm text-white text-center py-3 z-10 flex items-center justify-center space-x-2">
            <WifiOff className="w-5 h-5" />
            <span>You are offline. Some features may be unavailable.</span>
          </div>
        ))} */}

      {/* Main grid layout */}
      <div className="grid lg:grid-cols-5 min-h-screen">
        {/* Left sidebar - Auth Form */}
        <div className="lg:col-span-2 flex items-center justify-center p-8 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
          <AuthForm
            darkMode={darkMode}
            isLogin={isLogin}
            onToggle={() => setIsLogin(!isLogin)}
          />
        </div>

        {/* Right content area */}
        <div className="lg:col-span-3 flex flex-col">
          {/* Header with search */}
          <div className="p-6 flex items-center justify-between border-b border-white/20 dark:border-slate-700/50">
            <div className="flex items-center space-x-3">
              <img
                src={darkMode ? "/logo/icon-dark.png" : "/logo/icon-light.png"}
                alt="Kilungu Law Courts Logo"
                className="w-20 h-20 mt-8 rounded-sm m-1"
              />

              <div className={"mt-5"}>
                <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  Kilungu Law Courts
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Records & Tracking System
                </p>
              </div>
            </div>

            {/* Connection status */}
            <div className="flex items-center space-x-2">
              {isOffline || !navigator.onLine ? (
                <WifiOff className="w-5 h-5 text-red-500" />
              ) : (
                <Wifi className="w-5 h-5 text-green-500" />
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isOffline || !navigator.onLine ? "Offline" : "Online"}
              </span>
            </div>

            {/* Theme Toggle */}
            <div className="cursor-pointer w-6 h-6">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="relative inline-flex items-center justify-center p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-300 shadow-sm hover:shadow-md"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <SunIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Gallery content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                <Gavel className="inline-block w-8 h-8 mr-2" />
                Kilungu Law Courts - Records & Tracking
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Streamline your legal processes with our comprehensive case
                management system. Designed for modern court operations in
                Kenya.
              </p>
            </div>

            <Gallery />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
