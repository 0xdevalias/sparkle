import React, { useCallback, useEffect, useState } from "react";

import { getDateTimeFromUtc, getUtcFromDateTime } from "utils/time";

import "./DateTimeField.scss";

export interface DateFieldProps {
  title: string;
  subTitle?: string;
  dateTimeValue?: number;
  onChange: (value: number) => void;
}

export const DateTimeField: React.FC<DateFieldProps> = ({
  title,
  subTitle,
  dateTimeValue,
  onChange,
}) => {
  const { date, time } = getDateTimeFromUtc(dateTimeValue);

  const [dateValue, setDateValue] = useState(date);
  const [timeValue, setTimeValue] = useState(time);
  const handleDateChange = useCallback((e) => setDateValue(e.target.value), []);
  const handleTimeChange = useCallback((e) => setTimeValue(e.target.value), []);

  useEffect(() => {
    const dateTime = getUtcFromDateTime(`${dateValue} ${timeValue}`);

    onChange(dateTime);
  }, [dateValue, timeValue, onChange]);

  return (
    <div className="DateTimeField">
      <div className="DateTimeField__title">{title}</div>
      {subTitle && <p className="DateTimeField__subtitle">{subTitle}</p>}
      <div className="DateTimeField__container">
        <input
          type="date"
          className="DateTimeField__input DateTimeField__date"
          value={dateValue}
          onChange={handleDateChange}
        />
        <input
          className="DateTimeField__input DateTimeField__time"
          type="time"
          value={timeValue}
          onChange={handleTimeChange}
        />
      </div>
    </div>
  );
};