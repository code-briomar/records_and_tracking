import { addToast, Input } from "@heroui/react";
import bcrypt from "bcryptjs";
import { useFormik } from "formik";
import { SearchIcon } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import AuthForm from "../components/auth_form.tsx";
import AuthFormCarousel from "../components/auth_form_carousel.tsx";
import { useAuth } from "../context/auth_context.tsx";
import { createNotification } from "../services/notifications.ts";
import { addStaff } from "../services/staff.ts";
import { createUser, getUserByEmail } from "../services/users.ts";

const saltRounds = 10;

const hashPassword = async (plainPassword: string) => {
  const hash = await bcrypt.hash(plainPassword, saltRounds);
  return hash;
};

const validatePassword = async (
  plainPassword: string,
  hashedPassword: string
) => {
  const match = await bcrypt.compare(plainPassword, hashedPassword);
  return match; // true if passwords match
};

function Auth() {
  const { login, authData } = useAuth();

  useEffect(() => {
    // Check if user is already logged in
    if (authData) {
      navigate("/dashboard");
    }
  }, [authData]);

  const navigate = useNavigate();
  const login_formik = useFormik({
    initialValues: {
      login_email: "",
      login_password: "",
    },
    validationSchema: Yup.object({
      login_email: Yup.string()
        .email("Invalid email address")
        .required("Required"),
      login_password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Required"),
    }),
    onSubmit: async (values) => {
      const response = await getUserByEmail(values.login_email);

      if (!response || !response.password_hash) {
        addToast({
          title: "User not found",
          description: "Please check your email.",
          color: "danger",
        });
        return;
      }

      const isMatch = await validatePassword(
        values.login_password,
        response.password_hash
      );

      if (!isMatch) {
        addToast({
          title: "Invalid password",
          description: "Please try again.",
          color: "danger",
        });
        return;
      }

      addToast({
        title: "Login successful",
        description: "",
        color: "success",
        shouldShowTimeoutProgress: true,
      });

      // If match, login user
      login(response); // Store user data in auth context
      navigate("/dashboard");
    },
  });

  const signup_formik = useFormik({
    initialValues: {
      signup_first_name: "",
      signup_last_name: "",
      signup_phone_number: "",
      signup_role: "" as "Super Admin" | "Court Admin" | "Staff",
      signup_email: "",
      signup_password: "",
      signup_confirm_password: "",
    },
    validationSchema: Yup.object({
      signup_email: Yup.string()
        .email("Invalid email address")
        .required("Required"),
      signup_password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Required"),
      signup_confirm_password: Yup.string()
        .oneOf([Yup.ref("signup_password"), undefined], "Passwords must match")
        .required("Required"),
    }),
    onSubmit: async (values) => {
      addToast({
        title: "Creating user...",
        description: "",
        color: "default",
        shouldShowTimeoutProgress: true,
      });
      // Handle signup logic here
      // console.log(values);

      // Hash the password before sending it to the server
      const hashedPassword = await hashPassword(values.signup_password);
      console.log("Hashed Password: ", hashedPassword);

      // Send the hashed password to the server
      const response = await createUser({
        name: `${values.signup_first_name} ${values.signup_last_name}`,
        role: values.signup_role as "Super Admin" | "Court Admin" | "Staff",
        email: values.signup_email,
        phoneNumber: values.signup_phone_number,
        passwordHash: hashedPassword,
      });

      addToast({
        title: response.toString(),
        description: "",
        color: "success",
        shouldShowTimeoutProgress: true,
      });

      if (!response) {
        console.log("Error creating user");
        addToast({
          title: "Internal Error",
          description: "Please try again.",
          color: "danger",
          shouldShowTimeoutProgress: true,
        });
        return;
      }

      // Response is the user ID
      const staff_response = await addStaff(
        response,
        values.signup_role as "Super Admin" | "Court Admin" | "Staff",
        values.signup_phone_number,
        "Active"
      );

      if (!staff_response) {
        console.log("Error creating staff member");
        addToast({
          title: "Internal Error",
          description: "Please try again.",
          color: "danger",
          shouldShowTimeoutProgress: true,
        });
        return;
      }

      console.log("User created successfully with ID:", response);

      const notification_response = await createNotification(
        `${values.signup_last_name} ${values.signup_first_name} has signed up`,
        "Info"
      );

      if (!notification_response) {
        console.log("Error creating notification");
        addToast({
          title: "Internal Error",
          description: "Please try again.",
          color: "danger",
          shouldShowTimeoutProgress: true,
        });
        return;
      }

      console.log(
        "Notification created successfully with ID:",
        notification_response
      );

      addToast({
        title: "User created successfully",
        description: "",
        color: "success",
        shouldShowTimeoutProgress: true,
      });

      // Set context and redirect to dashboard
      login({
        id: response,
        name: `${values.signup_first_name} ${values.signup_last_name}`,
        role: values.signup_role as "Super Admin" | "Court Admin" | "Staff",
        email: values.signup_email,
        phoneNumber: values.signup_phone_number,
        passwordHash: hashedPassword,
      });
      navigate("/dashboard");
    },
  });

  return (
    <div
      className={
        "grid grid-cols-3 gap-4 h-screen overflow-hidden bg-[url('light-bg.png')]  dark:bg-[url('dark-bg.png')] bg-no-repeat bg-cover"
      }
    >
      <div
        className="col-span-1 shadow-sm rounded-none h-screen w-full border-none
    bg-background/60 dark:bg-default-100/50 flex items-center justify-center
    backdrop-blur-md"
      >
        <AuthForm login_formik={login_formik} signup_formik={signup_formik} />
      </div>

      <div className="col-span-2">
        {/* Search Bar To Explore The News */}
        <div className="flex items-center justify-center h-[30px] m-4">
          <Input
            disabled
            isClearable
            classNames={{
              label: "text-black/50 dark:text-white/90",
              input: [
                "bg-transparent",
                "text-black/90 dark:text-white/90",
                "placeholder:text-default-700 dark:placeholder:text-white/60",
                // Center the placeholder text
                "text-center",
              ],
              innerWrapper: "bg-transparent",
              inputWrapper: [
                "shadow-md",
                "bg-default-200/50",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focus=true]:bg-default-200/50",
                "dark:group-data-[focus=true]:bg-default/60",
                "!cursor-text",
              ],
            }}
            placeholder="Explore"
            radius="lg"
            startContent={
              // Center the icon
              <SearchIcon className="mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
            }
          />
        </div>

        <AuthFormCarousel />
      </div>
    </div>
  );
}

export default Auth;
