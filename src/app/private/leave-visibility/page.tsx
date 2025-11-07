'use client';

import { useEffect, useState } from 'react';
import { Breadcrumb, Col, message, Row, Space, Typography } from 'antd';
import UserCheckboxList from '@/app/components/FormElements/UserCheckboxList';
import LeaveTable from '@/app/components/Tables/LeaveTable';
import { usersMock } from '@/mock/users';
import { leavesMock } from '@/mock/leaves';
import router from 'next/router';

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
      } catch { }
    }
  }, []);

  const onSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedUsers));
    message.success('บันทึกการตั้งค่าเรียบร้อย');
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={10}>
        <Row>
          <Col span={12}>
            <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: 18 }}>
              การตั้งค่าการมองเห็นวันลา
            </Typography.Title>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Breadcrumb
              items={[
                {
                  title: (
                    <a
                      onClick={() => {
                        router.push(`/private/leave-visibility`);
                      }}>
                      การตั้งค่าการมองเห็นวันลา
                    </a>
                  ),
                },
              ]}
            />
          </Col>
        </Row>

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
          <div className="chemds-container">

            <LeaveTable
              leaves={leavesMock}
              users={usersMock}
              selectedUserIds={selectedUsers}
            />
          </div>
        </div>
      </Space>
    </div>
  );
}
