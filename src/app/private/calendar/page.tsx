'use client';

import { useState } from 'react';
import { Card, Segmented } from 'antd';
import dynamic from 'next/dynamic';
///Users/wysuttida/project/leave-system-v2/src/app/components/calendar/CalendarBox.tsx
const CalendarBox = dynamic(() => import('@/app/components/calendar/CalendarBox'), {
  ssr: false,
});

type ViewMode = 'month' | 'quarter';

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  return (
    <div style={{ padding: 16 }}>
      <Card
        title="Leave & Academic/Fiscal Calendars"
        bordered={false}
        style={{ maxWidth: 1400, margin: '0 auto' }}
        extra={
          <Segmented
            value={viewMode}
            onChange={(v) => setViewMode(v as ViewMode)}
            options={[
              { label: '1 เดือน', value: 'month' },
              { label: '4 เดือน', value: 'quarter' },
            ]}
          />
        }
      >
        <CalendarBox viewMode={viewMode} />
      </Card>
    </div>
  );
}
