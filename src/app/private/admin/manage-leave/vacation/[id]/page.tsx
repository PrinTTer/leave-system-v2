/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  Skeleton,
} from 'antd';
import { useRouter, useParams } from 'next/navigation';
import ApproverEditor from '@/app/components/FormElements/ApproverEditor';
import type { LeaveTypeConfig, GenderCode } from '@/types/leave';
import { leaveTypesSeed } from '@/mock/leave-type';

type LeaveTypeFormValues = Omit<LeaveTypeConfig, 'id' | 'createdAt' | 'updatedAt'> & {
  vacationRules?: { minServiceYears: number; daysPerYear: number }[];
  carryOverRules?: { minServiceYears: number; carryOverDays: number }[];
};

type VacationLeavePayload = LeaveTypeConfig & {
  vacationRules?: { minServiceYears: number; daysPerYear: number }[];
  carryOverRules?: { minServiceYears: number; carryOverDays: number }[];
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

// ค่า default เฉพาะลาพักผ่อน กรณี record ไม่มีฟิลด์พิเศษ
const defaultVacationRules = [
  { minServiceYears: 1, daysPerYear: 10 },
  { minServiceYears: 10, daysPerYear: 20 },
];

const defaultCarryOverRules = [
  { minServiceYears: 1, carryOverDays: 20 },
  { minServiceYears: 10, carryOverDays: 20 },
];

export default function EditVacationLeavePage() {
  const { Title, Text } = Typography;
  const router = useRouter();
  const params = useParams();
  const recordId = useMemo(() => {
    const idParam = (params as any)?.id;
    return Array.isArray(idParam) ? idParam[0] : (idParam as string);
  }, [params]);

  const [form] = Form.useForm<LeaveTypeFormValues>();
  const [loading, setLoading] = useState(true);
  const [original, setOriginal] = useState<LeaveTypeConfig | null>(null);

  // โหลดข้อมูลสำหรับ id ที่ส่งมา (โหมด mock: ดึงจาก leaveTypesSeed)
  useEffect(() => {
    if (!recordId) return;
    setLoading(true);

    // หา record จาก seed (ในระบบจริงให้เรียก API)
    const found = leaveTypesSeed.find((x) => x.id === recordId) ?? null;

    if (!found) {
      message.error('ไม่พบประเภทการลาที่ต้องการแก้ไข');
      router.push('/private/admin/manage-leave');
      return;
    }

    setOriginal(found);

    // รองรับฟิลด์พิเศษ (ถ้า seed ไม่มี ให้ใช้ค่า default)
    const vacationRules = (found as any).vacationRules ?? defaultVacationRules;
    const carryOverRules = (found as any).carryOverRules ?? defaultCarryOverRules;

    // set ค่าเริ่มต้นลงฟอร์ม
    form.setFieldsValue({
      name: found.name ?? 'ลาพักผ่อน',
      maxDays: Number(found.maxDays ?? 20),
      allowedGenders: found.allowedGenders ?? [],
      minServiceYears: Number(found.minServiceYears ?? 0),
      workingDaysOnly: !!found.workingDaysOnly,
      documents: found.documents ?? [],
      approvers: found.approvers ?? [],
      vacationRules,
      carryOverRules,
    } as LeaveTypeFormValues);

    setLoading(false);
  }, [recordId, router, form]);

  const onFinish = (values: LeaveTypeFormValues) => {
    if (!original) return;

    const payload: VacationLeavePayload = {
      // ฟิลด์หลัก LeaveTypeConfig
      id: original.id,
      createdAt: original.createdAt, // เก็บของเดิม
      updatedAt: new Date().toISOString(),
      name: values.name,
      maxDays: Number(values.maxDays ?? 0),
      allowedGenders: values.allowedGenders ?? [],
      minServiceYears: Number(values.minServiceYears ?? 0),
      workingDaysOnly: !!values.workingDaysOnly,
      documents: values.documents ?? [],
      approvers: values.approvers ?? [],
      approvalRules: original.approvalRules ?? [],

      // นโยบายลาพักผ่อนเพิ่มเติม
      vacationRules: (values.vacationRules ?? []).map((r) => ({
        minServiceYears: Number(r.minServiceYears ?? 0),
        daysPerYear: Number(r.daysPerYear ?? 0),
      })),
      carryOverRules: (values.carryOverRules ?? []).map((r) => ({
        minServiceYears: Number(r.minServiceYears ?? 0),
        carryOverDays: Number(r.carryOverDays ?? 0),
      })),
    };

    // โหมด Mock: ยังไม่ persist ที่ไหน แค่โชว์ผล + redirect
    console.log('[MOCK UPDATE VACATION]', payload);
    message.success('บันทึกการแก้ไขประเภทการลา (ลาพักผ่อน) — โหมด Mock (ไม่บันทึกจริง)');
    router.push('/private/admin/manage-leave');
  };

  return (
    <div style={{ padding: 10 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={10}>
        <Title level={4} style={{ margin: 0 }}>
          แก้ไขประเภทลา (ลาพักผ่อน)
        </Title>

        <Card>
          {loading ? (
            <Skeleton active />
          ) : (
            <Form<LeaveTypeFormValues> form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="ชื่อประเภทการลา"
                    rules={[{ required: true, message: 'กรุณาระบุชื่อประเภทการลา' }]}
                  >
                    <Input disabled /> {/* ล็อกชื่อเป็น ลาพักผ่อน */}
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="minServiceYears" label="อายุราชการขั้นต่ำในการมีสิทธิ์ (ปี)">
                    <InputNumber min={0} style={{ width: '100%' }} placeholder="เช่น 0 หรือ 1" />
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
                  <Form.Item name="workingDaysOnly" valuePropName="checked" label=" ">
                    <Checkbox>นับวันลาเฉพาะวันทำการ</Checkbox>
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">ผู้อนุมัติ (ลำดับค่าเริ่มต้น)</Divider>
              <ApproverEditor namePath="approvers" />

              <Divider orientation="left">เอกสารแนบที่ต้องส่ง (ถ้ามี)</Divider>
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
                              <Input placeholder="เช่น แบบคำขอลาพักผ่อน" />
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
                            <Button
                              onClick={() => move(name, Math.min(fields.length - 1, name + 1))}
                              disabled={name === fields.length - 1}
                            >
                              ลง
                            </Button>
                            <Button danger onClick={() => remove(name)}>
                              ลบ
                            </Button>
                          </Space>
                        </Row>
                      </Card>
                    ))}
                    <Button type="dashed" block onClick={() => add()}>
                      เพิ่มเอกสาร
                    </Button>
                  </>
                )}
              </Form.List>

              <Divider orientation="left">เงื่อนไขวันลาพักผ่อนต่อปี</Divider>
              <Form.List name="vacationRules">
                {(fields, { add, remove, move }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, idx) => (
                      <Card key={key} size="small" style={{ marginBottom: 10 }} title={`กฎวันลาต่อปี #${idx + 1}`}>
                        <Row gutter={12}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'minServiceYears']}
                              label="อายุราชการมากกว่า (ปี)"
                              rules={[{ required: true, message: 'กรุณาระบุอายุราชการ' }]}
                            >
                              <InputNumber min={0} style={{ width: '100%' }} placeholder="เช่น 1, 10" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'daysPerYear']}
                              label="ได้รับวันลา (วัน/ปี)"
                              rules={[{ required: true, message: 'กรุณาระบุจำนวนวันลา/ปี' }]}
                            >
                              <InputNumber min={0} style={{ width: '100%' }} placeholder="เช่น 10, 20" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row justify="end">
                          <Space>
                            <Button onClick={() => move(name, Math.max(0, name - 1))} disabled={name === 0}>
                              ขึ้น
                            </Button>
                            <Button
                              onClick={() => move(name, Math.min(fields.length - 1, name + 1))}
                              disabled={name === fields.length - 1}
                            >
                              ลง
                            </Button>
                            <Button danger onClick={() => remove(name)}>
                              ลบกฎ
                            </Button>
                          </Space>
                        </Row>
                      </Card>
                    ))}
                    <Button type="dashed" block onClick={() => add()}>
                      เพิ่มกฎวันลาต่อปี
                    </Button>
                  </>
                )}
              </Form.List>

              <Divider orientation="left">เงื่อนไขการสะสมวันลาพักผ่อน</Divider>
              <Form.List name="carryOverRules">
                {(fields, { add, remove, move }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, idx) => (
                      <Card key={key} size="small" style={{ marginBottom: 10 }} title={`กฎการสะสม #${idx + 1}`}>
                        <Row gutter={12}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'minServiceYears']}
                              label="อายุราชการมากกว่า (ปี)"
                              rules={[{ required: true, message: 'กรุณาระบุอายุราชการ' }]}
                            >
                              <InputNumber min={0} style={{ width: '100%' }} placeholder="เช่น 1, 10" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'carryOverDays']}
                              label="สะสมวันลาได้สูงสุด (วัน)"
                              rules={[{ required: true, message: 'กรุณาระบุจำนวนวันสะสม' }]}
                            >
                              <InputNumber min={0} style={{ width: '100%' }} placeholder="เช่น 20" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row justify="end">
                          <Space>
                            <Button onClick={() => move(name, Math.max(0, name - 1))} disabled={name === 0}>
                              ขึ้น
                            </Button>
                            <Button
                              onClick={() => move(name, Math.min(fields.length - 1, name + 1))}
                              disabled={name === fields.length - 1}
                            >
                              ลง
                            </Button>
                            <Button danger onClick={() => remove(name)}>
                              ลบกฎ
                            </Button>
                          </Space>
                        </Row>
                      </Card>
                    ))}
                    <Button type="dashed" block onClick={() => add()}>
                      เพิ่มกฎการสะสม
                    </Button>
                  </>
                )}
              </Form.List>

              <Divider />

              <Row justify="space-between" style={{ marginTop: 12 }}>
                <Col>
                  <Button onClick={() => router.push('/private/admin/manage-leave')}>ยกเลิก</Button>
                </Col>
                <Col>
                  <Button type="primary" htmlType="submit">
                    บันทึกการแก้ไข
                  </Button>
                </Col>
              </Row>
            </Form>
          )}
        </Card>
      </Space>
    </div>
  );
}
