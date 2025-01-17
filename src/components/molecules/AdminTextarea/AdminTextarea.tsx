import React, { ReactNode, useMemo } from "react";
import { FieldErrors, FieldValues } from "react-hook-form";
import classNames from "classnames";
import { get } from "lodash";

import { generateId } from "utils/string";

import "./AdminTextarea.scss";

export interface AdminTextareaProps
  extends Omit<React.HTMLProps<HTMLTextAreaElement>, "label"> {
  name: string;
  label?: ReactNode | string;
  subtext?: ReactNode | string;
  register: (Ref: unknown, RegisterOptions?: unknown) => void;
  errors?: FieldErrors<FieldValues>;
}

export const AdminTextarea: React.FC<AdminTextareaProps> = ({
  name,
  label,
  subtext,
  register,
  errors,
  disabled,
  ...inputProps
}) => {
  const error = get(errors, name);
  const id = useMemo(
    () => (label ? generateId("AdminTextarea-" + name) : undefined),
    [label, name]
  );

  const parentClasses = classNames({
    AdminTextarea: true,
    "AdminTextarea--invalid": error,
    "AdminTextarea--disabled": disabled,
  });

  return (
    <p className={parentClasses}>
      {label && (
        <label className="AdminTextarea__label" htmlFor={id}>
          {label}
        </label>
      )}
      <textarea
        {...inputProps}
        className="AdminTextarea__input"
        name={name}
        ref={register}
        id={id}
        disabled={disabled}
      />
      {subtext && <span className="AdminTextarea__subtext">{subtext}</span>}
      {error && <span className="AdminTextarea__error">{error?.message}</span>}
    </p>
  );
};
