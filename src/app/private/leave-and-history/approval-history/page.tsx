"use client";

import React, { useState } from 'react';
import type { TableProps } from 'antd';
import { Table, Button, Tooltip, Select, Input, Form, DatePicker, Row, Col, Card } from 'antd';
import { CloseOutlined, InfoOutlined } from '@ant-design/icons';

interface ApprovalHistory {
  key: React.Key;
  submittedDate: string;
  applicant: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  approvalStatus: string;
  approvalDate: string;
  remark?: string;
}

const { Search } = Input;

type ColumnTypes = Exclude<TableProps<ApprovalHistory>['columns'], undefined>;

const ApprovalHistoryPage: React.FC = () => {
  const [dataSource] = useState<ApprovalHistory[]>([
    { 
      key: '0', 
      leaveType: 'ลาป่วย', 
      applicant: 'วรัญญา อรรถเสนา',
      submittedDate: '2025-08-01', 
      startDate: '2025-08-01', 
      endDate: '2025-08-03', 
      totalDays: 3,
      approvalStatus: 'อนุมัติ', 
      approvalDate: '2025-08-09', 
      remark: '-'
    },
    { 
      key: '1', 
      leaveType: 'ลากิจส่วนตัว', 
      applicant: 'วรัญญา อรรถเสนา',
      submittedDate: '2025-08-01', 
      startDate: '2025-09-01', 
      endDate: '2025-09-30', 
      totalDays: 22,
      approvalStatus: 'ไม่อนุมัติ', 
      approvalDate: '2025-08-09', 
      remark: '-'
    },
  ]);

  const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex?: string })[] = [
    { 
      title: 'วันที่ยื่นคำร้อง', 
      dataIndex: 'submittedDate', 
      align: 'center',
      sorter: (a, b) => new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime(),
      onHeaderCell: () => ({ style: { textAlign: 'center' } })
    },
    { 
      title: 'ผู้ยื่น', 
      dataIndex: 'applicant',
      filters: [
        { text: 'วรัญญา อรรถเสนา', value: 'วรัญญา อรรถเสนา' },
      ],
      onFilter: (value, record) => record.applicant.includes(value as string),
      onHeaderCell: () => ({ style: { textAlign: 'center' } })
    },
    { 
      title: 'ประเภทการลา', 
      dataIndex: 'leaveType', 
      width: "15%",
      filters: [
        { text: 'ลาป่วย', value: 'ลาป่วย' },
        { text: 'ลากิจส่วนตัว', value: 'ลากิจส่วนตัว' },
      ],
      onFilter: (value, record) => record.leaveType.includes(value as string),
      onHeaderCell: () => ({ style: { textAlign: 'center' } })
    },
    { 
      title: 'วันที่เริ่มลา', 
      dataIndex: 'startDate', 
      align: 'center',
      sorter: (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      onHeaderCell: () => ({ style: { textAlign: 'center' } })
    },
    { 
      title: 'วันที่สิ้นสุดการลา', 
      dataIndex: 'endDate', 
      align: 'center',
      sorter: (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
      onHeaderCell: () => ({ style: { textAlign: 'center' } })
    },
    { 
      title: 'จำนวนวันลา', 
      dataIndex: 'totalDays', 
      align: 'right',
      sorter: (a, b) => a.totalDays - b.totalDays,
      onHeaderCell: () => ({ style: { textAlign: 'center'} })
    },
    {
      title: 'สถานะการอนุมัติ',
      dataIndex: 'approvalStatus',
      align: 'center',
      filters: [
        { text: 'อนุมัติ', value: 'อนุมัติ' },
        { text: 'ไม่อนุมัติ', value: 'ไม่อนุมัติ' },
      ],
      onFilter: (value, record) => record.approvalStatus === value,
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
      render: (text: string) => {
        let bg = '';
        let color = '';

        if (text === 'อนุมัติ') {
          bg = '#e3ffc7ff';   // เขียวอ่อน
          color = '#389e0d'; // เขียวเข้ม
        } else if (text === 'ไม่อนุมัติ') {
          bg = '#ffcac6ff';   // แดงอ่อน
          color = '#cf1322'; // แดงเข้ม
        } else {
          bg = '#fae9b0ff'; // ค่า default (เหลือง)
          color = '#e79702ff';
        }

        return (
          <span
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              fontSize: 12,
              borderRadius: 10,
              backgroundColor: bg,
              color: color,
            }}
          >
            {text}
          </span>
        );
      },
    },
    { 
      title: 'วันที่อนุมัติ', 
      dataIndex: 'approvalDate',
      sorter: (a, b) => new Date(a.approvalDate).getTime() - new Date(b.approvalDate).getTime(),
      onHeaderCell: () => ({ style: { textAlign: 'center' } })
    },
    { 
      title: 'หมายเหตุ', 
      dataIndex: 'remark', 
      onHeaderCell: () => ({ style: { textAlign: 'center' } }), 
      align: 'center' 
    },
    {
      title: 'จัดการ',
      key: 'management',
      align: 'center',
      render: () => (
        <div className='flex justify-center gap-2'>
          <Tooltip title="รายละเอียด">
            <Button type="primary" shape="circle" icon={<InfoOutlined />} />
          </Tooltip>
          <Tooltip title="ยกเลิก">
            <Button shape="circle" color='red' variant='solid' icon={<CloseOutlined />} />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
    <h2 className="text-xl font-bold mb-4">ประวัติการอนุมัติ</h2>

    <Card>
      <div className='flex justify-between my-5'>
        <div className='flex justify-content-start gap-4'>
          <Form layout="vertical" className="flex gap-4" style={{ marginBottom: 10 }}>
            <Row align="middle" className="text-sm font-medium"  style={{ gap: 10 }}>
              <Col>
                <Form.Item label="ปีงบประมาณ" style={{ marginBottom: 0 }}>
                <Select
                  defaultValue=""
                  style={{ width: 120 }}
                  options={[
                    { value: '', label: 'ทั้งหมด' },
                    { value: '2569', label: '2569' },
                    { value: '2568', label: '2568' },
                    { value: '2567', label: '2567' },
                  ]}
                />
              </Form.Item>
              </Col>

              <Col>
                <Form.Item label="วันที่" style={{ marginBottom: 0 }}>
                <DatePicker/>
                </Form.Item>
              </Col>

              <Col>
                <Form.Item label="ประเภทการลา" style={{ marginBottom: 0 }}>
                <Select
                  defaultValue=""
                  style={{ width: 150 }}
                  options={[
                    { value: '', label: 'ทั้งหมด' },
                    { value: 'ลาป่วย', label: 'ลาป่วย' },
                    { value: 'ลากิจ', label: 'ลากิจ' },
                  ]}
                />
              </Form.Item>
              </Col>

              <Col>
                  <Form.Item label="ค้นหา" style={{ marginBottom: 0 }}>
                    <Search placeholder="ค้นหา" allowClear style={{ width: 200 }} />
                  </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
      
      <Table<ApprovalHistory>
        bordered
        dataSource={dataSource}
        columns={defaultColumns as ColumnTypes}
      />
    </Card>
      
    </div>
  );
};

export default ApprovalHistoryPage;
