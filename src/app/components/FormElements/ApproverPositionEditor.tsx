/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';
import React from 'react';
import { Button, Card, Form, Select, Space, Table, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined } from '@ant-design/icons';

const positionOptions = [
  { label: 'หัวหน้าฝ่าย', value: 'หัวหน้าฝ่าย' },
  { label: 'หัวหน้าภาค', value: 'หัวหน้าภาค' },
  { label: 'คณบดี', value: 'คณบดี' },
  { label: 'อธิการบดี', value: 'อธิการบดี' },
];

type Props = {
  nameList?: (string | number)[];        // default: ['approverPositions']
};

export default function ApproverPositionEditor({
  nameList = ['approverPositions'],
}: Props) {
  const form = Form.useFormInstance();

  const addRow = () => {
    const list = form.getFieldValue(nameList as any) ?? [];
    form.setFieldsValue({ [nameList[0] as string]: [...list, { positions: [] }] });
  };

  const removeRow = (index: number) => {
    const list = (form.getFieldValue(nameList as any) ?? []) as any[];
    list.splice(index, 1);
    form.setFieldsValue({ [nameList[0] as string]: [...list] });
  };

  const moveRow = (from: number, to: number) => {
    const list = (form.getFieldValue(nameList as any) ?? []) as any[];
    if (to < 0 || to >= list.length) return;
    const it = list.splice(from, 1)[0];
    list.splice(to, 0, it);
    form.setFieldsValue({ [nameList[0] as string]: [...list] });
  };

  return (
    <Card size="small" variant="borderless" style={{ padding: 0 }}>
      <Form.List name={nameList as any}>
        {(fields) => {
          const columns = [
            {
              title: 'ลำดับ',
              dataIndex: 'order',
              width: 90,
              render: (_: any, __: any, idx: number) => <Typography.Text>ลำดับที่ {idx + 1}</Typography.Text>,
            },
            {
              title: 'ตำแหน่งผู้อนุมัติ (เลือกได้หลายตำแหน่งต่อ 1 ลำดับ)',
              dataIndex: 'positions',
              render: (_: any, __: any, idx: number) => {
                const namePath = [fields[idx].name, 'positions'] as (string | number)[];
                return (
                  <Form.Item
                    name={namePath}
                    style={{ marginBottom: 0 }}
                    rules={[{ required: true, message: 'กรุณาเลือกตำแหน่งอย่างน้อย 1 ตำแหน่ง' }]}
                  >
                    <Select
                      mode="multiple"
                      allowClear
                      options={positionOptions}
                      placeholder="เลือกตำแหน่ง"
                    />
                  </Form.Item>
                );
              },
            },
            {
              title: 'จัดลำดับ',
              dataIndex: 'actions',
              width: 170,
              render: (_: any, __: any, idx: number) => (
                <Space>
                  <Button size="small" onClick={() => moveRow(idx, idx - 1)} disabled={idx === 0}><ArrowUpOutlined /></Button>
                  <Button size="small" onClick={() => moveRow(idx, idx + 1)} disabled={idx === fields.length - 1}><ArrowDownOutlined /></Button>
                  <Button size="small" danger onClick={() => removeRow(idx)}><DeleteOutlined /></Button>
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
                locale={{ emptyText: 'ยังไม่มีลำดับผู้อนุมัติ' }}
              />
              <Button type="dashed" onClick={addRow} block>
                เพิ่มลำดับผู้อนุมัติ
              </Button>
              <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                หมายเหตุ: กำหนดลำดับผู้อนุมัติจากบนลงล่าง
              </Typography.Paragraph>
            </Space>
          );
        }}
      </Form.List>
    </Card>
  );
}
