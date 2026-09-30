import type { InputHTMLAttributes, ReactNode } from "react";

export type FieldProps = {
  label: string;
  error?: string;
  children: ReactNode;
};

/** Labeled form row with an optional validation message. */
export function Field({ label, error, children }: FieldProps) {
  return (
    <label className="form-control w-full">
      <span className="label">
        <span className="label-text font-medium">{label}</span>
      </span>
      {children}
      {error ? (
        <span className="label">
          <span role="alert" className="label-text text-error">
            {error}
          </span>
        </span>
      ) : null}
    </label>
  );
}