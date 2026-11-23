"use client";

import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const icsDate = (v: string, allDayEnd = false) => {
  if (v.includes("T")) return `:${v.replace(/[-:]/g, "").slice(0, 13)}00`;
  const d = new Date(`${v}T00:00:00Z`);
  if (allDayEnd) d.setUTCDate(d.getUTCDate() + 1);
  return `;VALUE=DATE:${d.toISOString().slice(0, 10).replace(/-/g, "")}`;
};

const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/[,;]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");

export function AddToCalendar({
  id,
  title,
  summary,
  place,
  start,
  end,
  label,
}: {
  id: string;
  title: string;
  summary: string;
  place: string;
  start: string;
  end?: string;
  label: string;
}) {
  const download = () => {
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Project Orthodox//Diocese template//EN",
      "BEGIN:VEVENT",
      `UID:${id}@diocese.example`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
      `DTSTART${icsDate(start)}`,
      `DTEND${icsDate(end ?? start, true)}`,
      `SUMMARY:${escape(title)}`,
      `DESCRIPTION:${escape(summary)}`,
      `LOCATION:${escape(place)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Button type="button" variant="outline" onClick={download} className="h-11 w-full rounded-md border-royal-200 text-royal-800">
      <CalendarPlus className="size-4" aria-hidden />
      {label}
    </Button>
  );
}
