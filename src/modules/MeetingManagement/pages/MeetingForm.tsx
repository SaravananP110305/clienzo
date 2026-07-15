import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useForm, Controller } from "react-hook-form";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import DatePicker from "../../../components/form/date-picker";
import { initialMeetings, Meeting } from "../data/meetingsData";
import { useToast } from "../../../hooks/useToast";
import { getStorage, setStorage } from "../../../utils/storage";
import { Lead, initialLeads } from "../../LeadManagement/data/leadsData";
import { Client, initialClients } from "../../ClientManagement/data/clientsData";
import { ChevronDownIcon } from "../../../icons";

interface MeetingFormValues {
  subject: string;
  company: string;
  contactPerson: string;
  date: string;
  time: string;
  type: string;
  linkOrLocation: string;
  notes: string;

  relatedToType: "Lead" | "Client";
  relatedToId: number;
  meetingType: string;
  meetingPlatform: string;
  startTime: string;
  endTime: string;
  duration: string;
  timezone: string;
  meetingOwner: string[];
  clientContactPerson: string;
  attendees: string;
  summary: string;
}

const EMPLOYEES = ["John Doe", "Jane Smith", "Alice Johnson", "Robert Lee"];

const MEETING_TYPES = [
  "Online",
  "Offline",
  "Client Visit",
  "Office Meeting",
  "Demo Meeting",
  "Requirement Discussion",
  "Review Meeting"
];

const MEETING_PLATFORMS = [
  "Google Meet",
  "Zoom",
  "Microsoft Teams",
  "Office",
  "Client Office"
];

interface MeetingFormProps {
  onSave?: (meeting: Meeting, isEdit: boolean) => void;
}

export default function MeetingForm({ onSave }: MeetingFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = !!id;
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

  // Lists
  const leads = useMemo(() => getStorage<Lead[]>("saiflow_leads", initialLeads), []);
  const clients = useMemo(() => getStorage<Client[]>("saiflow_clients", initialClients), []);

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
      notes: "",
      relatedToType: "Lead",
      relatedToId: 0,
      meetingType: "Requirement Discussion",
      meetingPlatform: "Google Meet",
      startTime: "",
      endTime: "",
      duration: "30 mins",
      timezone: "IST",
      meetingOwner: [],
      clientContactPerson: "",
      attendees: "",
      summary: "",
    },
  });

  const relatedToType = watch("relatedToType");
  const meetingPlatform = watch("meetingPlatform");
  const currentMeetingOwner = watch("meetingOwner") || [];

  // Employee Multi-Select Dropdown state
  const [isOwnerDropdownOpen, setIsOwnerDropdownOpen] = useState(false);
  const [ownerSearch, setOwnerSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOwnerDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pre-fill logic
  useEffect(() => {
    if (isEditMode) {
      const meetings = getStorage<Meeting[]>("saiflow_meetings", initialMeetings);
      const meeting = meetings.find((m) => m.id === Number(id));
      if (meeting) {
        reset({
          subject: meeting.subject,
          company: meeting.company,
          contactPerson: meeting.contactPerson,
          date: meeting.date,
          time: meeting.time,
          type: meeting.type || meeting.meetingPlatform || "Google Meet",
          linkOrLocation: meeting.linkOrLocation,
          notes: meeting.notes,
          relatedToType: meeting.relatedToType || "Lead",
          relatedToId: meeting.relatedToId || 0,
          meetingType: meeting.meetingType || "Requirement Discussion",
          meetingPlatform: meeting.meetingPlatform || meeting.type || "Google Meet",
          startTime: meeting.startTime || meeting.time || "",
          endTime: meeting.endTime || "",
          duration: meeting.duration || "30 mins",
          timezone: meeting.timezone || "IST",
          meetingOwner: meeting.meetingOwner || [],
          clientContactPerson: meeting.clientContactPerson || meeting.contactPerson || "",
          attendees: meeting.attendees || "",
          summary: meeting.summary || meeting.agenda || "",
        });
      }
    } else {
      // Query parameters pre-fill (e.g. from Lead Details or Client Details)
      const qRelatedType = searchParams.get("relatedType") as "Lead" | "Client";
      const qRelatedId = searchParams.get("relatedId");

      if (qRelatedType && qRelatedId) {
        const idNum = Number(qRelatedId);
        setValue("relatedToType", qRelatedType);
        setValue("relatedToId", idNum);

        if (qRelatedType === "Lead") {
          const lead = leads.find((l) => l.id === idNum);
          if (lead) {
            setValue("company", lead.company);
            setValue("contactPerson", lead.contactPerson);
            setValue("clientContactPerson", lead.contactPerson);
          }
        } else {
          const client = clients.find((c) => c.id === idNum);
          if (client) {
            setValue("company", client.company);
            setValue("contactPerson", client.name);
            setValue("clientContactPerson", client.name);
          }
        }
      }
    }
    setLoading(false);
  }, [id, isEditMode, reset, searchParams, leads, clients, setValue]);

  // Handle Related To selection change
  const handleRelatedChange = (typeVal: "Lead" | "Client", idVal: number) => {
    setValue("relatedToId", idVal);
    if (typeVal === "Lead") {
      const lead = leads.find((l) => l.id === idVal);
      if (lead) {
        setValue("company", lead.company);
        setValue("contactPerson", lead.contactPerson);
        setValue("clientContactPerson", lead.contactPerson);
      } else {
        setValue("company", "");
        setValue("contactPerson", "");
        setValue("clientContactPerson", "");
      }
    } else {
      const client = clients.find((c) => c.id === idVal);
      if (client) {
        setValue("company", client.company);
        setValue("contactPerson", client.name);
        setValue("clientContactPerson", client.name);
      } else {
        setValue("company", "");
        setValue("contactPerson", "");
        setValue("clientContactPerson", "");
      }
    }
  };

  const handleSave = (data: MeetingFormValues) => {
    const meetings = getStorage<Meeting[]>("saiflow_meetings", initialMeetings);
    let updatedMeeting: Meeting;
    
    // Ensure 'type' matches 'meetingPlatform' for backwards compatibility
    const finalMeeting: Meeting = {
      id: isEditMode ? Number(id) : 0,
      subject: data.subject,
      company: data.company,
      contactPerson: data.contactPerson,
      date: data.date,
      time: data.startTime || data.time,
      type: data.meetingPlatform,
      linkOrLocation: data.linkOrLocation,
      status: "Scheduled",
      notes: data.summary || data.notes || "",
      relatedToType: data.relatedToType,
      relatedToId: data.relatedToId,
      meetingType: data.meetingType,
      meetingPlatform: data.meetingPlatform,
      startTime: data.startTime,
      endTime: data.endTime,
      duration: data.duration,
      timezone: data.timezone,
      meetingOwner: data.meetingOwner,
      clientContactPerson: data.clientContactPerson,
      attendees: data.attendees,
      summary: data.summary,
    };

    if (isEditMode) {
      finalMeeting.id = Number(id);
      updatedMeeting = finalMeeting;
    } else {
      const newId = meetings.length > 0 ? Math.max(...meetings.map((m) => m.id)) + 1 : 1;
      finalMeeting.id = newId;
      updatedMeeting = finalMeeting;
    }

    if (onSave) {
      onSave(updatedMeeting, isEditMode);
    } else {
      let updatedList: Meeting[];
      if (isEditMode) {
        updatedList = meetings.map((m) => m.id === updatedMeeting.id ? updatedMeeting : m);
      } else {
        updatedList = [...meetings, updatedMeeting];
      }
      setStorage("saiflow_meetings", updatedList);
    }

    showToast(
      isEditMode ? "Meeting updated successfully." : "Meeting scheduled successfully.",
      "success"
    );
    navigate("/meetings");
  };

  const handleError = () => {
    showToast("Please fill all required fields.", "error");
  };

  const toggleOwner = (owner: string) => {
    const index = currentMeetingOwner.indexOf(owner);
    const newOwners = [...currentMeetingOwner];
    if (index === -1) {
      newOwners.push(owner);
    } else {
      newOwners.splice(index, 1);
    }
    setValue("meetingOwner", newOwners);
  };

  const filteredEmployees = EMPLOYEES.filter((emp) =>
    emp.toLowerCase().includes(ownerSearch.toLowerCase())
  );

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading meeting details...</div>;
  }

  const isLockRelated = searchParams.get("relatedType") && searchParams.get("relatedId");

  return (
    <>
      <PageMeta
        title={`${isEditMode ? "Edit Meeting" : "Schedule Meeting"} | SaiFlow`}
        description="Schedule or edit a meeting in SaiFlow CRM."
      />
      <PageBreadcrumb pageTitle={isEditMode ? "Edit meeting" : "Schedule meeting"} />

      <form
        onSubmit={handleSubmit(handleSave, handleError)}
        className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6 space-y-6"
      >
        {/* Section 1: Meeting Info */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Meeting Information
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">
                Meeting Title <span className="text-error-500">*</span>
              </label>
              <Controller
                name="subject"
                control={control}
                rules={{ required: "Meeting title is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder="E.g., Requirement Discussion"
                    error={!!errors.subject}
                  />
                )}
              />
              {errors.subject && (
                <span className="mt-1.5 text-xs text-error-600 block">{errors.subject.message}</span>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">
                Meeting Type <span className="text-error-500">*</span>
              </label>
              <Controller
                name="meetingType"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select
                    options={MEETING_TYPES.map((t) => ({ value: t, label: t }))}
                    placeholder="Select meeting type"
                    defaultValue={value}
                    onChange={onChange}
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Related To */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Related To
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-500 dark:text-gray-400">
                Related {relatedToType}
              </label>
              <Controller
                name="relatedToId"
                control={control}
                rules={{ required: true, min: { value: 1, message: `Please select a ${relatedToType}` } }}
                render={({ field: { value } }) => (
                  <Select
                    disabled={!!isLockRelated}
                    options={
                      relatedToType === "Lead"
                        ? leads.map((l) => ({ value: l.id.toString(), label: `${l.company} (${l.contactPerson})` }))
                        : clients.map((c) => ({ value: c.id.toString(), label: `${c.company} (${c.name})` }))
                    }
                    placeholder={`Select related ${relatedToType}`}
                    defaultValue={value ? value.toString() : ""}
                    onChange={(val) => handleRelatedChange(relatedToType, Number(val))}
                  />
                )}
              />
              {errors.relatedToId && (
                <span className="mt-1.5 text-xs text-error-600 block">Selection is required.</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Schedule */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Schedule
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Controller
                name="date"
                control={control}
                rules={{ required: "Date is required" }}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    id="meeting-date-picker"
                    label="Meeting Date"
                    placeholder="Select meeting date"
                    defaultDate={value}
                    onChange={(_, dateStr) => onChange(dateStr)}
                    required={true}
                  />
                )}
              />
              {errors.date && (
                <span className="mt-1.5 text-xs text-error-600 block">{errors.date.message}</span>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">
                Start Time <span className="text-error-500">*</span>
              </label>
              <Controller
                name="startTime"
                control={control}
                rules={{ required: "Start time is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="time"
                    error={!!errors.startTime}
                  />
                )}
              />
              {errors.startTime && (
                <span className="mt-1.5 text-xs text-error-600 block">{errors.startTime.message}</span>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">
                End Time <span className="text-error-500">*</span>
              </label>
              <Controller
                name="endTime"
                control={control}
                rules={{ required: "End time is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="time"
                    error={!!errors.endTime}
                  />
                )}
              />
              {errors.endTime && (
                <span className="mt-1.5 text-xs text-error-600 block">{errors.endTime.message}</span>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">
                Duration
              </label>
              <Controller
                name="duration"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder="E.g., 45 mins"
                  />
                )}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">
                Timezone
              </label>
              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder="E.g., IST / UTC"
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Participants */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Participants
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Multi-select Meeting Owner */}
            <div className="relative" ref={dropdownRef}>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">
                Meeting Owner (Multi Select)
              </label>
              <div
                onClick={() => setIsOwnerDropdownOpen(!isOwnerDropdownOpen)}
                className="min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 flex flex-wrap gap-1 items-center justify-between cursor-pointer"
              >
                <div className="flex flex-wrap gap-1">
                  {currentMeetingOwner.length > 0 ? (
                    currentMeetingOwner.map((owner) => (
                      <span
                        key={owner}
                        className="inline-flex items-center rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                      >
                        {owner}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-450 dark:text-gray-500 text-xs">Select employees...</span>
                  )}
                </div>
                <ChevronDownIcon className="w-4 h-4 text-gray-500 shrink-0" />
              </div>

              {isOwnerDropdownOpen && (
                <div className="absolute left-0 z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-905 bg-white dark:bg-gray-900">
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={ownerSearch}
                    onChange={(e) => setOwnerSearch(e.target.value)}
                    className="w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-xs text-gray-800 dark:border-gray-700 dark:text-white mb-2 focus:outline-none focus:border-brand-500"
                  />
                  <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                    {filteredEmployees.map((emp) => {
                      const isChecked = currentMeetingOwner.includes(emp);
                      return (
                        <div
                          key={emp}
                          onClick={() => toggleOwner(emp)}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="h-3.5 w-3.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                          />
                          <span className="text-gray-700 dark:text-gray-300">{emp}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">
                Client Contact Person
              </label>
              <Controller
                name="clientContactPerson"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder="Contact person name"
                  />
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">
                Attendees
              </label>
              <Controller
                name="attendees"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder="E.g., John Doe, Alice Smith, Charlie Brown"
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Section 5: Meeting Platform */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Meeting Platform
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">
                Meeting Platform <span className="text-error-500">*</span>
              </label>
              <Controller
                name="meetingPlatform"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select
                    options={MEETING_PLATFORMS.map((p) => ({ value: p, label: p }))}
                    placeholder="Select platform"
                    defaultValue={value}
                    onChange={(val) => {
                      onChange(val);
                      setValue("linkOrLocation", "");
                    }}
                  />
                )}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">
                {meetingPlatform === "Google Meet" || meetingPlatform === "Zoom" || meetingPlatform === "Microsoft Teams"
                  ? "Meeting Link"
                  : "Venue / Location Address"}{" "}
                <span className="text-error-500">*</span>
              </label>
              <Controller
                name="linkOrLocation"
                control={control}
                rules={{
                  required: "Link / Location is required",
                  validate: (val) => {
                    const isOnline = ["Google Meet", "Zoom", "Microsoft Teams"].includes(meetingPlatform);
                    if (isOnline) {
                      const urlPattern =
                        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
                      return urlPattern.test(val) || "Please enter a valid URL";
                    }
                    return val.trim().length >= 5 || "Location must be at least 5 characters";
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder={
                      ["Google Meet", "Zoom", "Microsoft Teams"].includes(meetingPlatform)
                        ? "Enter meeting URL"
                        : "Enter office address"
                    }
                    error={!!errors.linkOrLocation}
                  />
                )}
              />
              {errors.linkOrLocation && (
                <span className="mt-1.5 text-xs text-error-600 block">{errors.linkOrLocation.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 6: Meeting Details */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Meeting Details
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">
                Summary
              </label>
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder="Enter meeting summary, agenda, discussion points, and outcomes..."
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-805 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    rows={5}
                  />
                )}
              />
            </div>
          </div>
        </div>


        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
          <Button size="sm" type="button" variant="outline" onClick={handleCancel}>
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
