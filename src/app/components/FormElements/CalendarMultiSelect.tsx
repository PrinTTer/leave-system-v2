'use client';

import { Select } from 'antd';

interface Props {
  value?: string[];
  onChange?: (v: string[]) => void;
}

const OPTIONS = [
  { label: 'ปฏิทินธรรมดา', value: 'standard' },
  { label: 'ปฏิทินปีการศึกษา', value: 'academic' },
  { label: 'ปฏิทินปีงบประมาณ', value: 'fiscal' },
];

export default function CalendarMultiSelect({ value, onChange }: Props) {
  return (
    <Select
      mode="multiple"
      allowClear
      placeholder="เลือกปฏิทิน"
      style={{ minWidth: 260 }}
      options={OPTIONS}
      value={value}
      onChange={(vals) => onChange?.(vals)}
    />
  );
}
