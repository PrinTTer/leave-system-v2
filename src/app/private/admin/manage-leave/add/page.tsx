'use client';

import React, { useEffect } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
  message,
} from 'antd';
import { useRouter } from 'next/navigation';
import { useLeaveTypesStore } from '@/store/leaveTypeStore';
import ApproverEditor from '@/app/components/FormElements/ApproverEditor';
import type { LeaveTypeConfig, GenderCode } from '@/types/leave';
import { usersMock } from '@/mock/users';

type LeaveTypeFormValues = Omit<LeaveTypeConfig, 'id' | 'createdAt' | 'updatedAt'>;

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
  const { add, hydrate } = useLeaveTypesStore();
  const [form] = Form.useForm<LeaveTypeFormValues>();

  useEffect(() => { hydrate(); }, [hydrate]);

  // watcher: ใช้จำนวน/รายละเอียดผู้อนุมัติหลักเพื่อทำ options ให้ rule
  // ป้องกันค่าไม่ครบจาก Form.List (เช่น ยังไม่เลือก userId/position)
    type ApproverRow = { position?: string; userId?: string };
    const approversWatch = Form.useWatch('approvers', { form, preserve: true }) as ApproverRow[] | undefined;

    const approverOrderOptions = (approversWatch ?? [])
    .map((ap, idx) => ({ ap, idx }))
    .filter(({ ap }) => ap && ap.userId) // เอาเฉพาะแถวที่เลือก user แล้ว
    .map(({ ap, idx }) => {
        const u = usersMock.find(u => u.id === ap!.userId);
        const pos = ap!.position ?? 'ผู้อนุมัติ';
        return {
        label: `ลำดับที่ ${idx + 1} : ${pos}${u ? ` - ${u.name}` : ''}`,
        value: idx,
        };
    });


  const onFinish = (values: LeaveTypeFormValues) => {
    // แปลง selectedApproverIndexes (ในแต่ละ rule) ให้กลายเป็น approverChain จาก approvers หลัก
    const baseApprovers = values.approvers ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalizedRules = (values.approvalRules ?? []).map((r: any) => {
      const idxs: number[] = Array.isArray(r.selectedApproverIndexes) ? r.selectedApproverIndexes : [];
      const chain = idxs
        .map(i => baseApprovers[i])
        .filter(Boolean); // ApproverConfig[]
      return {
        maxDaysThreshold: r.maxDaysThreshold,
        approverChain: chain,
      };
    });

    add({
      name: values.name,
      maxDays: Number(values.maxDays ?? 0),
      allowedGenders: values.allowedGenders ?? [],
      minServiceYears: Number(values.minServiceYears ?? 0),
      workingDaysOnly: !!values.workingDaysOnly,
      documents: values.documents ?? [],
      approvers: baseApprovers,
      approvalRules: normalizedRules,
    });
    message.success('เพิ่มประเภทการลาเรียบร้อย');
    router.push('/private/admin/manage-leave');
  };

  return (
    <div style={{ padding: 10 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={10}>
        <Title level={4} style={{ margin: 0 }}>เพิ่มประเภทลา</Title>
        <Card>
          <Form<LeaveTypeFormValues> form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="ชื่อประเภทการลา"
                  rules={[{ required: true, message: 'กรุณาระบุชื่อประเภทการลา' }]}
                >
                  <Input placeholder="เช่น ลาป่วย / ลากิจส่วนตัว" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="maxDays"
                  label="จำนวนวันลาสูงสุด"
                  rules={[{ required: true, message: 'กรุณาระบุจำนวนวัน' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="120" />
                </Form.Item>
              </Col>
            </Row>

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
                          <Button onClick={() => move(name, Math.max(0, name - 1))} disabled={name === 0}>
                            ขึ้น
                          </Button>
                          <Button onClick={() => move(name, Math.min(fields.length - 1, name + 1))} disabled={name === fields.length - 1}>
                            ลง
                          </Button>
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
                            // เก็บ index ของผู้อนุมัติที่เลือกไว้ชั่วคราวในฟอร์ม (จะ map เป็น approverChain ตอน submit)
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
              <Col><Button onClick={() => router.push('/private/admin/manage-leave')}>ยกเลิก</Button></Col>
              <Col><Button type="primary" htmlType="submit">บันทึก</Button></Col>
            </Row>
          </Form>
        </Card>
      </Space>
    </div>
  );
}
