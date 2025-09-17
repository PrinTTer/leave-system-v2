'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Button, Table, Tag, Modal, Form, Input, DatePicker, Select, Checkbox, Space, Popconfirm, message
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import type { CalendarSchedule, CalendarType, HolidayCategory } from '@/types/calendar';
import { calendarSchedulesMock } from '@/mock/calendarSchedules';
import { classifyPublicHoliday, countInclusiveDays } from '@/utils/calendar';
import { mergeMockWithDiff, loadDiff, saveDiff, buildDiffFromData } from '@/utils/scheduleStorage';

const { RangePicker } = DatePicker;

const CALENDAR_TYPE_OPTIONS = [
  { label: 'ปฏิทินวันหยุดราชการ', value: 'standard' },
  { label: 'ปฏิทินการศึกษา', value: 'academic' },
  { label: 'ปฏิทินปีงบประมาณ', value: 'fiscal' },
];

const STORAGE_KEY = 'calendarSchedules';

type DateMode = 'single' | 'range';

export default function ScheduleManagePage() {
  const [data, setData] = useState<CalendarSchedule[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarSchedule | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
  const diff = loadDiff();
  const merged = mergeMockWithDiff(calendarSchedulesMock, diff);
  setData(merged);
}, []);

// SAVE: เมื่อ data เปลี่ยน ให้คำนวน diff แล้วบันทึกแค่ diff (mock อยู่เป็น baseline ไม่หาย)
useEffect(() => {
  // ถ้าหน้ายังไม่ได้ mount ด้วย merged จริงๆ ให้กัน edge case ที่ data ว่าง
  if (!data || data.length === 0) return;
  const diff = buildDiffFromData(data, calendarSchedulesMock);
  saveDiff(diff);
}, [data]);

  const columns: ColumnsType<CalendarSchedule> = useMemo(() => [
    {
      title: 'วันที่',
      dataIndex: 'startDate',
      render: (_, rec) => {
        const s = dayjs(rec.startDate).format('DD MMM YYYY');
        const e = dayjs(rec.endDate).format('DD MMM YYYY');
        return s === e ? s : `${s} - ${e}`;
      },
    },
    {
      title: 'จำนวนวัน',
      dataIndex: 'dayCount',
      width: 120,
    },
    {
      title: 'ชนิดปฏิทิน',
      dataIndex: 'calendarType',
      width: 160,
      render: (t: CalendarType) => {
        const color = t === 'standard' ? 'blue' : t === 'academic' ? 'purple' : 'geekblue';
        const label = t === 'standard' ? 'ธรรมดา' : t === 'academic' ? 'ปีการศึกษา' : 'ปีงบประมาณ';
        return <Tag color={color}>{label}</Tag>;
      },
      filters: CALENDAR_TYPE_OPTIONS.map(o => ({ text: o.label, value: o.value })),
      onFilter: (val, rec) => rec.calendarType === val,
    },
    {
      title: 'ชื่อกิจกรรม',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: 'รายละเอียด',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: 'หมวดวันหยุด (เฉพาะธรรมดา)',
      dataIndex: 'holidayCategory',
      width: 220,
      render: (hc?: HolidayCategory, rec?: CalendarSchedule) => {
        if (!(rec?.calendarType === 'standard' && rec?.isHoliday)) return null;
        const text = hc === 'public_contiguous' ? 'นักขัตฤกษ์ (ต่อเนื่องกับ ส.-อา.)' : 'นักขัตฤกษ์ (ไม่ต่อเนื่อง)';
        const color = hc === 'public_contiguous' ? 'green' : 'gold';
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: 'นักขัตฯ ต่อเนื่อง', value: 'public_contiguous' },
        { text: 'นักขัตฯ ไม่ต่อเนื่อง', value: 'public_non_contiguous' },
      ],
      onFilter: (val, rec) => rec.holidayCategory === val,
    },
    {
      title: 'การทำงาน',
      key: 'actions',
      fixed: 'right',
      width: 160,
      render: (_, rec) => (
        <Space>
          <Button size="small" onClick={() => onEdit(rec)}>แก้ไข</Button>
          <Popconfirm title="ลบกำหนดการนี้?" onConfirm={() => onDelete(rec.id)}>
            <Button size="small" danger>ลบ</Button>
          </Popconfirm>
        </Space>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [data]);

  const onAdd = () => {
    setEditing(null);
    form.resetFields();
    // default
    form.setFieldsValue({ calendarType: 'standard', dateMode: 'single' });
    setOpen(true);
  };

  const onEdit = (rec: CalendarSchedule) => {
    setEditing(rec);
    form.resetFields();
    const isSame = rec.startDate === rec.endDate;
    form.setFieldsValue({
      id: rec.id,
      calendarType: rec.calendarType,
      isHoliday: !!rec.isHoliday,
      dateMode: isSame ? 'single' : 'range',
      singleDate: isSame ? dayjs(rec.startDate) : undefined,
      rangeDate: !isSame ? [dayjs(rec.startDate), dayjs(rec.endDate)] : undefined,
      dayCount: rec.dayCount,
      title: rec.title,
      description: rec.description,
    });
    setOpen(true);
  };

  const onDelete = (id: string) => {
    setData(prev => prev.filter(i => i.id !== id));
    message.success('ลบแล้ว');
  };

  const handleOk = async () => {
    const v = await form.validateFields();

    // ดึง start/end จาก single/range
    let start: Dayjs;
    let end: Dayjs;
    if (v.dateMode === 'single') {
      start = v.singleDate.startOf('day');
      end = v.singleDate.startOf('day');
    } else {
      start = v.rangeDate[0].startOf('day');
      end = v.rangeDate[1].startOf('day');
    }

    const dayCount = countInclusiveDays(start, end);

    let holidayCategory: HolidayCategory | undefined = undefined;
    if (v.calendarType === 'standard' && v.isHoliday) {
      holidayCategory = classifyPublicHoliday(start, end);
    }

    const payload: CalendarSchedule = {
      id: v.id ?? `ev-${Math.random().toString(36).slice(2, 8)}`,
      calendarType: v.calendarType,
      title: v.title,
      description: v.description || '',
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD'),
      dayCount,
      isHoliday: v.calendarType === 'standard' ? !!v.isHoliday : undefined,
      holidayCategory,
    };

    setData(prev => {
      // upsert
      const idx = prev.findIndex(i => i.id === payload.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = payload;
        return next;
      }
      return [payload, ...prev];
    });

    message.success(editing ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มกำหนดการแล้ว');
    setOpen(false);
  };

  const handleCancel = () => setOpen(false);

  // ฟอร์ม: คุมการโชว์/ซ่อน field + คำนวณจำนวนวัน on-the-fly
  const calendarType = Form.useWatch('calendarType', form) as CalendarType | undefined;
  const dateMode = Form.useWatch('dateMode', form) as DateMode | undefined;
  const singleDate = Form.useWatch('singleDate', form) as Dayjs | undefined;
  const rangeDate = Form.useWatch('rangeDate', form) as [Dayjs, Dayjs] | undefined;

  useEffect(() => {
    if (dateMode === 'single' && singleDate) {
      form.setFieldsValue({ dayCount: 1 });
    } else if (dateMode === 'range' && rangeDate?.[0] && rangeDate?.[1]) {
      form.setFieldsValue({ dayCount: countInclusiveDays(rangeDate[0], rangeDate[1]) });
    }
  }, [dateMode, singleDate, rangeDate, form]);

  return (
    <div style={{ padding: 16 }}>
      <Space style={{ marginBottom: 12 }}>
        <Button type="primary" onClick={onAdd}>เพิ่มกำหนดการ</Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        scroll={{ x: 1000 }}
      />

      <Modal
        title={editing ? 'แก้ไขกำหนดการ' : 'เพิ่มกำหนดการ'}
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="บันทึก"
        cancelText="ยกเลิก"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="id" hidden><Input /></Form.Item>

          <Form.Item
            label="ชนิดของปฏิทิน"
            name="calendarType"
            rules={[{ required: true, message: 'กรุณาเลือกชนิดปฏิทิน' }]}
          >
            <Select options={CALENDAR_TYPE_OPTIONS} />
          </Form.Item>

          {/* เฉพาะปฏิทินวันหยุดราชการ: flag วันหยุดนักขัตฤกษ์ (ใช้เพื่อจัดหมวดต่อเนื่อง/ไม่ต่อเนื่อง) */}
          {calendarType === 'standard' && (
            <Form.Item name="isHoliday" valuePropName="checked">
              <Checkbox>วันหยุดนักขัตฤกษ์</Checkbox>
            </Form.Item>
          )}

          <Form.Item
            label="โหมดวันที่"
            name="dateMode"
            initialValue="single"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: 'วันเดียว', value: 'single' },
                { label: 'ช่วงวันที่', value: 'range' },
              ]}
              style={{ width: 160 }}
            />
          </Form.Item>

          {dateMode === 'single' ? (
            <Form.Item
              label="วันที่"
              name="singleDate"
              rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}
            >
              <DatePicker />
            </Form.Item>
          ) : (
            <Form.Item
              label="ช่วงวันที่"
              name="rangeDate"
              rules={[{ required: true, message: 'กรุณาเลือกช่วงวันที่' }]}
            >
              <RangePicker />
            </Form.Item>
          )}

          <Form.Item label="จำนวนวัน (รวม ส.-อา.)" name="dayCount">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="ชื่อกิจกรรม/กำหนดการ"
            name="title"
            rules={[{ required: true, message: 'กรุณากรอกชื่อกิจกรรม' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="รายละเอียดกิจกรรม/กำหนดการ" name="description">
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
