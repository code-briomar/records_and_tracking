import { invoke } from "@tauri-apps/api/core";
import bcrypt from "bcryptjs";

export interface User {
  user_id: number;
  name: string;
  role: "Super Admin" | "Court Admin" | "Staff";
  email: string;
  phone_number: string;
  password_hash: string;
  status: string;
}

export interface LoginCredentials {
  courtId: string;
  email: string;
  role: string;
  password: string;
}

export interface SignupData {
  courtId: string;
  fullName: string;
  email: string;
  role: string;
  professionalTitle?: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  user?: Omit<User, "password_hash">;
  token?: string;
  message?: string;
}

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Verify a password against a hash
 */
export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

/**
 * Login user with email and password via Firebase Auth
 */
export const loginUser = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  try {
    const { courtId, email, role, password } = credentials;

    // Step 1: Authenticate with Firebase
    const firebaseResult: { success: boolean; firebase_uid: string; court_id: string | null; message: string } =
      await invoke("firebase_login", { email, password, courtId });

    if (!firebaseResult.success) {
      return {
        success: false,
        message: firebaseResult.message || "Firebase authentication failed",
      };
    }

    // Step 2: Get or create local user record
    let user: User | null = null;
    try {
      user = await invoke("get_user_by_email", { email });
    } catch {
      // User doesn't exist locally yet
    }

    if (!user || !user.user_id) {
      // User exists in Firebase but not locally - create a local record
      const passwordHash = await hashPassword(password);
      const userId: number = await invoke("create_user", {
        name: email.split("@")[0],
        role,
        email,
        phoneNumber: null,
        passwordHash,
        professionalTitle: null,
      });
      user = await invoke("get_user", { userId });
    }

    if (!user) {
      return {
        success: false,
        message: "Failed to retrieve user profile",
      };
    }

    // Check if user is active
    if (user.status !== "Active") {
      return {
        success: false,
        message: "Account is not active. Please contact administrator.",
      };
    }

    const { password_hash, ...userWithoutPassword } = user;

    return {
      success: true,
      user: userWithoutPassword,
      message: "Login successful",
    };
  } catch (error) {
    console.error("Login error:", error);
    // Provide the actual error message from Firebase if available
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: errorMessage || "An error occurred during login. Please try again.",
    };
  }
};

/**
 * Register a new user
 */
export const registerUser = async (
  userData: SignupData
): Promise<AuthResponse> => {
  try {
    const {
      courtId,
      fullName,
      email,
      role,
      professionalTitle,
      password,
      confirmPassword,
    } = userData;

    // Validate passwords match
    if (password !== confirmPassword) {
      return {
        success: false,
        message: "Passwords do not match",
      };
    }

    // Check if user already exists
    const existingUser = await invoke("get_user_by_email", { email });
    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists",
      };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId: number = await invoke("create_user", {
      name: fullName,
      role,
      email,
      phoneNumber: null,
      passwordHash,
      professionalTitle: professionalTitle || null,
    });

    // Get the created user
    const newUser: User = await invoke("get_user", { userId });
    const { password_hash, ...userWithoutPassword } = newUser;

    // Set court ID in backend state
    await invoke("set_court_id", { courtId });

    return {
      success: true,
      user: userWithoutPassword,
      message: "Account created successfully",
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "An error occurred during registration. Please try again.",
    };
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (
  password: string
): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  if (!/(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character (@$!%*?&)",
    };
  }

  return { isValid: true };
};

/**
 * Generate a session token (for demo purposes - in production, use JWT or similar)
 */
export const generateSessionToken = (): string => {
  return btoa(Date.now().toString() + Math.random().toString(36));
};

/**
 * Store authentication data in localStorage
 */
export const storeAuthData = (
  user: Omit<User, "password_hash">,
  token?: string
): void => {
  const authData = {
    user,
    token: token || generateSessionToken(),
    timestamp: Date.now(),
  };
  localStorage.setItem("authData", JSON.stringify(authData));
};

/**
 * Get authentication data from localStorage
 */
export const getAuthData = (): {
  user: Omit<User, "password_hash">;
  token: string;
  timestamp: number;
} | null => {
  const stored = localStorage.getItem("authData");
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

/**
 * Clear authentication data and logout from Firebase
 */
export const clearAuthData = async (): Promise<void> => {
  localStorage.removeItem("authData");
  try {
    await invoke("firebase_logout");
  } catch {
    // Ignore logout errors
  }
};

/**
 * Trigger a manual sync with Firebase Firestore
 */
export const triggerSync = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const result: { success: boolean; message: string } = await invoke("trigger_sync");
    return result;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const authData = getAuthData();
  if (!authData) return false;

  // Check if token is expired (24 hours)
  const twentyFourHours = 24 * 60 * 60 * 1000;
  const isExpired = Date.now() - authData.timestamp > twentyFourHours;

  if (isExpired) {
    clearAuthData();
    return false;
  }

  return true;
};
