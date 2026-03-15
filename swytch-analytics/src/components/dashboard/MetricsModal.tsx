"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

const ALL_METRICS = [
  { key: "users", label: "Users" },
  { key: "sessions", label: "Sessions" },
  { key: "pageViews", label: "Page Views" },
  { key: "bounceRate", label: "Bounce Rate" },
  { key: "avgSessionDuration", label: "Avg Session Duration" },
  { key: "newUsers", label: "New Users" },
];

type MetricsModalProps = {
  isOpen: boolean;
  onCloseAction: () => void;
  onSaveAction: (metrics: string[]) => void;
};

export default function MetricsModal({ isOpen, onCloseAction, onSaveAction }: MetricsModalProps) {
  const [selected, setSelected] = useState<string[]>(["users", "sessions", "pageViews", "bounceRate"]);

  const toggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onCloseAction} title="Customize Metrics">
      <div className="space-y-3">
        {ALL_METRICS.map(({ key, label }) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(key)}
              onChange={() => toggle(key)}
              className="w-4 h-4 accent-[#1B3A6B]"
            />
            <span className="text-sm text-[#1A1814]">{label}</span>
          </label>
        ))}
        <div className="flex justify-end pt-2">
          <Button onClick={() => { onSaveAction(selected); onCloseAction(); }} disabled={selected.length === 0}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}