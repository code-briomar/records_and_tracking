import {
  Button,
  Card,
  CardBody,
  Divider,
  Input,
  Link,
  Select,
  SelectItem,
  Tab,
  Tabs,
} from "@heroui/react";
import React from "react";

export default function AuthForm({ login_formik, signup_formik }: any) {
  const [selected, setSelected] = React.useState<any>("login");

  return (
    // <div className="flex items-center justify-center w-full h-full">
    <Card
      className="max-w-full w-[340px] h-5/6  bg-transparent"
      shadow={"none"}
    >
      <CardBody className="">
        <Tabs
          fullWidth
          aria-label="Tabs form"
          selectedKey={selected}
          size="lg"
          onSelectionChange={setSelected}
        >
          <Tab key="login" title="Login">
            <Button
              isIconOnly
              aria-label="Google"
              color="warning"
              variant="faded"
              className={"mx-2"}
            >
              <img
                src={"./public/icons/google.png"}
                alt="Google"
                className={"p-2"}
              />
            </Button>

            <Button
              isIconOnly
              aria-label="Microsoft"
              color="warning"
              variant="faded"
              className={"mx-2"}
            >
              <img
                src={"./public/icons/microsoft.png"}
                alt="Microsoft"
                className={"p-2"}
              />
            </Button>
            <p className="text-center">or</p>
            <form
              className="flex flex-col gap-4"
              onSubmit={login_formik.handleSubmit}
            >
              <Input
                isRequired
                label="Email"
                placeholder="Enter your email"
                type="email"
                name="login_email"
                onChange={login_formik.handleChange}
                value={login_formik.values.login_email}
                onBlur={login_formik.handleBlur}
              />
              {login_formik.touched.login_email &&
              login_formik.errors.login_email ? (
                <p className="text-red-500">
                  {login_formik.errors.login_email}
                </p>
              ) : null}
              <Input
                isRequired
                label="Password"
                placeholder="Enter your password"
                type="password"
                name="login_password"
                onChange={login_formik.handleChange}
                value={login_formik.values.login_password}
                onBlur={login_formik.handleBlur}
              />
              {login_formik.touched.login_password &&
              login_formik.errors.login_password ? (
                <p className="text-red-500">
                  {login_formik.errors.login_password}
                </p>
              ) : null}
              <p className="text-center text-small">
                Need to create an account?{" "}
                <Link size="sm" onPress={() => setSelected("sign-up")}>
                  Sign up
                </Link>
              </p>
              <Button fullWidth color="primary" type="submit">
                Login
              </Button>
            </form>

            <p className="text-center text-small">
              Forgot your password?{" "}
              <Link size="sm" onPress={() => setSelected("forgot-password")}>
                Reset
              </Link>
            </p>
          </Tab>

          {/* Sign Up */}
          <Tab key="sign-up" title="Sign up">
            <Button
              isIconOnly
              aria-label="Google"
              color="warning"
              variant="faded"
              className={"mx-2"}
            >
              <img
                src={"./public/icons/google.png"}
                alt="Google"
                className={"p-2"}
              />
            </Button>

            <Button
              isIconOnly
              aria-label="Microsoft"
              color="warning"
              variant="faded"
              className={"mx-2"}
            >
              <img
                src={"./public/icons/microsoft.png"}
                alt="Microsoft"
                className={"p-2"}
              />
            </Button>
            <p className="text-center">or</p>
            <Divider className="w-full h-[2px] my-4 bg-default-200/50 dark:bg-default-100/50" />
            <form
              className="flex flex-col gap-4 h-[300px]"
              onSubmit={signup_formik.handleSubmit}
            >
              <div className="flex gap-2">
                <Input
                  isRequired
                  label="First Name"
                  placeholder="Enter your name"
                  name="signup_first_name"
                  onChange={signup_formik.handleChange}
                  value={signup_formik.values.signup_first_name}
                  type="text"
                />

                <Input
                  isRequired
                  label="Last Name"
                  placeholder="Enter your name"
                  onChange={signup_formik.handleChange}
                  value={signup_formik.values.signup_last_name}
                  name="signup_last_name"
                  type="text"
                />
              </div>
              {signup_formik.touched.signup_first_name &&
              signup_formik.errors.signup_first_name ? (
                <p className="text-red-500">
                  {signup_formik.errors.signup_first_name}
                </p>
              ) : null}

              {signup_formik.touched.signup_last_name &&
              signup_formik.errors.signup_last_name ? (
                <p className="text-red-500">
                  {signup_formik.errors.signup_last_name}
                </p>
              ) : null}
              <Input
                isRequired
                label="Email"
                placeholder="Enter your email"
                name="signup_email"
                onChange={signup_formik.handleChange}
                value={signup_formik.values.signup_email}
                type="email"
              />
              {signup_formik.touched.signup_email &&
              signup_formik.errors.signup_email ? (
                <p className="text-red-500">
                  {signup_formik.errors.signup_email}
                </p>
              ) : null}

              {/* Phone Number */}
              <Input
                isRequired
                label="Phone Number"
                placeholder="Enter your phone number"
                name="signup_phone_number"
                onChange={signup_formik.handleChange}
                value={signup_formik.values.signup_phone_number}
                type="text"
              />

              {signup_formik.touched.signup_phone_number &&
              signup_formik.errors.signup_phone_number ? (
                <p className="text-red-500">
                  {signup_formik.errors.signup_phone_number}
                </p>
              ) : null}

              {/* Role */}
              <Select
                label="Role"
                placeholder="Select a role"
                selectedKeys={[signup_formik.values.signup_role]}
                onSelectionChange={(keys) =>
                  signup_formik.setFieldValue(
                    "signup_role",
                    Array.from(keys)[0]
                  )
                }
                className=""
                variant={"bordered"}
              >
                <SelectItem key="Court Admin">Court Admin</SelectItem>
                <SelectItem key="Staff">Staff</SelectItem>
              </Select>

              {signup_formik.touched.signup_role &&
              signup_formik.errors.signup_role ? (
                <p className="text-red-500">
                  {signup_formik.errors.signup_role}
                </p>
              ) : null}

              {/* Password */}

              <Input
                isRequired
                label="Password"
                placeholder="Enter your password"
                name="signup_password"
                onChange={signup_formik.handleChange}
                type="password"
              />

              {signup_formik.touched.signup_password &&
              signup_formik.errors.signup_password ? (
                <p className="text-red-500">
                  {signup_formik.errors.signup_password}
                </p>
              ) : null}

              {/* Confirm Password */}

              <Input
                isRequired
                label="Confirm Password"
                placeholder="Enter your password again"
                name="signup_confirm_password"
                onChange={signup_formik.handleChange}
                type="password"
              />
              {signup_formik.touched.signup_confirm_password &&
              signup_formik.errors.signup_confirm_password ? (
                <p className="text-red-500">
                  {signup_formik.errors.signup_confirm_password}
                </p>
              ) : null}

              {/* Need to create an account? */}

              <p className="text-center text-small">
                Already have an account?{" "}
                <Link size="sm" onPress={() => setSelected("login")}>
                  Login
                </Link>
              </p>

              <div className="flex gap-2 justify-end">
                <Button fullWidth color="primary" type="submit">
                  Sign up
                </Button>
              </div>
              <p className="text-center text-small">
                By Clicking Sign Up, You're agreeing to the{" "}
                <Link
                  size="sm"
                  onPress={() =>
                    window.open("https://www.google.com", "_blank")
                  }
                >
                  Terms and Conditions
                </Link>
              </p>
            </form>
          </Tab>

          {/* Forgot Password */}
          {/* <Tab key="forgot-password" title="Forgot Password">
            <form className="flex flex-col gap-4">
              <Input
                isRequired
                label="Email"
                placeholder="Enter your email"
                name="reset_email"
                type="email"
              />

              <Input
                isRequired
                label="New Password"
                placeholder="Enter your new password"
                name="reset_password"
                type="password"
                }
              />

              <Input
                isRequired
                label="Confirm Password"
                placeholder="Confirm new password"
                name="reset_confirm_password"
                type="password"
                }
              />

              <Button fullWidth color="primary" type="submit">
                Reset Password
              </Button>

              <p className="text-center text-small">
                Remembered your password?{" "}
                <Link size="sm" onPress={() => setSelected("login")}>
                  Go back to login
                </Link>
              </p>
            </form>
          </Tab> */}
        </Tabs>
      </CardBody>
    </Card>
    // </div>
  );
}
