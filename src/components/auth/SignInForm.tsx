import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useToast } from "../../hooks/useToast";

interface SignInFormValues {
  email: string;
  password: string;
  keepLoggedIn: boolean;
}

export default function SignInForm() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    defaultValues: {
      email: "",
      password: "",
      keepLoggedIn: false,
    },
  });

  const onSubmit = () => {
    showToast("Sign in successful.", "success");
    navigate("/dashboard");
  };

  const onError = (formErrors: any) => {
    if (formErrors.email?.type === "pattern") {
      showToast("Please enter a valid email address.", "error");
    } else {
      showToast("Please fill all required fields.", "error");
    }
  };

  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md px-6 mx-auto lg:px-0">
      <div className="mb-8">
        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
          Sign in
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter your credentials to access your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className="space-y-5">
          <div>
            <Label>
              Email <span className="text-error-500">*</span>
            </Label>
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Please enter a valid email address.",
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="info@clienzo.com"
                  className={errors.email ? "border-error-500" : ""}
                />
              )}
            />
            {errors.email && (
              <span className="mt-1.5 text-xs text-error-600 block">{errors.email.message}</span>
            )}
          </div>

          <div>
            <Label>
              Password <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Controller
                name="password"
                control={control}
                rules={{ required: "Password is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={errors.password ? "border-error-500" : ""}
                  />
                )}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                )}
              </span>
            </div>
            {errors.password && (
              <span className="mt-1.5 text-xs text-error-600 block">{errors.password.message}</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Controller
                name="keepLoggedIn"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Checkbox checked={value} onChange={onChange} />
                )}
              />
              <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                Keep me logged in
              </span>
            </div>
            <Link
              to="/reset-password"
              onClick={(e) => {
                e.preventDefault();
                showToast("Password reset feature is not yet available.", "info");
              }}
              className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" size="sm">
            Sign in
          </Button>
        </div>
      </form>

      <div className="mt-6">
        <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
