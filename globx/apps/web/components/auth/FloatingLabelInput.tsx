"use client";

import { InputHTMLAttributes, useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface FloatingLabelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FloatingLabelInput({
  label,
  error,
  value,
  ...props
}: FloatingLabelInputProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasValue = value && String(value).length > 0;

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        {...props}
        value={value}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        className={`peer bg-bg-secondary border ${
          error ? "border-accent-sell" : "border-border"
        } rounded-xl px-4 pt-6 pb-2 h-14 text-text-primary placeholder-transparent focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all ${
          props.className || ""
        }`}
        placeholder={label}
      />
      <label
        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
          focused || hasValue
            ? "top-2 text-xs text-text-secondary"
            : "top-4 text-sm text-text-secondary"
        }`}
      >
        {label}
      </label>
      {error && (
        <p className="mt-1 text-xs text-accent-sell">{error}</p>
      )}
    </div>
  );
}
