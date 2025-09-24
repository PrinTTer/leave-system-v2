/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useMemo, useState } from 'react';
import {
  Button, Card, Col, Empty, Input, Row, Space, Statistic, Switch, Table, Tag, Tooltip,
  Typography, Dropdown, message
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import * as Icons from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { LeaveTypeConfig, GenderCode } from '@/types/leave';
import { genderLabel } from '@/types/leave';
import { leaveTypesSeed } from '@/mock/leave-type';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';

type AnyLeave = LeaveTypeConfig & { [k: string]: any };

export default function LeaveTypePage() {
  const { Title } = Typography;
  const router = useRouter();

  const addMenuItems = [
    { key: 'general', label: 'เพิ่มการลา (ทั่วไป)' },
    { key: 'vacation', label: 'เพิ่มการลา (ลาพักผ่อน)' },
  ];

  // ใช้ mock data ตรง ๆ
  const items: AnyLeave[] = leaveTypesSeed as AnyLeave[];

  // ตัวช่วย: ระบุว่าเป็น “ลาพักผ่อน” ไหม
  const isVacation = (it: AnyLeave) =>
    it?.name === 'ลาพักผ่อน' || Array.isArray((it as any)?.vacationRules);

  // UI state เท่านั้น (ค้นหา/สลับมุมมอง)
  const [viewTable, setViewTable] = useState(false);
  const [q, setQ] = useState('');

  const data = useMemo(
    () => items.filter((it) => it.name.toLowerCase().includes(q.trim().toLowerCase())),
    [q, items]
  );

  const vacationList = useMemo(() => data.filter(isVacation), [data]);
  const generalList  = useMemo(() => data.filter((it) => !isVacation(it)), [data]);

  const baseCondTags = (r: LeaveTypeConfig) => (
    <Space size={[8, 8]} wrap>
      <Tag>อายุราชการ ≥ {r.minServiceYears} ปี</Tag>
      {(r.allowedGenders.length === 0 || r.allowedGenders.length === 3)
        ? <Tag color="blue">ทุกเพศ</Tag>
        : r.allowedGenders.map((g: GenderCode) => <Tag key={g}>{genderLabel(g)}</Tag>)}
      {r.workingDaysOnly && <Tag color="purple">นับเฉพาะวันทำการ</Tag>}
    </Space>
  );

  const generalColumns: ColumnsType<LeaveTypeConfig> = [
    { title: 'ประเภทการลา', dataIndex: 'name' },
    { title: 'จำนวนผู้อนุมัติ (default)', align: 'center', render: (_, r) => r.approvers.length },
    { title: 'สูงสุด (วัน)', dataIndex: 'maxDays', align: 'center' },
    { title: 'เงื่อนไข', render: (_, r) => baseCondTags(r) },
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
          <Tooltip title="ลบ (mock)">
            <Icons.Trash
              style={{ cursor: 'not-allowed', color: '#bbb' }}
              onClick={() => message.info('โหมด Mock: ไม่ได้ลบข้อมูลจริง')}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const vacationColumns: ColumnsType<LeaveTypeConfig> = [
    { title: 'ประเภทการลา', dataIndex: 'name' },
    { title: 'สูงสุด (วัน)', dataIndex: 'maxDays', align: 'center' },
    {
      title: 'กติกาวันลาต่อปี',
      render: (_, r) => {
        const rules = (r as AnyLeave).vacationRules as { minServiceYears: number; daysPerYear: number }[] | undefined;
        return (
          <Space direction="vertical" size={0}>
            <Tag color="green">{rules?.length ?? 0} กฎ</Tag>
            {rules?.slice(0, 3).map((ru, i) => (
              <div key={`vr-${r.id}-${i}`} style={{ fontSize: 12 }}>
                • อายุงาน &gt;= {ru.minServiceYears} ปี → {ru.daysPerYear} วัน/ปี
              </div>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'กติกาการสะสมวันลา',
      render: (_, r) => {
        const carry = (r as AnyLeave).carryOverRules as { minServiceYears: number; carryOverDays: number }[] | undefined;
        return (
          <Space direction="vertical" size={0}>
            <Tag color="blue">{carry?.length ?? 0} กฎ</Tag>
            {carry?.slice(0, 3).map((ru, i) => (
              <div key={`cr-${r.id}-${i}`} style={{ fontSize: 12 }}>
                • อายุงาน &gt;= {ru.minServiceYears} ปี → สะสมได้ {ru.carryOverDays} วัน
              </div>
            ))}
          </Space>
        );
      },
    },
    { title: 'เงื่อนไขพื้นฐาน', render: (_, r) => baseCondTags(r) },
    {
      title: 'การจัดการ',
      align: 'center',
      render: (_, r) => (
        <Space>
          <Tooltip title="แก้ไข (ลาพักผ่อน)">
            <Icons.Edit
              style={{ cursor: 'pointer', color: 'orange' }}
              onClick={() => router.push(`/private/admin/manage-leave/vacation/${r.id}`)}
            />
          </Tooltip>
          <Tooltip title="ลบ (mock)">
            <Icons.Trash
              style={{ cursor: 'not-allowed', color: '#bbb' }}
              onClick={() => message.info('โหมด Mock: ไม่ได้ลบข้อมูลจริง')}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const CardBlock = ({ it }: { it: AnyLeave }) => {
    const vacation = isVacation(it);
    return (
      <Card
        title={it.name}
        extra={
          <Button
            size="small"
            onClick={() =>
              router.push(vacation
                ? `/private/admin/manage-leave/vacation/${it.id}`
                : `/private/admin/manage-leave/${it.id}`
              )
            }
          >
            แก้ไข
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {!vacation && <Statistic title="จำนวนผู้อนุมัติ (default)" value={it.approvers.length} />}
          <Statistic title="จำนวนวันสูงสุด" value={it.maxDays} suffix="วัน" />

          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>เงื่อนไข</div>
            {baseCondTags(it)}
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

          {!vacation && (it.approvalRules?.length ?? 0) > 0 && (
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

          {vacation && (
            <>
              <div>
                <div style={{ marginBottom: 4, fontWeight: 500 }}>กติกาวันลาต่อปี</div>
                <Space direction="vertical" size={2}>
                  {((it as AnyLeave).vacationRules ?? []).map((ru: any, i: number) => (
                    <div key={`vr-card-${it.id}-${i}`} style={{ fontSize: 12 }}>
                      • อายุงาน &gt;= {ru.minServiceYears} ปี → {ru.daysPerYear} วัน/ปี
                    </div>
                  ))}
                </Space>
              </div>
              <div>
                <div style={{ marginBottom: 4, fontWeight: 500 }}>กติกาการสะสมวันลา</div>
                <Space direction="vertical" size={2}>
                  {((it as AnyLeave).carryOverRules ?? []).map((ru: any, i: number) => (
                    <div key={`cr-card-${it.id}-${i}`} style={{ fontSize: 12 }}>
                      • อายุงาน &gt;= {ru.minServiceYears} ปี → สะสมได้ {ru.carryOverDays} วัน
                    </div>
                  ))}
                </Space>
              </div>
            </>
          )}
        </Space>
      </Card>
    );
  };

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
              <Dropdown
                menu={{
                  items: addMenuItems,
                  onClick: ({ key }) => {
                    if (key === 'general') router.push('/private/admin/manage-leave/add');
                    if (key === 'vacation') router.push('/private/admin/manage-leave/vacation/add');
                  },
                }}
              >
                <Button type="primary" icon={<PlusOutlined />}>
                  เพิ่มประเภทการลา <DownOutlined style={{ marginLeft: 6 }} />
                </Button>
              </Dropdown>
            </Space>
          </Col>
        </Row>

        {/* ======= โหมดตาราง: แยกตารางชัดเจน ======= */}
        {viewTable ? (
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
            <Card title="ลาทั่วไป">
              <Table
                rowKey="id"
                columns={generalColumns}
                dataSource={generalList}
                pagination={{ pageSize: 10 }}
                bordered
              />
            </Card>
            <Card title="ลาพักผ่อน">
              <Table
                rowKey="id"
                columns={vacationColumns}
                dataSource={vacationList}
                pagination={{ pageSize: 10 }}
                bordered
              />
            </Card>
          </Space>
        ) : (
          // ======= โหมดการ์ด: แยกหัวข้อ =======
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
            <Card title="ลาทั่วไป">
              <Row gutter={[16, 16]}>
                {generalList.length === 0 && <Col span={24}><Empty description="ยังไม่มีข้อมูล" /></Col>}
                {generalList.map((it) => (
                  <Col key={it.id} xs={24} sm={12} md={8} lg={6}>
                    <CardBlock it={it} />
                  </Col>
                ))}
              </Row>
            </Card>
            <Card title="ลาพักผ่อน">
              <Row gutter={[16, 16]}>
                {vacationList.length === 0 && <Col span={24}><Empty description="ยังไม่มีข้อมูล" /></Col>}
                {vacationList.map((it) => (
                  <Col key={it.id} xs={24} sm={12} md={8} lg={6}>
                    <CardBlock it={it} />
                  </Col>
                ))}
              </Row>
            </Card>

            
          </Space>
        )}
      </Space>
    </div>
  );
}
