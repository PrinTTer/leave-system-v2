'use client';

import React, { useEffect, useState } from 'react';
import {
  Button, Card, Checkbox, Col, Divider, Form, Input, InputNumber,
  Row, Select, Space, Typography, message, Table, Tag, Popconfirm,
  Breadcrumb
} from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import {
  deleteLeaveType,
  fetchLeaveTypeById,
  updateLeaveType
} from '@/services/leaveTypeApi';
import { LeaveTypeApiItem } from '@/types/leave';

const genderOptions = [
  { label: 'ชาย', value: 'male' },
  { label: 'หญิง', value: 'female' }
];

const fileTypeOptions = [
  { label: 'pdf', value: 'pdf' },
  { label: 'png', value: 'png' },
  { label: 'jpg', value: 'jpg' },
  { label: 'doc', value: 'doc' }
];
interface columnRow {
  key: string | number;
}

export default function EditOfficialDutyLeaveTypePage() {
  const { Title } = Typography;
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  /** จำนวนลำดับผู้อนุมัติ */
  const maxApproverCount: number = Form.useWatch('number_approver', form) ?? 0;
  const approverOrders = Array.from({ length: maxApproverCount }, (_, i) => i + 1);

  useEffect(() => {
    const load = async () => {
      try {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        const data = await fetchLeaveTypeById(id);

        const allowedGenders =
          data.gender === 'all'
            ? ['male', 'female']
            : [data.gender];

        const documents = (data.leave_type_document ?? []).map((d) => ({
          name: d.name,
          file_type: d.file_type,
          is_required: d.is_required,
        }));

        const approvalRules = (data.leave_approval_rule ?? []).map((r) => ({
          leave_less_than: r.leave_less_than,
          approval_level: r.approval_level,
        }));

        form.setFieldsValue({
          name: data.name,
          max_leave: data.max_leave,
          gender: allowedGenders,
          service_year: data.service_year,
          is_count_vacation: data.is_count_vacation,
          number_approver: data.number_approver,
          leave_type_document: documents,
          leave_approval_rule: approvalRules,
        });

        setLoading(false);
      } catch {
        message.error('โหลดข้อมูลผิดพลาด');
        router.push('/private/admin/manage-leave/officialduty');
      }
    };

    load();
  }, [form, params.id, router]);

  const onFinish = async (values: LeaveTypeApiItem) => {
    try {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;

      let gender = 'all';
      if (values.gender?.length === 1) {
        gender = values.gender[0];
      }

      const payload: LeaveTypeApiItem = {
        name: values.name,
        max_leave: values.max_leave,
        gender,
        service_year: values.service_year,
        is_count_vacation: values.is_count_vacation,
        number_approver: values.number_approver,
        category: "officialduty",

        leave_type_document: values.leave_type_document?.map((d) => ({
          name: d.name,
          file_type: d.file_type,
          is_required: d.is_required,
        })),

        leave_approval_rule: values.leave_approval_rule?.map((r) => ({
          leave_less_than: r.leave_less_than,
          approval_level: r.approval_level,
        })),
      };
    // console.log('id:', id);
    // console.log('playload officail: ', payload);

      await updateLeaveType(id, payload);
      message.success('บันทึกสำเร็จ');
      router.push('/private/admin/manage-leave/officialduty');
    } catch (e) {
      console.error(e);
      message.error('อัปเดตไม่สำเร็จ');
    }
  };

  /** ----------------- ลบ ----------------- */
  const onDelete = async () => {
    try {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      await deleteLeaveType(id);
      message.success('ลบสำเร็จ');
      router.push('/private/admin/manage-leave/officialduty');
    } catch {
      message.error('ลบไม่สำเร็จ');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={10}>
        <Title level={4} style={{ margin: 0 }}>แก้ไขประเภทลา (ราชการ)</Title>

        <Breadcrumb
          items={[
            {
              title: (
                <a
                  onClick={() => {
                    router.push(`/private/admin/manage-leave`);
                  }}>
                  ตั้งค่าประเภทการลา
                </a>
              ),
            },
            {
              title: (
                <a
                  onClick={() => {
                    router.push(`/private/admin/manage-leave/officialduty`);
                  }}>
                  ราชการ
                </a>
              ),
            },
            { title: "แก้ไข" },
          ]}
        />

        <Card loading={loading}>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            {/* -------- แถว 1 -------- */}
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="ชื่อประเภทการลา"
                  rules={[{ required: true, message: 'กรุณาระบุชื่อประเภทการลา' }]}>
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="max_leave"
                  label="จำนวนวันลาสูงสุด"
                  rules={[{ required: true, message: 'กรุณาระบุจำนวนวัน' }]}>
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            {/* -------- แถว 2 -------- */}
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="gender" label="เพศที่สามารถลาได้">
                  <Checkbox.Group options={genderOptions} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="service_year" label="อายุราชการขั้นต่ำ (ปี)">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="is_count_vacation" valuePropName="checked">
              <Checkbox>นับวันลาเฉพาะวันทำการ</Checkbox>
            </Form.Item>

            {/* ---------------- ผู้อนุมัติ ---------------- */}
            <Divider orientation="left">จำนวนผู้อนุมัติสูงสุด</Divider>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="number_approver"
                  label="จำนวนผู้อนุมัติสูงสุด"
                  rules={[{ required: true, message: 'กรุณาระบุจำนวน' }]}>
                  <InputNumber min={1} max={10} style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col xs={24} md={16}>
                <Form.Item label="ลำดับที่ใช้ได้">
                  <Space wrap>
                    {approverOrders.length === 0 ? (
                      <Tag>ยังไม่กำหนด</Tag>
                    ) : approverOrders.map((n) => (
                      <Tag key={n} color="blue">{`ลำดับที่ ${n}`}</Tag>
                    ))}
                  </Space>
                </Form.Item>
              </Col>
            </Row>

            {/* ---------------- เอกสาร ---------------- */}
            <Divider orientation="left">เอกสารแนบ</Divider>

            <Form.List name="leave_type_document">
              {(fields, { add, remove, move }) => {
                const columns = [
                  {
                    title: 'ชื่อเอกสาร',
                    render: (_value: unknown, _record: columnRow, idx: number) => (
                      <Form.Item
                        name={[fields[idx].name, 'name']}
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: 'ระบุชื่อเอกสาร' }]}
                      >
                        <Input />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'ชนิดไฟล์',
                    render: (_value: unknown, _record: columnRow, idx: number) => (
                      <Form.Item name={[fields[idx].name, 'file_type']} style={{ marginBottom: 0 }}>
                        <Select options={fileTypeOptions} />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'จำเป็น',
                    render: (_value: unknown, _record: columnRow, idx: number) => (
                      <Form.Item
                        name={[fields[idx].name, 'is_required']}
                        valuePropName="checked"
                        style={{ marginBottom: 0 }}
                      >
                        <Checkbox />
                      </Form.Item>
                    ),
                  },
                  { 
                    title: 'จัดการ', 
                    render: (_value: unknown, _record: columnRow, idx: number) => (
                      <Space> 
                        <Button 
                          size="small" 
                          onClick={() => move(idx, idx - 1)} 
                          disabled={idx === 0}> 
                          <ArrowUpOutlined /> 
                        </Button>
                        <Button 
                          size="small" 
                          onClick={() => move(idx, idx + 1)} 
                          disabled={idx === fields.length - 1}> 
                          <ArrowDownOutlined /> 
                        </Button> 
                        <Button 
                          size="small" 
                          danger onClick={() => remove(idx)}> 
                          <DeleteOutlined /> 
                        </Button> 
                      </Space>), 
                  },
                ];

                const data: columnRow[] = fields.map((f, i) => ({ key: f.key ?? i }));

                return (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Table
                      size="small"
                      pagination={false}
                      columns={columns}
                      dataSource={data}
                    />
                    <Button type="dashed" block onClick={() => add({ is_required: false })}>
                      เพิ่มเอกสาร
                    </Button>
                  </Space>
                );
              }}
            </Form.List>

            {/* ---------------- เงื่อนไขอนุมัติ ---------------- */}
            <Divider orientation="left">เงื่อนไขผู้อนุมัติ</Divider>

            <Form.List name="leave_approval_rule">
              {(fields, { add, remove, move }) => {
                const columns = [
                  {
                    title: 'ลาน้อยกว่า (วัน)',
                    render: (_value: unknown, _record: columnRow, idx: number) => (
                      <Form.Item
                        name={[fields[idx].name, 'leave_less_than']}
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: 'ระบุจำนวนวัน' }]}
                      >
                        <InputNumber min={1} style={{ width: '100%' }} />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'ลำดับที่ต้องอนุมัติ',
                    render: (_value: unknown, _record: columnRow, idx: number) => (
                      <Form.Item
                        name={[fields[idx].name, 'approval_level']}
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: 'เลือกอย่างน้อย 1 ค่า' }]}
                      >
                        <Select
                          placeholder="เลือก"
                          options={approverOrders.map((n) => ({ label: `ลำดับที่ ${n}`, value: n }))}
                        />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'จัดการ',
                    render: (_value: unknown, _record: columnRow, idx: number) => (
                      <Space>
                        <Button size="small" onClick={() => move(idx, idx - 1)} disabled={idx === 0}>
                          <ArrowUpOutlined />
                        </Button>
                        <Button size="small" onClick={() => move(idx, idx + 1)} disabled={idx === fields.length - 1}>
                          <ArrowDownOutlined />
                        </Button>
                        <Button size="small" danger onClick={() => remove(idx)}>
                          <DeleteOutlined />
                        </Button>
                      </Space>
                    ),
                  },
                ];

                const data = fields.map((f, i) => ({ key: f.key ?? i }));

                return (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Table
                      size="small"
                      pagination={false}
                      columns={columns}
                      dataSource={data}
                    />
                    <Button type="dashed" block onClick={() => add()}>
                      เพิ่มเงื่อนไข
                    </Button>
                  </Space>
                );
              }}
            </Form.List>

            {/* -------- Action -------- */}
            <Row justify="space-between" style={{ marginTop: 12 }}>
              <Col>
                <Popconfirm title="ยืนยันการลบ?" onConfirm={onDelete} okText="ลบ" cancelText="ยกเลิก">
                  <Button danger>ลบประเภทนี้</Button>
                </Popconfirm>
              </Col>
              <Col>
                <Space>
                  <Button onClick={() => router.push('/private/admin/manage-leave/officialduty')}>ยกเลิก</Button>
                  <Button type="primary" htmlType="submit">
                    บันทึก
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Card>
      </Space>
    </div>
  );
}
