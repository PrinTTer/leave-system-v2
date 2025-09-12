'use client';

import { useEffect, useState } from 'react';
import { message } from 'antd';
import UserCheckboxList from '@/app/components/FormElements/UserCheckboxList';
import LeaveTable from '@/app/components/Tables/LeaveTable';
import { usersMock } from '@/mock/users';
import { leavesMock } from '@/mock/leaves';

const STORAGE_KEY = 'leaveVisibilitySelectedUserIds';

export default function LeaveVisibilityPage() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSelectedUsers(parsed.map(String));
      } catch {}
    }
  }, []);

  const onSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedUsers));
    message.success('บันทึกการตั้งค่าเรียบร้อย');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">การตั้งค่าการมองเห็นวันลา</h2>

      {/* ใช้ UserCheckboxList + ปุ่ม save อยู่ใน Card ใหญ่ */}
      <div className="mt-4 mb-4">
        <UserCheckboxList
          users={usersMock}
          selectedUsers={selectedUsers}
          search={search}
          onCheckboxChange={setSelectedUsers}
          onSearchChange={(e) => setSearch(e.target.value)}
          maxHeight={360}
          showSelectAllActions
          // ส่ง callback save ลงไป
          onSave={onSave}
        />
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-lg font-semibold">รายการลาของผู้ใช้ที่เลือก</h3>
        <LeaveTable
          leaves={leavesMock}
          users={usersMock}
          selectedUserIds={selectedUsers}
        />
      </div>
    </div>
  );
}
