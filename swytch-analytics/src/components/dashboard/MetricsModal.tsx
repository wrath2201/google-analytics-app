"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

const METRICS = [
  { id: "users", label: "Users" },
  { id: "sessions", label: "Sessions" },
  { id: "pageViews", label: "Page Views" },
  { id: "bounceRate", label: "Bounce Rate" },
  { id: "avgSessionDuration", label: "Avg Session Duration" },
  { id: "newUsers", label: "New Users" },
];

type MetricsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (metrics: string[]) => void;
};

export default function MetricsModal({ isOpen, onClose, onSave }: MetricsModalProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleMetric = (metric: string) => {
    if (selected.includes(metric)) {
      setSelected(selected.filter((m) => m !== metric));
    } else {
      setSelected([...selected, metric]);
    }
  };

  const handleSave = () => {
    if (selected.length > 0) {
      onSave(selected);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Dashboard Metrics" blurBackground>
      <div className="space-y-4">

        {METRICS.map((metric) => (
          <label key={metric.id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(metric.id)}
              onChange={() => toggleMetric(metric.id)}
            />
            <span className="text-sm">{metric.label}</span>
          </label>
        ))}

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Metrics</Button>
        </div>

      </div>
    </Modal>
  );
}