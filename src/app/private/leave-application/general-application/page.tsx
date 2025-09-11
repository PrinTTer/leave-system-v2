"use client";

import React, { useState } from "react";
import { Form, DatePicker, Input, Button, Upload } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { UploadOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;

const GeneralLeaveForm : React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleChange = (info: { fileList: UploadFile[] }) => {
    setFileList(info.fileList);
  };
  return (
    <div>
      <Form
        layout="vertical"
        className="max-w-lg p-6 border rounded-lg bg-white shadow-sm"
      >
        {/* ระบุเหตุผลการลา */}
        <Form.Item
          label="เหตุผลการลา"
          name="reason"
          rules={[{ required: true, message: "กรุณาระบุเหตุผลการลา" }]}
        >
          <Input.TextArea rows={3} placeholder="กรอกเหตุผลการลา..." />
        </Form.Item>

        {/* ช่วงเวลาที่ลา */}
        <Form.Item
          label="มีกำหนดตั้งแต่วันที่ - ถึงวันที่"
          name="duration"
          rules={[{ required: true, message: "กรุณาเลือกช่วงเวลา" }]}
        >
          <RangePicker style={{ width: "100%" }} />
        </Form.Item>

        {/* แนบเอกสาร */}
        <Form.Item label="แนบเอกสารเพิ่มเติม" name="attachments">
          <Upload
          fileList={fileList}
          onChange={handleChange}
          >
            <Button icon={<UploadOutlined />}>เลือกไฟล์</Button>
          </Upload>
        </Form.Item>
      </Form>
    </div>
  );
};

export default GeneralLeaveForm;
