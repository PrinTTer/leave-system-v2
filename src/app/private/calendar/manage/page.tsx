'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Button,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Checkbox,
  Space,
  Popconfirm,
  message,
  Breadcrumb,
  Row,
  Col,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import type { CalendarSchedule, CalendarType, HolidayCategory } from '@/types/calendar';
import { classifyPublicHoliday, countInclusiveDays } from '@/utils/calendar';
import router from 'next/router';

import {
  fetchCalendarList,
  createCalendar,
  updateCalendar,
  deleteCalendar,
  type CalendarDto,
} from '@/services/calendarApi';

const { RangePicker } = DatePicker;

const CALENDAR_TYPE_OPTIONS = [
  { label: 'ปฏิทินวันหยุดราชการ', value: 'holiday' },
  { label: 'ปฏิทินการศึกษา', value: 'academic' },
  { label: 'ปฏิทินปีงบประมาณ', value: 'fiscal' },
];

type DateMode = 'single' | 'range';

export default function ScheduleManagePage() {
  const [data, setData] = useState<CalendarSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarSchedule | null>(null);
  const [form] = Form.useForm();

  const [messageApi, contextHolder] = message.useMessage();

  // 🔹 โหลดข้อมูลจาก backend ครั้งแรก
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const rows = await fetchCalendarList();
        setData(rows);
      } catch (err) {
        console.error(err);
        messageApi.error('โหลดข้อมูลปฏิทินไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [messageApi]);

  // 🔹 กด "แก้ไข" แถวใดแถวหนึ่ง
  const onEdit = useCallback((rec: CalendarSchedule) => {
    setEditing(rec);
    setOpen(true);
  }, []);

  // 🔹 ลบกำหนดการ
  const onDeleteClick = useCallback(
    async (id: string) => {
      try {
        await deleteCalendar(id);
        setData((prev) => prev.filter((i) => i.id !== id));
        messageApi.success('ลบแล้ว');
      } catch (err) {
        console.error(err);
        messageApi.error('ลบกำหนดการไม่สำเร็จ');
      }
    },
    [messageApi],
  );

  // 🔹 กด "เพิ่มกำหนดการใหม่"
  const onAdd = useCallback(() => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      calendarType: 'holiday',
      dateMode: 'single',
      isHoliday: true,
    });
    setOpen(true);
  }, [form]);

  const columns: ColumnsType<CalendarSchedule> = useMemo(
    () => [
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
          const color = t === 'holiday' ? 'blue' : t === 'academic' ? 'purple' : 'geekblue';
          const label =
            t === 'holiday' ? 'วันหยุดราชการ' : t === 'academic' ? 'ปีการศึกษา' : 'ปีงบประมาณ';
          return <Tag color={color}>{label}</Tag>;
        },
        filters: CALENDAR_TYPE_OPTIONS.map((o) => ({ text: o.label, value: o.value })),
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
        title: 'หมวดวันหยุด (เฉพาะปฏิทินวันหยุดราชการ)',
        dataIndex: 'holidayCategory',
        width: 260,
        render: (hc?: HolidayCategory, rec?: CalendarSchedule) => {
          if (!(rec?.calendarType === 'holiday' && rec?.isHoliday)) return null;
          const text =
            hc === 'public_contiguous'
              ? 'นักขัตฤกษ์ (ต่อเนื่องกับ ส.-อา.)'
              : 'นักขัตฤกษ์ (ไม่ต่อเนื่อง)';
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
            <Button size="small" onClick={() => onEdit(rec)}>
              แก้ไข
            </Button>
            <Popconfirm
              title="ลบกำหนดการนี้?"
              onConfirm={() => onDeleteClick(rec.id)}
              okText="ใช่"
              cancelText="ยกเลิก"
            >
              <Button size="small" danger>
                ลบ
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [onEdit, onDeleteClick],
  );

  // 🔹 กดปุ่ม "บันทึก" ใน modal (ใช้ทั้งเพิ่มใหม่ + แก้ไข)
  const handleOk = async () => {
    try {
      const v = await form.validateFields();

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
      if (v.calendarType === 'holiday' && v.isHoliday) {
        holidayCategory = classifyPublicHoliday(start, end);
      }

      const dto: CalendarDto = {
        calendarType: v.calendarType,
        title: v.title,
        description: v.description || '',
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
        isHoliday: v.calendarType === 'holiday' ? !!v.isHoliday : false,
      };

      let result: CalendarSchedule;

      // ✅ ถ้ามี editing แสดงว่าเป็นโหมด "แก้ไข" → เรียก PUT
      if (editing && editing.id) {
        result = await updateCalendar(String(editing.id), dto);

        result = {
          ...editing, // เก็บข้อมูลเดิม เช่น id, createdAt, updatedAt ถ้ามี
          ...result,  // ทับด้วยข้อมูลที่ backend อัปเดตกลับมา
          dayCount,
          holidayCategory,
        };

        setData((prev) => prev.map((i) => (i.id === editing.id ? result : i)));
        messageApi.success('บันทึกการแก้ไขแล้ว');
      } else {
        // ➕ โหมด "เพิ่มใหม่" → POST
        result = await createCalendar(dto);

        result = {
          ...result,
          dayCount,
          holidayCategory,
        };

        setData((prev) => [result, ...prev]);
        messageApi.success('เพิ่มกำหนดการแล้ว');
      }

      setOpen(false);
      setEditing(null);
      form.resetFields();
    } catch (err: unknown) {
      console.error(err);

      // error จาก validateFields (ไม่ต้องโชว์ toast ซ้ำ)
      if (typeof err === 'object' && err !== null && 'errorFields' in err) {
        return;
      }

      messageApi.error('บันทึกกำหนดการไม่สำเร็จ');
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setEditing(null);
    form.resetFields();
  };

  // 🔍 ดูค่าจากฟอร์ม เพื่อ control UI วันที่ + checkbox
  const calendarType = Form.useWatch('calendarType', form) as CalendarType | undefined;
  const dateMode = Form.useWatch('dateMode', form) as DateMode | undefined;
  const singleDate = Form.useWatch('singleDate', form) as Dayjs | undefined;
  const rangeDate = Form.useWatch('rangeDate', form) as [Dayjs, Dayjs] | undefined;

  // 🔄 เวลาเปิด modal แก้ไข ให้ดึงค่าของ record นั้นมาใส่ในฟอร์ม
  useEffect(() => {
    if (!open || !editing) return;

    const rec = editing;
    const isSame = rec.startDate === rec.endDate;

    form.resetFields();
    form.setFieldsValue({
      id: rec.id,
      calendarType: rec.calendarType,
      isHoliday: rec.calendarType === 'holiday' ? !!rec.isHoliday : false,
      dateMode: isSame ? 'single' : 'range',
      singleDate: isSame ? dayjs(rec.startDate) : undefined,
      rangeDate: !isSame ? [dayjs(rec.startDate), dayjs(rec.endDate)] : undefined,
      dayCount: rec.dayCount,
      title: rec.title,
      description: rec.description,
    });
  }, [open, editing, form]);

  // 🔁 อัปเดต dayCount อัตโนมัติเมื่อผู้ใช้เปลี่ยนวันที่
  useEffect(() => {
    if (dateMode === 'single' && singleDate) {
      form.setFieldsValue({ dayCount: 1 });
    } else if (dateMode === 'range' && rangeDate?.[0] && rangeDate?.[1]) {
      form.setFieldsValue({ dayCount: countInclusiveDays(rangeDate[0], rangeDate[1]) });
    }
  }, [dateMode, singleDate, rangeDate, form]);

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}

      <Space direction="vertical" style={{ width: '100%' }} size={10}>
        <Row>
          <Col span={12}>
            <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: 18 }}>
              จัดการปฏิทิน
            </Typography.Title>
          </Col>
        </Row>

        <Breadcrumb
          items={[
            {
              title: (
                <a
                  onClick={() => {
                    router.push(`/private/calendar/manage`);
                  }}
                >
                  จัดการปฏิทิน
                </a>
              ),
            },
          ]}
        />

        <div className="chemds-container">
          <Space style={{ marginBottom: 12, display: 'flex', justifyContent: 'right' }}>
            <Button type="primary" onClick={onAdd}>
              เพิ่มกำหนดการ
            </Button>
          </Space>

          <Table
            rowKey="id"
            columns={columns}
            dataSource={data}
            loading={loading}
            scroll={{ x: 1000 }}
          />
        </div>

        <Modal
          title={editing ? 'แก้ไขกำหนดการ' : 'เพิ่มกำหนดการ'}
          open={open}
          onOk={handleOk}
          onCancel={handleCancel}
          okText="บันทึก"
          cancelText="ยกเลิก"
        >
          <Form form={form} layout="vertical">
            {/* hidden id ไว้เผื่อใช้เพิ่มเติม (ไม่จำเป็นต้องใช้เช็คใน handleOk แล้ว) */}
            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>

            <Form.Item
              label="ชนิดของปฏิทิน"
              name="calendarType"
              rules={[{ required: true, message: 'กรุณาเลือกชนิดปฏิทิน' }]}
            >
              <Select options={CALENDAR_TYPE_OPTIONS} />
            </Form.Item>

            {calendarType === 'holiday' && (
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
      </Space>
    </div>
  );
}