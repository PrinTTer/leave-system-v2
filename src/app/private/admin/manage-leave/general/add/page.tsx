/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import {
  Button, Card, Checkbox, Col, Divider, Form, Input, InputNumber,
  Row, Select, Space, Typography, message, Table
} from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined } from '@ant-design/icons';

import { useRouter } from 'next/navigation';
import type { LeaveTypeConfig, GenderCode } from '@/types/leave';
import ApproverPositionEditor from '@/app/components/FormElements/ApproverPositionEditor';

type ApprovalRuleForm = {
  maxDaysThreshold: number;
  selectedApproverIndexes?: number[];   // อ้างอิง index ของ approverPositions
};

type LeaveTypeFormValues = Omit<
  LeaveTypeConfig,
  'id' | 'createdAt' | 'updatedAt' | 'approvalRules'
> & {
  // ใช้รูปแบบ approverPositions ใหม่ (หนึ่งลำดับมีหลายตำแหน่ง)
  approverPositions?: { positions: string[] }[];
  approvalRules?: ApprovalRuleForm[];
};

const genderOptions: { label: string; value: GenderCode }[] = [
  { label: 'ชาย', value: 'male' },
  { label: 'หญิง', value: 'female' },
  { label: 'อื่นๆ', value: 'other' },
];

const fileTypeOptions = [
  { label: 'PDF', value: 'pdf' },
  { label: 'รูปภาพ', value: 'image' },
  { label: 'เอกสาร Word', value: 'doc' },
  { label: 'อื่นๆ', value: 'other' },
];

export default function AddLeaveTypePage() {
  const { Title, Text } = Typography;
  const router = useRouter();
  const [form] = Form.useForm<LeaveTypeFormValues>();

  // ---- Watch รายการลำดับผู้อนุมัติ (เพื่อสร้าง options ในกติกา) ----
  const approverPositions = Form.useWatch('approverPositions', { form }) as { positions?: string[] }[] | undefined;

  const approverOrderOptions = (approverPositions ?? []).map((ap, idx) => ({
    label: `ลำดับที่ ${idx + 1}${(ap?.positions?.length ?? 0) ? ` : ${ap!.positions!.join(', ')}` : ''}`,
    value: idx,
  }));

  const onFinish = (values: LeaveTypeFormValues) => {
    const basePos = values.approverPositions ?? [];    // [{ positions: string[] }]
    const normalizedRules = (values.approvalRules ?? []).map((r) => {
      const idxs: number[] = Array.isArray(r.selectedApproverIndexes) ? r.selectedApproverIndexes : [];
      const chain = idxs.map(i => basePos[i]).filter(Boolean); // [{ positions: string[] }]
      return {
        maxDaysThreshold: r.maxDaysThreshold,
        approverChain: chain,
      };
    });

    // ตัวอย่าง payload (โหมด Mock)
    console.log('[MOCK ADD] payload:', {
      ...values,
      approvers: basePos,             // เก็บลงฟิลด์ approvers แต่เป็นรูป {positions: string[]}
      approvalRules: normalizedRules,  // chain อ้างอิงตามลำดับ
    });

    message.success('เพิ่มประเภทการลา (โหมด Mock) — ไม่ได้บันทึกจริง');
    router.push('/private/admin/manage-leave');
  };

  return (
    <div style={{ padding: 10 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={10}>
        <Title level={4} style={{ margin: 0 }}>เพิ่มประเภทลา (ลาทั่วไป)</Title>

        <Card>
          <Form<LeaveTypeFormValues> form={form} layout="vertical" onFinish={onFinish}>
            {/* -------- แถว 1: ชื่อ + สูงสุด (วัน) -------- */}
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="ชื่อประเภทการลา"
                  rules={[{ required: true, message: 'กรุณาระบุชื่อประเภทการลา' }]}
                  extra="ตัวอย่าง: ลาป่วย, ลากิจส่วนตัว, ลาคลอดบุตร (สามารถตั้งชื่ออื่นได้)"
                >
                  <Input placeholder="เช่น ลาป่วย / ลากิจส่วนตัว / ลาคลอดบุตร" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="maxDays"
                  label="จำนวนวันลาสูงสุด"
                  rules={[{ required: true, message: 'กรุณาระบุจำนวนวัน' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="เช่น 120" />
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

            {/* -------- ผู้อนุมัติ (ตาราง) -------- */}
            <Divider orientation="left">ผู้อนุมัติ (กำหนดตาม “ตำแหน่ง” เป็นลำดับ)</Divider>
            <ApproverPositionEditor nameList={['approverPositions']} />

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
                        <Input placeholder="เช่น ใบรับรองแพทย์" />
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
                        <Button size="small" onClick={() => move(fields[idx].name, Math.max(0, fields[idx].name - 1))} disabled={idx === 0}><ArrowUpOutlined /></Button>
                        <Button size="small" onClick={() => move(fields[idx].name, Math.min(fields.length - 1, fields[idx].name + 1))} disabled={idx === fields.length - 1}><ArrowDownOutlined /></Button>
                        <Button size="small" danger onClick={() => remove(fields[idx].name)}><DeleteOutlined /></Button>
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
                    <Button type="dashed" block onClick={() => add()}>
                      เพิ่มเอกสาร
                    </Button>
                  </Space>
                );
              }}
            </Form.List>

            {/* -------- เงื่อนไขอนุมัติ (ตาราง) -------- */}
            <Divider orientation="left">เงื่อนไขของการอนุมัติ (เลือกจากลำดับผู้อนุมัติ)</Divider>
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
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="เช่น 30" />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'ต้องใช้ผู้อนุมัติลำดับที่',
                    dataIndex: 'selectedApproverIndexes',
                    render: (_: any, __: any, idx: number) => (
                      <Form.Item
                        name={[fields[idx].name, 'selectedApproverIndexes']}
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: 'เลือกอย่างน้อย 1 ลำดับ' }]}
                      >
                        <Select
                          mode="multiple"
                          options={approverOrderOptions}
                          placeholder="เช่น ลำดับที่ 1, ลำดับที่ 2"
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
                        <Button size="small" onClick={() => move(fields[idx].name, Math.max(0, fields[idx].name - 1))} disabled={idx === 0}><ArrowUpOutlined /></Button>
                        <Button size="small" onClick={() => move(fields[idx].name, Math.min(fields.length - 1, fields[idx].name + 1))} disabled={idx === fields.length - 1}><ArrowDownOutlined /></Button>
                        <Button size="small" danger onClick={() => remove(fields[idx].name)}><DeleteOutlined /></Button>
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
              <Col><Button onClick={() => router.push('/private/admin/manage-leave')}>ยกเลิก</Button></Col>
              <Col><Button type="primary" htmlType="submit">บันทึก</Button></Col>
            </Row>
          </Form>
        </Card>
      </Space>
    </div>
  );
}
