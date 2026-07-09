import React from "react";
import GridShape from "../../components/common/GridShape";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import { MdOutlineLeaderboard, MdOutlineCalendarMonth, MdOutlinePeople } from "react-icons/md";
import logo from "/images/logo/logo.png";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative bg-white dark:bg-gray-900 min-h-screen">
      <div className="relative flex flex-col w-full min-h-screen lg:flex-row">
        {/* Left — Form area */}
        <div className="flex flex-col justify-center flex-1 w-full lg:w-1/2 px-6 py-12 sm:px-10">
          {/* Clienzo logo */}
          <div className="w-full max-w-md mx-auto mb-10">
            <div className="flex items-center">
              <img src={logo} alt="Logo" className="w-20 h-auto" />
              <span className="text-2xl font-bold tracking-tight text-gray-600 dark:text-gray-400">ClienZo</span>
            </div>
          </div>
          {children}
        </div>

        <div className="hidden lg:flex lg:w-1/2 relative bg-[#ff3951] dark:bg-white/5 flex-col items-center justify-center overflow-hidden">
          <GridShape />

          <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-lg">
            {/* Product name */}
            <div className="mb-6">
              <span className="text-4xl font-bold text-white tracking-tight">ClienZo</span>
              <div className="mt-2 h-1 w-16 bg-brand-400 rounded-full mx-auto" />
            </div>

            {/* Tagline */}
            <p className="text-lg text-white/80 font-medium mb-2">
              Lead Management &amp; Appointment System
            </p>
            <p className="text-sm text-white/50 mb-10">
              Purpose-built for IT business development teams.
            </p>

            {/* Feature list */}
            <div className="flex flex-col gap-4 w-full text-left">
              <div className="flex items-start gap-4 rounded-xl bg-white/5 border border-white/10 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <MdOutlineLeaderboard className="text-white size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Lead management</p>
                  <p className="text-xs text-white/50 mt-0.5">
                    Track leads from source to deal — all in one place.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl bg-white/5 border border-white/10 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <MdOutlineCalendarMonth className="text-white size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Meeting scheduling</p>
                  <p className="text-xs text-white/50 mt-0.5">
                    Schedule Google Meet or offline meetings with ease.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl bg-white/5 border border-white/10 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <MdOutlinePeople className="text-white size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Team follow-ups</p>
                  <p className="text-xs text-white/50 mt-0.5">
                    Log contact results and schedule follow-ups effortlessly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme toggler */}
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
