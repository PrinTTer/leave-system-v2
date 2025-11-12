/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import {
  Button, Card, Checkbox, Col, Divider, Form, Input, InputNumber,
  Row, Select, Space, Typography, message, Table,
  Tag,
  Breadcrumb
} from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { createLeaveType } from '@/services/leaveTypeApi';
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

export default function AddOfficialDutyLeaveTypePage() {
  const { Title, Text } = Typography;
  const router = useRouter();
  const [form] = Form.useForm();

  // ใช้ดูค่า maxApproverCount เพื่อสร้างตัวเลือก "ลำดับที่ 1..N"
  const maxApproverCount = Form.useWatch('maxApproverCount', form) ?? 0;
  const approverOrders = Array.from(
    { length: Math.max(0, Number(maxApproverCount || 0)) },
    (_, i) => i + 1
  );

  const onFinish = async (values: any) => {
    try {
      // หา gender รูปแบบ backend: 'all' | 'male' | 'female'
      let gender: string = 'all';
      if (Array.isArray(values.allowedGenders) && values.allowedGenders.length === 1) {
        gender = values.allowedGenders[0];
      } else if (Array.isArray(values.allowedGenders) && values.allowedGenders.length === 0) {
        gender = 'all';
      }

      // เอกสาร: map เป็น LeaveTypeDocument[]
      const leave_type_document = (values.documents ?? []).map((d: any) => ({
        // leave_type_document_id / leave_type_id จะถูก server สร้างเอง
        name: d?.name ?? '',
        file_type: d?.fileType ?? 'pdf',
        is_required: !!d?.required,
      })) as LeaveTypeApiItem['leave_type_document'];

      // เงื่อนไขอนุมัติ: map เป็น LeaveApprovalRule[]
      // UI ให้เลือกหลายลำดับ (requiredApproverOrders: number[]) แต่ backend type ต้องการ approval_level:number
      // ตัดสินใจ: ส่งเป็นค่าสูงสุด (max) ของที่เลือก (หมายถึงต้องผ่านจนถึงลำดับนี้)
      const leave_approval_rule = (values.approvalRules ?? [])
        .map((r: any) => {
          const threshold = Number(r?.maxDaysThreshold) || 0;
          const orders = Array.isArray(r?.requiredApproverOrders)
            ? r.requiredApproverOrders.map((n: any) => Number(n)).filter((n: number) => Number.isInteger(n) && n >= 1)
            : [];

          if (!threshold || orders.length === 0) return null;

          const approval_level = Math.max(...orders); // ถ้าต้องการ logic อื่น ให้เปลี่ยนที่นี่
          return {
            leave_less_than: threshold,
            approval_level,
          };
        })
        .filter(Boolean) as LeaveTypeApiItem['leave_approval_rule'];

      // สร้าง payload ตาม LeaveTypeApiItem
      const payload: LeaveTypeApiItem = {
        name: String(values.name ?? ''),
        max_leave: Number(values.maxDays ?? 0),
        gender,
        service_year: Number(values.minServiceYears ?? 0),
        is_count_vacation: !!values.workingDaysOnly,
        number_approver: Number(values.maxApproverCount ?? 0),
        category: 'officialduty',
        leave_type_document,
        leave_approval_rule,
      };

      // เรียก API สร้างประเภทลา
      // console.log('create: payload', payload);
      await createLeaveType(payload);

      message.success('เพิ่มประเภทการลาเรียบร้อยแล้ว');
      router.push('/private/admin/manage-leave/officialduty');
    } catch (err: any) {
      console.error('createLeaveType error', err);
      // ถ้า backend ส่งข้อความ error ชัดเจน ให้แสดง
      const errMsg = err?.response?.data?.message ?? err?.message ?? 'เกิดข้อผิดพลาดในการเพิ่มประเภทการลา';
      message.error(errMsg);
    }
  };


  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={10}>
        <Title level={4} style={{ margin: 0 }}>เพิ่มประเภทลา (ราชการ)</Title>
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
              { title: "เพิ่ม" },
            ]}
          />

        <Card>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            {/* -------- แถว 1: ชื่อ + สูงสุด (วัน) -------- */}
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="ชื่อประเภทการลา"
                  rules={[{ required: true, message: 'กรุณาระบุชื่อประเภทการลา' }]}
                  extra="ตัวอย่าง: ลาราชการต่างประเทศ, ลาราชการในประเทศ (สามารถตั้งชื่ออื่นได้)"
                >
                  <Input placeholder="เช่น ลาราชการต่างประเทศ / ลาราชการในประเทศ" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="maxDays"
                  label="จำนวนวันลาสูงสุด"
                  rules={[{ required: true, message: 'กรุณาระบุจำนวนวัน' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="เช่น 30" />
                </Form.Item>
              </Col>
            </Row>

            {/* -------- แถว 2: เพศ + อายุราชการ -------- */}
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="allowedGenders" label="เพศที่สามารถลาในประเภทนี้ได้">
                  <Checkbox.Group options={genderOptions} />
                </Form.Item>
                <Text type="secondary">ไม่เลือก/เลือกครบทุกเพศ = ทุกเพศ</Text>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="minServiceYears" label="อายุราชการขั้นต่ำ (ปี)">
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="workingDaysOnly" valuePropName="checked">
              <Checkbox>นับวันลาเฉพาะวันทำการ</Checkbox>
            </Form.Item>

            {/* -------- ผู้อนุมัติ (เหลือแค่จำนวนสูงสุด) -------- */}
            <Divider orientation="left">ผู้อนุมัติ (กำหนดเพียงจำนวนสูงสุด)</Divider>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="maxApproverCount"
                  label="จำนวนผู้อนุมัติสูงสุด"
                  rules={[{ required: true, message: 'กรุณาระบุจำนวนผู้อนุมัติสูงสุด' }]}
                  extra="เช่น 5 จะได้ลำดับผู้อนุมัติ 1–5"
                >
                  <InputNumber min={1} max={10} style={{ width: '100%' }} placeholder="เช่น 5" />
                </Form.Item>
              </Col>

              <Col xs={24} md={16}>
                <Form.Item label="ลำดับผู้อนุมัติที่จะเกิดขึ้น">
                  <Space wrap>
                    {approverOrders.length === 0 ? (
                      <Tag>ยังไม่กำหนด</Tag>
                    ) : (
                      approverOrders.map((n) => (
                        <Tag key={n} color="blue">
                          ลำดับที่ {n}
                        </Tag>
                      ))
                    )}
                  </Space>
                </Form.Item>
              </Col>
            </Row>

            {/* -------- เอกสารแนบ (ตาราง) -------- */}
            <Divider orientation="left">เอกสารแนบที่ต้องส่ง</Divider>
            <Form.List name="documents">
              {(fields, { add, remove, move }) => {
                const columns = [
                  {
                    title: 'ชื่อเอกสาร',
                    dataIndex: 'name',
                    render: (_: any, __: any, idx: number) => (
                      <Form.Item
                        name={[fields[idx].name, 'name']}
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: 'ระบุชื่อเอกสาร' }]}
                      >
                        <Input placeholder="เช่น หนังสือราชการ" />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'ชนิดไฟล์',
                    dataIndex: 'fileType',
                    width: 220,
                    render: (_: any, __: any, idx: number) => (
                      <Form.Item
                        name={[fields[idx].name, 'fileType']}
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: 'เลือกชนิดไฟล์' }]}
                      >
                        <Select options={fileTypeOptions} placeholder="เลือกชนิดไฟล์" />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'จำเป็น',
                    dataIndex: 'required',
                    width: 120,
                    render: (_: any, __: any, idx: number) => (
                      <Form.Item
                        name={[fields[idx].name, 'required']}
                        valuePropName="checked"
                        style={{ marginBottom: 0 }}
                      >
                        <Checkbox />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'จัดการ',
                    dataIndex: 'actions',
                    width: 180,
                    render: (_: any, __: any, idx: number) => (
                      <Space>
                        <Button
                          size="small"
                          onClick={() => move(idx, Math.max(0, idx - 1))}
                          disabled={idx === 0}
                        >
                          <ArrowUpOutlined />
                        </Button>
                        <Button
                          size="small"
                          onClick={() => move(idx, Math.min(fields.length - 1, idx + 1))}
                          disabled={idx === fields.length - 1}
                        >
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
                      columns={columns as any}
                      dataSource={data}
                      locale={{ emptyText: 'ยังไม่มีเอกสารแนบ' }}
                    />
                    <Button type="dashed" block onClick={() => add({ is_required: false })}>
                      เพิ่มเอกสาร
                    </Button>
                  </Space>
                );
              }}
            </Form.List>

            {/* -------- เงื่อนไขอนุมัติ (ตาราง) -------- */}
            <Divider orientation="left">เงื่อนไขของการอนุมัติ </Divider>
            <Form.List name="approvalRules">
              {(fields, { add, remove, move }) => {
                const columns = [
                  {
                    title: 'จำนวนวันลาต่ำกว่า (วัน)',
                    dataIndex: 'maxDaysThreshold',
                    width: 260,
                    render: (_: any, __: any, idx: number) => (
                      <Form.Item
                        name={[fields[idx].name, 'maxDaysThreshold']}
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: 'กรุณาระบุจำนวนวัน' }]}
                      >
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="เช่น 7" />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'ต้องใช้ผู้อนุมัติ "ลำดับที่"',
                    dataIndex: 'requiredApproverOrders',
                    render: (_: any, __: any, idx: number) => (
                      <Form.Item
                        name={[fields[idx].name, 'requiredApproverOrders']}
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: 'เลือกอย่างน้อย 1 ลำดับ' }]}
                        extra={
                          typeof maxApproverCount === 'number'
                            ? `เลือกได้ตั้งแต่ลำดับที่ 1 ถึง ${maxApproverCount}`
                            : 'กรุณาระบุจำนวนผู้อนุมัติสูงสุดก่อน'
                        }
                      >
                        <Select
                          mode="multiple"
                          placeholder="เช่น ลำดับที่ 1, 2"
                          options={approverOrders.map(n => ({ label: `ลำดับที่ ${n}`, value: n }))}
                          disabled={!approverOrders.length}
                          allowClear
                        />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'จัดการ',
                    dataIndex: 'actions',
                    width: 180,
                    render: (_: any, __: any, idx: number) => (
                      <Space>
                        <Button
                          size="small"
                          onClick={() => move(idx, Math.max(0, idx - 1))}
                          disabled={idx === 0}
                        >
                          <ArrowUpOutlined />
                        </Button>
                        <Button
                          size="small"
                          onClick={() => move(idx, Math.min(fields.length - 1, idx + 1))}
                          disabled={idx === fields.length - 1}
                        >
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
                      columns={columns as any}
                      dataSource={data}
                      locale={{ emptyText: 'ยังไม่มีเงื่อนไข' }}
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
              <Col><Button onClick={() => router.push('/private/admin/manage-leave/officialduty')}>ยกเลิก</Button></Col>
              <Col><Button type="primary" htmlType="submit">บันทึก</Button></Col>
            </Row>
          </Form>
        </Card>
      </Space>
    </div>
  );
}
