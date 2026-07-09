import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm, Controller } from "react-hook-form";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import DatePicker from "../../../components/form/date-picker";
import { MeetingType, MeetingStatus, initialMeetings } from "../data/meetingsData";
import { useToast } from "../../../hooks/useToast";

interface MeetingFormValues {
  subject: string;
  company: string;
  contactPerson: string;
  date: string;
  time: string;
  type: MeetingType;
  linkOrLocation: string;
  status: MeetingStatus;
  notes: string;
}

export default function MeetingForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<MeetingFormValues>({
    defaultValues: {
      subject: "",
      company: "",
      contactPerson: "",
      date: "",
      time: "",
      type: "Google Meet",
      linkOrLocation: "",
      status: "Scheduled",
      notes: "",
    },
  });

  const type = watch("type");

  useEffect(() => {
    if (isEditMode) {
      const meeting = initialMeetings.find((m) => m.id === Number(id));
      if (meeting) {
        reset({
          subject: meeting.subject,
          company: meeting.company,
          contactPerson: meeting.contactPerson,
          date: meeting.date,
          time: meeting.time,
          type: meeting.type,
          linkOrLocation: meeting.linkOrLocation,
          status: meeting.status,
          notes: meeting.notes,
        });
      }
    }
    setLoading(false);
  }, [id, isEditMode, reset]);

  const handleSave = () => {
    showToast(
      isEditMode ? "Meeting updated successfully." : "Meeting scheduled successfully.",
      "success"
    );
    navigate("/meetings/upcoming");
  };

  const handleError = () => {
    showToast("Please fill all required fields.", "error");
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading meeting details...</div>;
  }

  return (
    <>
      <PageMeta
        title={`${isEditMode ? "Edit Meeting" : "Add Meeting"} | ClienZo`}
        description="Schedule or edit a meeting in ClienZo CRM."
      />
      <PageBreadcrumb pageTitle={isEditMode ? "Edit meeting" : "Add meeting"} />

      <form
        onSubmit={handleSubmit(handleSave, handleError)}
        className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6"
      >
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
          Meeting details
        </h3>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-6">
          {/* Subject */}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Meeting subject <span className="text-error-500">*</span>
            </label>
            <Controller
              name="subject"
              control={control}
              rules={{
                required: "Subject is required",
                minLength: { value: 3, message: "Subject must be at least 3 characters" },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder="Enter meeting subject / agenda"
                  className={errors.subject ? "border-error-500 focus:ring-error-500/10" : ""}
                />
              )}
            />
            {errors.subject && (
              <span className="mt-1.5 text-xs text-error-600 block">{errors.subject.message}</span>
            )}
          </div>

          {/* Company / Lead */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Company / Lead <span className="text-error-500">*</span>
            </label>
            <Controller
              name="company"
              control={control}
              rules={{
                required: "Company/Lead name is required",
                pattern: {
                  value: /^[a-zA-Z0-9\s&.,-]+$/,
                  message: "Allow letters, numbers, spaces, &, ., -, and commas only",
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder="Enter company name"
                  className={errors.company ? "border-error-500 focus:ring-error-500/10" : ""}
                />
              )}
            />
            {errors.company && (
              <span className="mt-1.5 text-xs text-error-600 block">{errors.company.message}</span>
            )}
          </div>

          {/* Contact Person */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contact person <span className="text-error-500">*</span>
            </label>
            <Controller
              name="contactPerson"
              control={control}
              rules={{
                required: "Contact person is required",
                pattern: {
                  value: /^[a-zA-Z\s]+$/,
                  message: "Letters and spaces only",
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder="Enter contact person name"
                  className={errors.contactPerson ? "border-error-500 focus:ring-error-500/10" : ""}
                />
              )}
            />
            {errors.contactPerson && (
              <span className="mt-1.5 text-xs text-error-600 block">
                {errors.contactPerson.message}
              </span>
            )}
          </div>

          {/* Date Picker */}
          <div>
            <Controller
              name="date"
              control={control}
              rules={{ required: "Meeting date is required" }}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  id="meeting-date-picker"
                  label="Meeting Date"
                  placeholder="Select meeting date"
                  defaultDate={value}
                  onChange={(_, dateStr) => onChange(dateStr)}
                />
              )}
            />
            {errors.date && (
              <span className="mt-1.5 text-xs text-error-600 block">{errors.date.message}</span>
            )}
          </div>

          {/* Time Picker */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Meeting Time <span className="text-error-500">*</span>
            </label>
            <Controller
              name="time"
              control={control}
              rules={{ required: "Meeting time is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="time"
                  className={errors.time ? "border-error-500 focus:ring-error-500/10" : ""}
                />
              )}
            />
            {errors.time && (
              <span className="mt-1.5 text-xs text-error-600 block">{errors.time.message}</span>
            )}
          </div>

          {/* Meeting Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Meeting Type <span className="text-error-500">*</span>
            </label>
            <Controller
              name="type"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  options={[
                    { value: "Google Meet", label: "Google Meet" },
                    { value: "Offline", label: "Offline" },
                  ]}
                  placeholder="Select meeting type"
                  defaultValue={value}
                  onChange={(val) => {
                    onChange(val);
                    setValue("linkOrLocation", "");
                  }}
                />
              )}
            />
          </div>

          {/* Location / Meet Link */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {type === "Google Meet" ? "Google Meet Link" : "Location / Venue"}{" "}
              <span className="text-error-500">*</span>
            </label>
            <Controller
              name="linkOrLocation"
              control={control}
              rules={{
                required:
                  type === "Google Meet" ? "Meet link is required" : "Location/Venue is required",
                validate: (val) => {
                  if (type === "Google Meet") {
                    const urlPattern =
                      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
                    return urlPattern.test(val) || "Please enter a valid Google Meet URL";
                  }
                  return val.trim().length >= 5 || "Location must be at least 5 characters";
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder={
                    type === "Google Meet"
                      ? "https://meet.google.com/..."
                      : "Enter location address"
                  }
                  className={errors.linkOrLocation ? "border-error-500 focus:ring-error-500/10" : ""}
                />
              )}
            />
            {errors.linkOrLocation && (
              <span className="mt-1.5 text-xs text-error-600 block">
                {errors.linkOrLocation.message}
              </span>
            )}
          </div>

          {/* Meeting Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Meeting Status <span className="text-error-500">*</span>
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  options={[
                    { value: "Scheduled", label: "Scheduled" },
                    { value: "Completed", label: "Completed" },
                    { value: "Cancelled", label: "Cancelled" },
                    { value: "Rescheduled", label: "Rescheduled" },
                  ]}
                  placeholder="Select status"
                  defaultValue={value}
                  onChange={onChange}
                />
              )}
            />
          </div>

          {/* Meeting Notes */}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Agenda Notes
            </label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  placeholder="Enter meeting notes, links, or documents"
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  rows={3}
                />
              )}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
          <Button size="sm" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" type="submit">
            Save meeting
          </Button>
        </div>
      </form>
    </>
  );
}
