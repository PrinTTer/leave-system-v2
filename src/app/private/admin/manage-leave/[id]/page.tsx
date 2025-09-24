'use client';

import React, { useEffect, useState } from 'react';
import {
  Button, Card, Checkbox, Col, Divider, Form, Input, InputNumber, Row, Select,
  Space, Typography, message, Popconfirm
} from 'antd';
import { useRouter, useParams } from 'next/navigation';
// ❌ ไม่ใช้ store อีกต่อไป
// import { useLeaveTypesStore } from '@/store/leaveTypeStore';
import ApproverEditor from '@/app/components/FormElements/ApproverEditor';
import type { LeaveTypeConfig, GenderCode } from '@/types/leave';
import { usersMock } from '@/mock/users';
// ✅ ใช้ mock โดยตรงจากไฟล์นี้
import { leaveTypesSeed } from '@/mock/leave-type';

type ApprovalRuleForm = {
  maxDaysThreshold: number;
  selectedApproverIndexes?: number[];
};

type LeaveTypeFormValues = Omit<
  LeaveTypeConfig,
  'id' | 'createdAt' | 'updatedAt' | 'approvalRules'
> & {
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

export default function EditLeaveTypePage() {
  const { Title } = Typography;
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm<LeaveTypeFormValues>();

  useEffect(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    // ✅ หา item จาก mock โดยตรง
    const found = leaveTypesSeed.find((it) => it.id === id);

    const apply = (v?: LeaveTypeConfig) => {
      if (v) {
        const baseApprovers = v.approvers ?? [];
        const approvalRulesWithIndexes: ApprovalRuleForm[] = (v.approvalRules ?? []).map(rule => {
          const selected = (rule.approverChain ?? [])
            .map(ac => baseApprovers.findIndex(b => b.userId === ac.userId && b.position === ac.position))
            .filter(i => i >= 0);
          return { maxDaysThreshold: rule.maxDaysThreshold, selectedApproverIndexes: selected };
        });

        const values: LeaveTypeFormValues = {
          name: v.name,
          maxDays: v.maxDays,
          allowedGenders: v.allowedGenders,
          minServiceYears: v.minServiceYears,
          workingDaysOnly: v.workingDaysOnly,
          documents: v.documents,
          approvers: v.approvers,
          approvalRules: approvalRulesWithIndexes,
        };
        form.setFieldsValue(values);
      } else {
        message.error('ไม่พบประเภทการลา');
        router.push('/private/admin/manage-leave');
      }
      setLoading(false);
    };

    apply(found);
  }, [form, params.id, router]);

  // ---- สร้าง options ผู้อนุมัติจากค่าในฟอร์ม
  type ApproverRow = { position?: string; userId?: string };
  const approversWatch = Form.useWatch('approvers', { form, preserve: true }) as ApproverRow[] | undefined;

  const approverOrderOptions = (approversWatch ?? [])
    .map((ap, idx) => ({ ap, idx }))
    .filter(({ ap }) => ap && ap.userId)
    .map(({ ap, idx }) => {
      const u = usersMock.find(u => u.id === ap!.userId);
      const pos = ap!.position ?? 'ผู้อนุมัติ';
      return {
        label: `ลำดับที่ ${idx + 1} : ${pos}${u ? ` - ${u.name}` : ''}`,
        value: idx,
      };
    });

  // ---- บันทึก (เดโมเท่านั้น: ไม่ persist)
  const onFinish = (values: LeaveTypeFormValues) => {
    const baseApprovers = values.approvers ?? [];
    const normalizedRules = (values.approvalRules ?? []).map((r) => {
      const idxs: number[] = Array.isArray(r.selectedApproverIndexes) ? r.selectedApproverIndexes : [];
      const chain = idxs.map(i => baseApprovers[i]).filter(Boolean);
      return { maxDaysThreshold: r.maxDaysThreshold, approverChain: chain };
    });

    // ปกติจะเรียก update ที่ backend/store — ตอนนี้แค่แจ้งเตือน + กลับหน้า list
    console.log('[MOCK SAVE] values:', {
      ...values,
      approvalRules: normalizedRules,
    });
    message.success('บันทึก (โหมด Mock) — ไม่มีการเปลี่ยนแปลงข้อมูลจริง');
    router.push('/private/admin/manage-leave');
  };

  // ---- ลบ (เดโมเท่านั้น: ไม่ persist)
  const onDelete = () => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    console.log('[MOCK DELETE] id:', id);
    message.info('ลบ (โหมด Mock) — ไม่มีการเปลี่ยนแปลงข้อมูลจริง');
    router.push('/private/admin/manage-leave');
  };

  return (
    <div style={{ padding: 10 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={10}>
        <Title level={4} style={{ margin: 0 }}>แก้ไขประเภทลา</Title>
        <Card loading={loading}>
          <Form<LeaveTypeFormValues> form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="name" label="ชื่อประเภทการลา" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="maxDays" label="จำนวนวันลาสูงสุด" rules={[{ required: true }]}>
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="allowedGenders" label="เพศที่สามารถลาในประเภทนี้ได้">
                  <Checkbox.Group options={genderOptions} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="minServiceYears" label="อายุราชการขั้นต่ำ (ปี)">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="workingDaysOnly" valuePropName="checked">
              <Checkbox>นับวันลาเฉพาะวันทำการ</Checkbox>
            </Form.Item>

            <Divider orientation="left">ผู้อนุมัติ (ลำดับค่าเริ่มต้น)</Divider>
            <ApproverEditor namePath="approvers" />

            <Divider orientation="left">เอกสารแนบที่ต้องส่ง</Divider>
            <Form.List name="documents">
              {(fields, { add, remove, move }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} size="small" style={{ marginBottom: 10 }} title={`เอกสาร #${name + 1}`}>
                      <Row gutter={12}>
                        <Col xs={24} md={10}>
                          <Form.Item
                            {...restField}
                            name={[name, 'name']}
                            label="ชื่อเอกสาร"
                            rules={[{ required: true, message: 'กรุณาระบุชื่อเอกสาร' }]}
                          >
                            <Input placeholder="เช่น ใบรับรองแพทย์" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'fileType']}
                            label="ชนิดไฟล์"
                            rules={[{ required: true, message: 'กรุณาเลือกชนิดไฟล์' }]}
                          >
                            <Select options={fileTypeOptions} placeholder="เลือกชนิดไฟล์" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'required']}
                            label="ความจำเป็น"
                            valuePropName="checked"
                          >
                            <Checkbox>จำเป็นต้องมี</Checkbox>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row justify="end">
                        <Space>
                          <Button onClick={() => move(name, Math.max(0, name - 1))} disabled={name === 0}>ขึ้น</Button>
                          <Button onClick={() => move(name, Math.min(fields.length - 1, name + 1))} disabled={name === fields.length - 1}>ลง</Button>
                          <Button danger onClick={() => remove(name)}>ลบ</Button>
                        </Space>
                      </Row>
                    </Card>
                  ))}
                  <Button type="dashed" block onClick={() => add()}>เพิ่มเอกสาร</Button>
                </>
              )}
            </Form.List>

            <Divider orientation="left">เงื่อนไขของการอนุมัติ (เลือกจากผู้อนุมัติลำดับค่าเริ่มต้น)</Divider>
            <Form.List name="approvalRules">
              {(fields, { add, remove, move }) => (
                <>
                  {fields.map(({ key, name, ...restField }, idx) => (
                    <Card key={key} size="small" style={{ marginBottom: 10 }} title={`เงื่อนไข #${idx + 1}`}>
                      <Row gutter={12}>
                        <Col xs={24} md={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'maxDaysThreshold']}
                            label="จำนวนวันลาต่ำกว่า (วัน)"
                            rules={[{ required: true, message: 'กรุณาระบุจำนวนวัน' }]}
                          >
                            <InputNumber min={1} style={{ width: '100%' }} placeholder="30" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={16}>
                          <Form.Item
                            {...restField}
                            name={[name, 'selectedApproverIndexes']}
                            label="ต้องใช้ผู้อนุมัติลำดับที่"
                            rules={[{ required: true, message: 'กรุณาเลือกอย่างน้อย 1 ลำดับ' }]}
                          >
                            <Select
                              mode="multiple"
                              options={approverOrderOptions}
                              placeholder="เช่น ลำดับที่ 1, ลำดับที่ 2"
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row justify="end">
                        <Space>
                          <Button onClick={() => move(name, Math.max(0, name - 1))} disabled={name === 0}>ขึ้น</Button>
                          <Button onClick={() => move(name, Math.min(fields.length - 1, name + 1))} disabled={name === fields.length - 1}>ลง</Button>
                          <Button danger onClick={() => remove(name)}>ลบเงื่อนไข</Button>
                        </Space>
                      </Row>
                    </Card>
                  ))}
                  <Button type="dashed" block onClick={() => add()}>เพิ่มเงื่อนไข</Button>
                </>
              )}
            </Form.List>

            <Row justify="space-between" style={{ marginTop: 12 }}>
              <Col>
                <Popconfirm title="ยืนยันการลบ?" onConfirm={onDelete} okText="ลบ" cancelText="ยกเลิก">
                  <Button danger>ลบประเภทนี้</Button>
                </Popconfirm>
              </Col>
              <Col>
                <Space>
                  <Button onClick={() => history.back()}>ยกเลิก</Button>
                  <Button type="primary" htmlType="submit">บันทึก</Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Card>
      </Space>
    </div>
  );
}
