'use client';

import { useEffect, useState } from 'react';
import {
  Breadcrumb,
  Col,
  message,
  Row,
  Space,
  Typography,
  Button,
  Spin,
} from 'antd';
import router from 'next/router';

import UserCheckboxList from '@/app/components/FormElements/UserCheckboxList';
import LeaveTable from '@/app/components/Tables/LeaveTable';

import type { LeaveItem } from '@/types/calendar';
import {
  getLeaveVisibilityConfig,
  saveLeaveVisibilityConfig,
} from '@/services/leaveVisibilityApi';

export default function LeaveVisibilityPage() {
  // ผู้ที่มีสิทธิ์มองเห็นการลา (viewer)
  const [selectedViewers, setSelectedViewers] = useState<string[]>([]);
  const [viewerSearch, setViewerSearch] = useState('');

  // ผู้ที่ถูกมองเห็นการลา (target / leave owner)
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [targetSearch, setTargetSearch] = useState('');

  // data จาก backend
  const [users, setUsers] = useState<UserList['data']>([]);
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getUserList({ page: 1, limit: 1000 });
        setUsers(res.data);
      } catch (err) {
        console.error(err);
        message.error('โหลดรายชื่อผู้ใช้ไม่สำเร็จ');
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoadingConfig(true);
        const config = await getLeaveVisibilityConfig();
        setSelectedViewers(config.viewers.map((id) => String(id)));
        setSelectedTargets(config.targets.map((id) => String(id)));
      } catch (err) {
        console.error(err);
        message.error('โหลดการตั้งค่าการมองเห็นวันลาไม่สำเร็จ');
      } finally {
        setLoadingConfig(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedTargets.length) {
      setLeaves([]);
      return;
    }

    (async () => {
      try {
        setLoadingLeaves(true);
        const res = await getLeavesByUserIds(selectedTargets);
        setLeaves(res.data);
      } catch (err) {
        console.error(err);
        message.error('โหลดข้อมูลการลาไม่สำเร็จ');
      } finally {
        setLoadingLeaves(false);
      }
    })();
  }, [selectedTargets]);

  const onSave = async () => {
    try {
      setSavingConfig(true);
      await saveLeaveVisibilityConfig({
        viewers: selectedViewers.map((id) => Number(id)),
        targets: selectedTargets.map((id) => Number(id)),
      });
      message.success('บันทึกการตั้งค่าการมองเห็นวันลาเรียบร้อย');
    } catch (err) {
      console.error(err);
      message.error('บันทึกการตั้งค่าการมองเห็นวันลาล้มเหลว');
    } finally {
      setSavingConfig(false);
    }
  };

  const userCheckboxData = users.map((u) => ({
    id: String(u.id),
    name: `${u.name} ${u.surname}`,
  }));

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={10}>
        <Row>
          <Col span={12}>
            <Typography.Title
              level={4}
              style={{ marginTop: 0, marginBottom: 0, fontSize: 18 }}
            >
              การตั้งค่าการมองเห็นวันลา (สำหรับแอดมิน)
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
                      }}
                    >
                      การตั้งค่าการมองเห็นวันลา
                    </a>
                  ),
                },
              ]}
            />
          </Col>
        </Row>

        {/* สองคอลัมน์: viewer / target */}
        <Row gutter={16} className="mt-4 mb-4">
          <Col span={12}>
            <UserCheckboxList
              users={userCheckboxData}
              selectedUsers={selectedViewers}
              search={viewerSearch}
              onCheckboxChange={setSelectedViewers}
              onSearchChange={(e) => setViewerSearch(e.target.value)}
              maxHeight={360}
              showSelectAllActions
              title="เลือกผู้ใช้ที่มีสิทธิ์มองเห็นการลาของผู้อื่น"
              showSaveButton={false}
            />
          </Col>

          <Col span={12}>
            <UserCheckboxList
              users={userCheckboxData}
              selectedUsers={selectedTargets}
              search={targetSearch}
              onCheckboxChange={setSelectedTargets}
              onSearchChange={(e) => setTargetSearch(e.target.value)}
              maxHeight={360}
              showSelectAllActions
              title="เลือกผู้ใช้ที่ถูกมองเห็นวันลา (เจ้าของใบลา)"
              showSaveButton={false}
            />
          </Col>
        </Row>

        {/* ปุ่มบันทึก */}
        <Row justify="end">
          <Col>
            <Space>
              <span className="text-sm text-gray-600">
                ผู้ที่มีสิทธิ์มองเห็น {selectedViewers.length} คน •
                ผู้ที่ถูกมองเห็น {selectedTargets.length} คน
              </span>
              <Button
                type="primary"
                onClick={onSave}
                loading={savingConfig || loadingConfig}
              >
                บันทึกการตั้งค่า
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Preview ใบลา */}
        <div className="mt-8">
          <h3 className="mb-3 text-lg font-semibold">
            ตัวอย่างรายการลาของผู้ใช้ที่ถูกเลือกให้ถูกมองเห็น
          </h3>
          <Spin spinning={loadingLeaves}>
            <div className="chemds-container">
              <LeaveTable
                leaves={leaves}
                users={userCheckboxData}
                selectedUserIds={selectedTargets}
              />
            </div>
          </Spin>
          <p className="mt-2 text-xs text-gray-500">
            * ในระบบจริง ทุกคนจะมองเห็นการลาของตัวเองได้เสมออยู่แล้ว
            การตั้งค่าหน้านี้ใช้สำหรับมองเห็นการลาของผู้อื่นเพิ่มเติมเท่านั้น
          </p>
        </div>
      </Space>
    </div>
  );
}


async function getUserList(params: {
  page: number;
  limit: number;
}): Promise<UserList> {
  const mock: UserList = {
    data: [
      {
        id: 1,
        uid: 'mock-1',
        nontriAccount: 'mock.nontri1',
        name: 'วรัญญา',
        surname: 'อรรถเสนา',
        kuMail: 'mock1@ku.th',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 2,
        uid: 'mock-2',
        nontriAccount: 'mock.nontri2',
        name: 'สมชาย',
        surname: 'ใจดี',
        kuMail: 'mock2@ku.th',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 3,
        uid: 'mock-3',
        nontriAccount: 'mock.nontri3',
        name: 'สมหญิง',
        surname: 'แสนดี',
        kuMail: 'mock3@ku.th',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {        
        id: 4,
        uid: 'mock-4',
        nontriAccount: 'mock.nontri4',
        name: 'จิรภัทร',
        surname: 'วงศ์ทอง',
        kuMail: 'mock4@ku.th', 
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ],
    page: 1,
    totalPage: 1,
    limit: params.limit,
    totalCount: 2,
  };

  return mock;
}

async function getLeavesByUserIds(
  userIds: string[],
): Promise<{ data: LeaveItem[] }> {
  console.log('mock getLeavesByUserIds for', userIds);
  return { data: [] };
}
