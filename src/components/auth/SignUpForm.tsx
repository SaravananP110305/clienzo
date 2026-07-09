import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useToast } from "../../hooks/useToast";

interface SignUpFormValues {
  fname: string;
  lname: string;
  email: string;
  password: string;
}

export default function SignUpForm() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    defaultValues: {
      fname: "",
      lname: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = () => {
    showToast("User created successfully.", "success");
    navigate("/signin");
  };

  const onError = (formErrors: any) => {
    if (formErrors.email?.type === "pattern") {
      showToast("Please enter a valid email address.", "error");
    } else if (formErrors.fname?.type === "pattern" || formErrors.lname?.type === "pattern") {
      showToast("Names must contain letters and spaces only.", "error");
    } else if (formErrors.password?.type === "pattern") {
      showToast("Please enter a stronger password.", "error");
    } else {
      showToast("Please fill all required fields.", "error");
    }
  };

  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md px-6 mx-auto overflow-y-auto lg:px-0 no-scrollbar">
      <div className="mb-8">
        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
          Create account
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Fill in the details below to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* First Name */}
            <div>
              <Label>
                First name <span className="text-error-500">*</span>
              </Label>
              <Controller
                name="fname"
                control={control}
                rules={{
                  required: "First name is required",
                  pattern: {
                    value: /^[a-zA-Z\s]+$/,
                    message: "Letters and spaces only",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder="Enter first name"
                    className={errors.fname ? "border-error-500" : ""}
                  />
                )}
              />
              {errors.fname && (
                <span className="mt-1.5 text-xs text-error-600 block">{errors.fname.message}</span>
              )}
            </div>

            {/* Last Name */}
            <div>
              <Label>
                Last name <span className="text-error-500">*</span>
              </Label>
              <Controller
                name="lname"
                control={control}
                rules={{
                  required: "Last name is required",
                  pattern: {
                    value: /^[a-zA-Z\s]+$/,
                    message: "Letters and spaces only",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder="Enter last name"
                    className={errors.lname ? "border-error-500" : ""}
                  />
                )}
              />
              {errors.lname && (
                <span className="mt-1.5 text-xs text-error-600 block">{errors.lname.message}</span>
              )}
            </div>
          </div>

          {/* Email */}
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
                  type="email"
                  placeholder="Enter your email"
                  className={errors.email ? "border-error-500" : ""}
                />
              )}
            />
            {errors.email && (
              <span className="mt-1.5 text-xs text-error-600 block">{errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div>
            <Label>
              Password <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Controller
                name="password"
                control={control}
                rules={{
                  required: "Password is required",
                  pattern: {
                    value:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message:
                      "Min 8 characters with uppercase, lowercase, number and special character.",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
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

          <Button type="submit" className="w-full">
            Create account
          </Button>
        </div>
      </form>

      <div className="mt-6">
        <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
          Already have an account?{" "}
          <Link to="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
