"use client";

import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { MoveRight } from "lucide-react";
import { Modal } from "@/components/ui/modal";

/** Compare-dates range picker, replacing the legacy react-date-range dependency. */
export function DateRangeModal({
  open,
  onClose,
  range,
  onRangeChange,
  minDate,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  minDate: Date;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} contentLabel="Choose a date range">
      <DayPicker
        mode="range"
        selected={range}
        onSelect={onRangeChange}
        startMonth={minDate}
        endMonth={new Date()}
        disabled={{ before: minDate, after: new Date() }}
        numberOfMonths={2}
      />
      <button
        onClick={onConfirm}
        disabled={!range?.from || !range?.to}
        className="w-[42px] h-[42px] rounded-[10px] bg-dark-100 flex justify-center items-center mx-auto mt-4 disabled:opacity-50"
        aria-label="Apply date range"
      >
        <MoveRight className="text-white" />
      </button>
    </Modal>
  );
}
