'use client';

import React from 'react';
import { Button, Card, Col, Form, Row, Select, Space, Typography } from 'antd';
import { ArrowDown, ArrowUp, Trash } from 'lucide-react';
import { usersMock } from '@/mock/users';

const positions = [
  'อาจารย์',
  'อาจารย์ที่ปรึกษา',
  'หัวหน้าภาควิชา',
  'คณบดี',
  'รองอธิการบดี',
  'อธิการบดี',
];

type Props = {
  /** path ของ Form.List เช่น 'approvers' (default) */
  namePath?: string;
};

export default function ApproverEditor({ namePath = 'approvers' }: Props) {
  const { Text } = Typography;

  return (
    <Form.List name={namePath}>
      {(fields, { add, remove, move }) => (
        <>
          {fields.length === 0 && (
            <Text type="secondary">ยังไม่มีผู้อนุมัติ กดปุ่มด้านล่างเพื่อเพิ่ม</Text>
          )}

          {fields.map(({ key, name, ...restField }, index) => (
            <Card
              key={key}
              size="small"
              title={`ผู้อนุมัติ อันดับ ${index + 1}`}
              style={{ marginBottom: 12 }}
              extra={
                <Space>
                  <Button
                    size="small"
                    icon={<ArrowUp size={16} />}
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                  />
                  <Button
                    size="small"
                    icon={<ArrowDown size={16} />}
                    disabled={index === fields.length - 1}
                    onClick={() => move(index, index + 1)}
                  />
                  <Button
                    size="small"
                    danger
                    icon={<Trash size={16} />}
                    onClick={() => remove(name)}
                  />
                </Space>
              }
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    {...restField}
                    name={[name, 'position']}
                    label="ตำแหน่ง"
                    rules={[{ required: true, message: 'กรุณาเลือกตำแหน่ง' }]}
                  >
                    <Select
                      options={positions.map((p) => ({ label: p, value: p }))}
                      placeholder="เลือกตำแหน่ง"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    {...restField}
                    name={[name, 'userId']}
                    label="ชื่อผู้อนุมัติ"
                    rules={[{ required: true, message: 'กรุณาเลือกผู้อนุมัติ' }]}
                  >
                    <Select
                      showSearch
                      optionFilterProp="label"
                      options={usersMock.map((u) => ({ value: u.id, label: u.name }))}
                      placeholder="เลือกผู้อนุมัติ"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ))}

          <Button type="dashed" onClick={() => add()} block>
            เพิ่มผู้อนุมัติ
          </Button>
        </>
      )}
    </Form.List>
  );
}
