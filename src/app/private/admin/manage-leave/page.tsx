'use client';
import React, { useMemo, useState, useEffect } from 'react';
import {
  Button, Card, Col, Empty, Input, Row, Space, Statistic, Switch, Table, Tag, Tooltip,
  Typography, Dropdown, message, Breadcrumb
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import * as Icons from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import type { LeaveTypeApiItem, LeaveTypeDocument, LeaveApprovalRule, VacationRule } from '@/types/leave';
import { genderLabelFromBackend } from '@/types/leave';
import { fetchLeaveTypes } from '@/services/leaveTypeApi';

type AnyLeave = LeaveTypeApiItem & {
  // keep optional convenience props if needed
  // e.g. computed fields can be added but not required
};

export default function LeaveTypePage() {
  const { Title } = Typography;
  const router = useRouter();

  const addMenuItems = [
    { key: 'general', label: 'เพิ่มการลา (ทั่วไป)' },
    { key: 'vacation', label: 'เพิ่มการลา (ลาพักผ่อน)' },
  ];

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

  const isVacation = (it: AnyLeave) => it.category === 'vacation';
  const isOfficialduty = (it: AnyLeave) => it.category === 'officialduty';

  const data = useMemo(
    () => items.filter((it) => it.name.toLowerCase().includes(q.trim().toLowerCase())),
    [q, items]
  );

  const vacationList = useMemo(() => data.filter(isVacation), [data]);
  const generalList = useMemo(() => data.filter((it) => !isVacation(it) && !isOfficialduty(it)), [data]);

  // console.log("isVacation: ", isVacation);
  // console.log("vacation: ", vacationList);
  // console.log('first item approval rules', vacationList[0]?.leave_approval_rule);
  // console.log("general: ", generalList);

  const baseCondTags = (r: AnyLeave) => (
    <Space size={[8, 8]} wrap>
      <Tag>อายุราชการ ≥ {Number(r.service_year ?? 0)} ปี</Tag>
      {r.gender === 'all'
        ? <Tag color="blue">ทุกเพศ</Tag>
        : <Tag>{genderLabelFromBackend(r.gender)}</Tag>}
      {r.is_count_vacation && <Tag color="purple">นับเป็นวันพักผ่อน</Tag>}
    </Space>
  );

  const generalColumns: ColumnsType<AnyLeave> = [
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
              onClick={() => router.push(`/private/admin/manage-leave/general/${r.leave_type_id}`)}
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

  const vacationColumns: ColumnsType<AnyLeave> = [
    { title: 'ประเภทการลา', dataIndex: 'name' },
    { title: 'จำนวนผู้อนุมัติ', align: 'center', render: (_, r) => (r.number_approver ?? 0),},
    { title: 'สูงสุด (วัน)', dataIndex: 'max_leave', align: 'center' },
    {
      title: 'เงื่อนไขอนุมัติ',
      render: (_, r) => {
        const rules = Array.isArray(r.leave_approval_rule) ? r.leave_approval_rule as LeaveApprovalRule[] : [];
        if (rules.length === 0) {
          return <span style={{ color: '#888' }}>ไม่มีเงื่อนไข</span>;
        }

        // แสดง 3 รายการแรกเป็น preview และถ้ามากกว่า 3 ให้แสดง "+ n more"
        const preview = rules.slice(0, 3).map((ru, i) => (
          <div key={`vac-rule-${r.leave_type_id}-${i}`} style={{ fontSize: 12 }}>
            • {'<'} {ru.leave_less_than} วัน → ลำดับอนุมัติ {ru.approval_level}
          </div>
        ));

        return (
          <div>
            <Tag color="green">{rules.length} เงื่อนไข</Tag>
            <div style={{ marginTop: 6 }}>{preview}</div>
            {rules.length > 3 && <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>+ {rules.length - 3} รายการเพิ่มเติม</div>}
          </div>
        );
      },
    },
    {
      title: 'กติกาวันลาต่อปี',
      render: (_, r) => {
        const rules = r.vacation_rule ?? [];
        return (
          <Space direction="vertical" size={0}>
            <Tag color="green">{rules.length} กฎ</Tag>
            {rules.slice(0, 3).map((ru: VacationRule, i) => (
              <div key={`vr-${r.leave_type_id}-${i}`} style={{ fontSize: 12 }}>
                • อายุงาน &gt;= {ru.service_year} ปี → {ru.annual_leave} วัน/ปี (max {ru.max_leave} วัน)
              </div>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'เงื่อนไขพื้นฐาน', render: (_, r) => baseCondTags(r)
    },
    {
      title: 'การจัดการ',
      align: 'center',
      render: (_, r) => (
        <Space>
          <Tooltip title="แก้ไข (ลาพักผ่อน)">
            <Icons.Edit
              style={{ cursor: 'pointer', color: 'orange' }}
              onClick={() => router.push(`/private/admin/manage-leave/vacation/${r.leave_type_id}`)}
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

  const CardBlock = ({ it }: { it: AnyLeave }) => {
    const vacation = isVacation(it);
    return (
      <Card
        title={it.name}
        extra={
          <Button
            size="small"
            onClick={() => router.push(vacation
              ? `/private/admin/manage-leave/vacation/${it.leave_type_id}`
              : `/private/admin/manage-leave/general/${it.leave_type_id}`
            )}
          >
            แก้ไข
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {!vacation && (
            <Statistic
              title="จำนวนผู้อนุมัติ"
              value={Number(it.leave_approval_rule?.length ?? 0)}
            />
          )}
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

          {!vacation && (it.leave_approval_rule?.length ?? 0) > 0 && (
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

          {vacation && (
            <div>
              <div style={{ marginBottom: 4, fontWeight: 500 }}>กติกาวันลาต่อปี</div>
              <Space direction="vertical" size={2}>
                {(it.vacation_rule ?? []).map((ru: VacationRule, i: number) => (
                  <div key={`vr-card-${it.leave_type_id}-${i}`} style={{ fontSize: 12 }}>
                    • อายุงาน &gt;= {ru.service_year} ปี → {ru.annual_leave} วัน/ปี (max {ru.max_leave})
                  </div>
                ))}
              </Space>
            </div>
          )}
        </Space>
      </Card>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={10}>
        <Row>
          <Col>
            <Title level={4} style={{ margin: 0 }}>ตั้งค่าประเภทการลา</Title>
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
              <Dropdown
                menu={{
                  items: addMenuItems,
                  onClick: ({ key }) => {
                    if (key === 'general') router.push('/private/admin/manage-leave/general/add');
                    if (key === 'vacation') router.push('/private/admin/manage-leave/vacation/add');
                  },
                }}
              >
                <Button type="primary" icon={<PlusOutlined />}>
                  เพิ่มประเภทการลา <DownOutlined style={{ marginLeft: 6 }} />
                </Button>
              </Dropdown>
            </Col>
          </Space>
        </Col>

        {viewTable ? (
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
            <Card title="ลาทั่วไป">
              <Table
                rowKey="leave_type_id"
                columns={generalColumns}
                dataSource={generalList}
                pagination={{ pageSize: 10 }}
                bordered
                loading={loading}
              />
            </Card>
            <Card title="ลาพักผ่อน">
              <Table
                rowKey="leave_type_id"
                columns={vacationColumns}
                dataSource={vacationList}
                pagination={{ pageSize: 10 }}
                bordered
                loading={loading}
              />
            </Card>
          </Space>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
            <Card title="ลาทั่วไป">
              <Row gutter={[16, 16]}>
                {generalList.length === 0 && <Col span={24}><Empty description="ยังไม่มีข้อมูล" /></Col>}
                {generalList.map((it) => (
                  <Col key={it.leave_type_id} xs={24} sm={12} md={8} lg={6}>
                    <CardBlock it={it} />
                  </Col>
                ))}
              </Row>
            </Card>
            <Card title="ลาพักผ่อน">
              <Row gutter={[16, 16]}>
                {vacationList.length === 0 && <Col span={24}><Empty description="ยังไม่มีข้อมูล" /></Col>}
                {vacationList.map((it) => (
                  <Col key={it.leave_type_id} xs={24} sm={12} md={8} lg={6}>
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
