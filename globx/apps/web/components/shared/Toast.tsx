"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";
import { createPortal } from "react-dom";

interface ToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: AlertTriangle,
  };

  const colors = {
    success: "bg-accent-buy/20 border-accent-buy text-accent-buy",
    error: "bg-accent-sell/20 border-accent-sell text-accent-sell",
    warning: "bg-accent-primary/20 border-accent-primary text-accent-primary",
    info: "bg-accent-primary/20 border-accent-primary text-accent-primary",
  };

  const Icon = icons[type];

  return createPortal(
    <div className="fixed top-4 right-4 z-50 animate-slide-up">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-lg ${colors[type]}`}
      >
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 hover:opacity-70 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>,
    document.body
  );
}
