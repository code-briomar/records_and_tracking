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
  }, []);

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
      // Handle login logic here
      const response = await getUserByEmail(values.login_email);

      // Check if user password and password hash match use md5 hash
      const passwordHash = await hashPassword(values.login_password);

      // console.log("Password Hash: ", passwordHash);

      // console.log("Password Hash: ", passwordHash);
      // console.log("Password Hash from DB: ", response);
      const isMatch = await validatePassword(
        values.login_password,
        passwordHash
      );
      if (!isMatch) {
        // console.log("Password is invalid");
        // alert("Invalid password. Please try again.");
        addToast({
          title: "Invalid password",
          description: "Please try again.",
          color: "danger",
          shouldShowTimeoutProgress: true,
        });
        return;
      }

      // // Check if user is active
      if (response.status !== "Active") {
        // alert("User is not active. Please contact admin.");
        addToast({
          title: "User is not active",
          description: "Please contact admin.",
          color: "danger",
          shouldShowTimeoutProgress: true,
        });
        return;
      }

      // Set context and redirect to dashboard
      login(response);
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
        "grid grid-cols-3 gap-4 h-screen overflow-hidden bg-[url('public/light-bg.png')]  dark:bg-[url('public/dark-bg.png')] bg-no-repeat bg-cover"
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
