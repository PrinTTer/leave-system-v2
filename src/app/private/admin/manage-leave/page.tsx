'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  Row,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import * as Icons from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLeaveTypesStore } from '@/store/leaveTypeStore';
import type { LeaveTypeConfig, GenderCode } from '@/types/leave';
import { genderLabel } from '@/types/leave';

export default function LeaveTypePage() {
  const { Title } = Typography;
  const router = useRouter();
  const { items, hydrate, remove } = useLeaveTypesStore();
  const [viewTable, setViewTable] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => { hydrate(); }, [hydrate]);

  const data = useMemo(
    () => items.filter((it) => it.name.toLowerCase().includes(q.trim().toLowerCase())),
    [items, q]
  );

  const columns: ColumnsType<LeaveTypeConfig> = [
    { title: 'ประเภทการลา', dataIndex: 'name' },
    { title: 'จำนวนผู้อนุมัติ (default)', align: 'center', render: (_, r) => r.approvers.length },
    { title: 'สูงสุด (วัน)', dataIndex: 'maxDays', align: 'center' },
    {
      title: 'เงื่อนไข',
      render: (_, r) => (
        <Space size={[8, 8]} wrap>
          <Tag>อายุราชการ ≥ {r.minServiceYears} ปี</Tag>
          {(r.allowedGenders.length === 0 || r.allowedGenders.length === 3)
            ? <Tag color="blue">ทุกเพศ</Tag>
            : r.allowedGenders.map((g: GenderCode) => <Tag key={g}>{genderLabel(g)}</Tag>)}
          {r.workingDaysOnly && <Tag color="purple">นับเฉพาะวันทำการ</Tag>}
        </Space>
      ),
    },
    {
      title: 'เอกสารแนบ',
      render: (_, r) => (
        <Space size={[8, 8]} wrap>
          <Tag color="geekblue">{(r.documents?.length ?? 0)} รายการ</Tag>
          {(r.documents ?? []).slice(0, 3).map((d) => (
            <Tag key={d.name} color={d.required ? 'red' : 'default'}>
              {d.name} ({d.fileType})
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'เงื่อนไขอนุมัติ',
      render: (_, r) => (
        <Space size={[8, 8]} wrap>
          <Tag color="green">{(r.approvalRules?.length ?? 0)} เงื่อนไข</Tag>
        </Space>
      ),
    },
    {
      title: 'การจัดการ',
      align: 'center',
      render: (_, r) => (
        <Space>
          <Tooltip title="แก้ไข">
            <Icons.Edit
              style={{ cursor: 'pointer', color: 'orange' }}
              onClick={() => router.push(`/private/admin/manage-leave/${r.id}`)}
            />
          </Tooltip>
          <Tooltip title="ลบ">
            <Icons.Trash
              style={{ cursor: 'pointer', color: 'red' }}
              onClick={() => remove(r.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 10 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={10}>
        <Row justify="space-between" align="middle">
          <Col><Title level={4} style={{ margin: 0 }}>ตั้งค่าประเภทการลา</Title></Col>
          <Col>
            <Space>
              <Input.Search
                allowClear
                placeholder="ค้นหาชื่อประเภทลา"
                onSearch={setQ}
                onChange={(e) => setQ(e.target.value)}
              />
              <Space align="center"><span>ตาราง</span><Switch checked={viewTable} onChange={setViewTable} /></Space>
              <Button type="primary" onClick={() => router.push('/private/admin/manage-leave/add')}>
                เพิ่มประเภทการลา
              </Button>
            </Space>
          </Col>
        </Row>

        {viewTable ? (
          <Card>
            <Table rowKey="id" columns={columns} dataSource={data} pagination={{ pageSize: 10 }} bordered />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {data.length === 0 && <Col span={24}><Empty description="ยังไม่มีข้อมูล" /></Col>}
            {data.map((it) => (
              <Col key={it.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  title={it.name}
                  extra={<Button size="small" onClick={() => router.push(`/private/admin/manage-leave/${it.id}`)}>แก้ไข</Button>}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Statistic title="จำนวนผู้อนุมัติ (default)" value={it.approvers.length} />
                    <Statistic title="จำนวนวันสูงสุด" value={it.maxDays} suffix="วัน" />
                    <div>
                      <div style={{ marginBottom: 4, fontWeight: 500 }}>เงื่อนไข</div>
                      <Space size={[8, 8]} wrap>
                        <Tag>อายุราชการ ≥ {it.minServiceYears} ปี</Tag>
                        {(it.allowedGenders.length === 0 || it.allowedGenders.length === 3)
                          ? <Tag color="blue">ทุกเพศ</Tag>
                          : it.allowedGenders.map((g: GenderCode) => <Tag key={g}>{genderLabel(g)}</Tag>)}
                        {it.workingDaysOnly && <Tag color="purple">นับเฉพาะวันทำการ</Tag>}
                      </Space>
                    </div>

                    {(it.documents?.length ?? 0) > 0 && (
                      <div>
                        <div style={{ marginBottom: 4, fontWeight: 500 }}>เอกสารแนบ</div>
                        <Space size={[8, 8]} wrap>
                          {(it.documents ?? []).map((d) => (
                            <Tag key={d.name} color={d.required ? 'red' : 'default'}>
                              {d.name} ({d.fileType})
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    )}

                    {(it.approvalRules?.length ?? 0) > 0 && (
                      <div>
                        <div style={{ marginBottom: 4, fontWeight: 500 }}>เงื่อนไขอนุมัติ</div>
                        <Space direction="vertical" size={2}>
                          {it.approvalRules!.map((rul, idx) => (
                            <div key={`${it.id}-rule-${idx}`} style={{ fontSize: 12 }}>
                              {idx + 1}. ต่ำกว่า {rul.maxDaysThreshold} วัน :
                              {' '}ผู้อนุมัติ {rul.approverChain.map((a, i) => `${i + 1}:${a.position}`).join(', ')}
                            </div>
                          ))}
                        </Space>
                      </div>
                    )}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Space>
    </div>
  );
}
