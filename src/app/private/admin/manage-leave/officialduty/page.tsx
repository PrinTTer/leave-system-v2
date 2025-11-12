'use client';
import React, { useMemo, useState, useEffect } from 'react';
import {
  Button, Card, Col, Empty, Input, Row, Space, Statistic, Switch, Table, Tag, Tooltip,
  Typography, message, Breadcrumb
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import * as Icons from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PlusOutlined } from '@ant-design/icons';
import type { LeaveTypeApiItem, LeaveTypeDocument, LeaveApprovalRule } from '@/types/leave';
import { genderLabelFromBackend } from '@/types/leave';
import { fetchLeaveTypes } from '@/services/leaveTypeApi';

type AnyLeave = LeaveTypeApiItem & {
  // keep optional convenience props if needed
};

export default function OfficialDutyLeaveTypePage() {
  const { Title } = Typography;
  const router = useRouter();

  const [items, setItems] = useState<AnyLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewTable, setViewTable] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchLeaveTypes()
      .then((list) => setItems(list))
      .catch((err) => message.error(`โหลดข้อมูลลาล้มเหลว: ${err?.message ?? err}`))
      .finally(() => setLoading(false));
  }, []);

  const isOfficialDuty = (it: AnyLeave) => it.category === 'officialduty';

  const data = useMemo(
    () => items.filter((it) => it.name.toLowerCase().includes(q.trim().toLowerCase())),
    [q, items]
  );

  const officialDutyList = useMemo(() => data.filter(isOfficialDuty), [data]);

  const baseCondTags = (r: AnyLeave) => (
    <Space size={[8, 8]} wrap>
      <Tag>อายุราชการ ≥ {Number(r.service_year ?? 0)} ปี</Tag>
      {r.gender === 'all'
        ? <Tag color="blue">ทุกเพศ</Tag>
        : <Tag>{genderLabelFromBackend(r.gender)}</Tag>}
      {r.is_count_vacation && <Tag color="purple">นับเป็นวันพักผ่อน</Tag>}
    </Space>
  );

  const officialDutyColumns: ColumnsType<AnyLeave> = [
    { title: 'ประเภทการลา', dataIndex: 'name' },
    {
      title: 'จำนวนผู้อนุมัติ',
      align: 'center',
      render: (_, r) => (r.number_approver ?? 0),
    },
    { title: 'สูงสุด (วัน)', dataIndex: 'max_leave', align: 'center' },
    { title: 'เงื่อนไข', render: (_, r) => baseCondTags(r) },
    {
      title: 'เอกสารแนบ',
      render: (_, r) => (
        <Space size={[8, 8]} wrap>
          <Tag color="geekblue">{(r.leave_type_document?.length ?? 0)} รายการ</Tag>
          {(r.leave_type_document ?? []).slice(0, 3).map((d: LeaveTypeDocument) => (
            <Tag key={d.leave_type_document_id} color={d.is_required ? 'red' : 'default'}>
              {d.name} ({d.file_type})
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'เงื่อนไขอนุมัติ',
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Tag color="green">{(r.leave_approval_rule?.length ?? 0)} เงื่อนไข</Tag>
          {(r.leave_approval_rule ?? []).slice(0, 3).map((ru: LeaveApprovalRule, i: number) => (
            <div key={`rule-${r.leave_type_id}-${i}`} style={{ fontSize: 12 }}>
              • {'<'} {ru.leave_less_than} วัน → ลำดับอนุมัติ {ru.approval_level}
            </div>
          ))}
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
              onClick={() => router.push(`/private/admin/manage-leave/officialduty/${r.leave_type_id}`)}
            />
          </Tooltip>
          <Tooltip title="ลบ">
            <Icons.Trash
              style={{ cursor: 'pointer', color: '#bbb' }}
              onClick={() => message.info('ยังไม่ได้ลบข้อมูลจริง')}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const CardBlock = ({ it }: { it: AnyLeave }) => (
    <Card
      title={it.name}
      extra={
        <Button
          size="small"
          onClick={() => router.push(`/private/admin/manage-leave/officialduty/${it.leave_type_id}`)}
        >
          แก้ไข
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Statistic
          title="จำนวนผู้อนุมัติ"
          value={Number(it.leave_approval_rule?.length ?? 0)}
        />
        <Statistic
          title="จำนวนวันสูงสุด"
          value={Number(it.max_leave ?? 0)}
          suffix="วัน"
        />

        <div>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>เงื่อนไข</div>
          {baseCondTags(it)}
        </div>

        {(it.leave_type_document?.length ?? 0) > 0 && (
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>เอกสารแนบ</div>
            <Space size={[8, 8]} wrap>
              {(it.leave_type_document ?? []).map((d: LeaveTypeDocument) => (
                <Tag key={d.leave_type_document_id} color={d.is_required ? 'red' : 'default'}>
                  {d.name} ({d.file_type})
                </Tag>
              ))}
            </Space>
          </div>
        )}

        {(it.leave_approval_rule?.length ?? 0) > 0 && (
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>เงื่อนไขอนุมัติ</div>
            <Space direction="vertical" size={2}>
              {(it.leave_approval_rule ?? []).map((ru: LeaveApprovalRule, idx: number) => (
                <div key={`${it.leave_type_id}-rule-${idx}`} style={{ fontSize: 12 }}>
                  {idx + 1}. ต่ำกว่า {ru.leave_less_than} วัน : ลำดับอนุมัติ {ru.approval_level}
                </div>
              ))}
            </Space>
          </div>
        )}
      </Space>
    </Card>
  );

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={10}>
        <Row>
          <Col>
            <Title level={4} style={{ margin: 0 }}>ตั้งค่าประเภทการลา (ราชการ)</Title>
          </Col>
        </Row>
        <Breadcrumb
          items={[
            {
              title: (
                <a onClick={() => router.push(`/private/admin/manage-leave`)}>
                  ตั้งค่าประเภทการลา
                </a>
              ),
            },
            {
              title: 'ราชการ',
            },
          ]}
        />
        <Col>
          <Space>
            <Input.Search
              allowClear
              placeholder="ค้นหาชื่อประเภทลา"
              onSearch={setQ}
              onChange={(e) => setQ(e.target.value)}
            />
            <Space align="center"><span>ตาราง</span><Switch checked={viewTable} onChange={setViewTable} /></Space>
            <Col style={{ display: "flex", justifyContent: "right" }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => router.push('/private/admin/manage-leave/officialduty/add')}
              >
                เพิ่มประเภทการลา (ราชการ)
              </Button>
            </Col>
          </Space>
        </Col>

        {viewTable ? (
          <Card title="ลาราชการ">
            <Table
              rowKey="leave_type_id"
              columns={officialDutyColumns}
              dataSource={officialDutyList}
              pagination={{ pageSize: 10 }}
              bordered
              loading={loading}
            />
          </Card>
        ) : (
          <Card title="ลาราชการ">
            <Row gutter={[16, 16]}>
              {officialDutyList.length === 0 && <Col span={24}><Empty description="ยังไม่มีข้อมูล" /></Col>}
              {officialDutyList.map((it) => (
                <Col key={it.leave_type_id} xs={24} sm={12} md={8} lg={6}>
                  <CardBlock it={it} />
                </Col>
              ))}
            </Row>
          </Card>
        )}
      </Space>
    </div>
  );
}
