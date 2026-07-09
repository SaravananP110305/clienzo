import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { EyeCloseIcon, EyeIcon } from "../icons";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";
import Label from "../components/form/Label";
import Input from "../components/form/input/InputField";
import { useToast } from "../hooks/useToast";

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePassword() {
  const { showToast } = useToast();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPasswordValue = watch("newPassword");

  const onSubmit = () => {
    showToast("Password changed successfully.", "success");
  };

  const onError = () => {
    showToast("Please fix the form errors before submitting.", "error");
  };

  return (
    <>
      <PageMeta
        title="Change Password | ClienZo"
        description="Change your ClienZo account password."
      />
      <PageBreadcrumb pageTitle="Change password" />

      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6 max-w-2xl">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
          Change password
        </h3>

        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="space-y-5">
            {/* Current Password */}
            <div>
              <Label>
                Current password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Controller
                  name="currentPassword"
                  control={control}
                  rules={{
                    required: "Current password is required",
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter current password"
                      type={showCurrent ? "text" : "password"}
                      className={errors.currentPassword ? "border-error-500" : ""}
                    />
                  )}
                />
                <span
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showCurrent ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              </div>
              {errors.currentPassword && (
                <span className="mt-1.5 text-xs text-error-600 block">{errors.currentPassword.message}</span>
              )}
            </div>

            {/* New Password */}
            <div>
              <Label>
                New password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Controller
                  name="newPassword"
                  control={control}
                  rules={{
                    required: "New password is required",
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
                      placeholder="Enter new password"
                      type={showNew ? "text" : "password"}
                      className={errors.newPassword ? "border-error-500" : ""}
                    />
                  )}
                />
                <span
                  onClick={() => setShowNew(!showNew)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showNew ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              </div>
              {errors.newPassword && (
                <span className="mt-1.5 text-xs text-error-600 block">{errors.newPassword.message}</span>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <Label>
                Confirm new password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Controller
                  name="confirmPassword"
                  control={control}
                  rules={{
                    required: "Please confirm your new password",
                    validate: (value) =>
                      value === newPasswordValue || "Passwords do not match",
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Confirm new password"
                      type={showConfirm ? "text" : "password"}
                      className={errors.confirmPassword ? "border-error-500" : ""}
                    />
                  )}
                />
                <span
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showConfirm ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              </div>
              {errors.confirmPassword && (
                <span className="mt-1.5 text-xs text-error-600 block">{errors.confirmPassword.message}</span>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-white/[0.05]">
              <Button type="submit" size="sm">
                Change password
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
