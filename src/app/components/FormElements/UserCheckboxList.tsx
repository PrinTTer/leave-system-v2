'use client';

import React, { useMemo, useCallback } from 'react';
import {
  Checkbox,
  Input,
  Button,
  Empty,
  Divider,
  Tooltip,
  Card,
  Row,
  Col,
  Tag,
  Avatar,
  Typography,
} from 'antd';

type CheckboxValueType = string | number | boolean;

interface User {
  id: string;
  name: string;
}

interface UserCheckboxListProps {
  users: User[];
  selectedUsers: string[];
  search: string;
  onCheckboxChange: (checkedValues: string[]) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxHeight?: number;
  showSelectAllActions?: boolean;
  title?: React.ReactNode;
  gridCols?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; xxl?: number };
  onSave?: () => void;              // <-- เพิ่ม
  showSaveButton?: boolean;         // <-- เพิ่ม (default: true)
}

const { Text } = Typography;

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

const highlight = (text: string, keyword: string) => {
  if (!keyword) return text;
  const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <mark key={i} className="px-0.5 rounded bg-yellow-200">
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
};

const UserCheckboxList: React.FC<UserCheckboxListProps> = ({
  users,
  selectedUsers,
  search,
  onCheckboxChange,
  onSearchChange,
  maxHeight = 480,
  showSelectAllActions = true,
  title = 'การตั้งค่าการมองเห็นวันลา',
  gridCols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 6 },
  onSave,                           // <-- รับเข้ามา
  showSaveButton = true,            // <-- ค่าเริ่มต้น
}) => {
  const filteredOptions = useMemo(
    () =>
      users
        .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
        .map((u) => ({ label: u.name, value: u.id })),
    [users, search],
  );

  const selectedUsersDetail = useMemo(
    () =>
      selectedUsers
        .map((id) => users.find((u) => u.id === id))
        .filter((u): u is User => Boolean(u)),
    [selectedUsers, users],
  );

  const onSelectAll = useCallback(() => {
    const allFilteredIds = filteredOptions.map((o) => String(o.value));
    const others = selectedUsers.filter((v) => !filteredOptions.some((o) => o.value === v));
    onCheckboxChange([...others, ...allFilteredIds]);
  }, [filteredOptions, selectedUsers, onCheckboxChange]);

  const onClearAll = useCallback(() => {
    const remain = selectedUsers.filter((v) => !filteredOptions.some((o) => o.value === v));
    onCheckboxChange(remain);
  }, [filteredOptions, selectedUsers, onCheckboxChange]);

  const valueChange = (vals: CheckboxValueType[]) => {
    onCheckboxChange(vals.map(String));
  };

  const removeOne = (id: string) => {
    onCheckboxChange(selectedUsers.filter((x) => x !== id));
  };

  return (
    <Card
      bordered
      className="rounded-xl shadow-sm"
      title={<span className="font-semibold">{title}</span>}
      styles={{
        body: { padding: 16 }, // ✅ แทน bodyStyle ที่ deprecate
      }}
      extra={
        <Text type="secondary">
          ทั้งหมด {users.length} ผู้ใช้ • ตรงกับค้นหา {filteredOptions.length} • เลือกแล้ว{' '}
          {selectedUsers.length}
        </Text>
      }
    >
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input.Search
          allowClear
          placeholder="ค้นหาผู้ใช้..."
          value={search}
          onChange={onSearchChange}
          className="max-w-md"
        />
        {showSelectAllActions && (
          <div className="flex gap-2">
            <Tooltip title="เลือกทั้งหมดจากผลการค้นหา">
              <Button onClick={onSelectAll}>เลือกทั้งหมด</Button>
            </Tooltip>
            <Tooltip title="ล้างการเลือกสำหรับผลการค้นหา">
              <Button onClick={onClearAll} danger>
                ล้างทั้งหมด
              </Button>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Selected tags */}
      {selectedUsersDetail.length > 0 && (
        <>
          <Divider className="my-3" />
          <div className="flex flex-wrap gap-2">
            {selectedUsersDetail.map((u) => (
              <Tag
                key={u.id}
                closable
                onClose={(e) => {
                  e.preventDefault();
                  removeOne(u.id);
                }}
                className="px-2 py-1 rounded-md"
              >
                <span className="inline-flex items-center gap-2">
                  <Avatar size="small" className="align-middle">
                    {getInitials(u.name)}
                  </Avatar>
                  <span className="max-w-[200px] truncate">{u.name}</span>
                </span>
              </Tag>
            ))}
          </div>
        </>
      )}

      <Divider className="my-3" />

      {/* Grid list */}
      <div style={{ maxHeight, overflowY: 'auto' }}>
        {filteredOptions.length === 0 ? (
          <div className="py-10">
            <Empty description="ไม่พบผู้ใช้" />
          </div>
        ) : (
          <Checkbox.Group value={selectedUsers} onChange={valueChange} className="w-full block">
            <Row gutter={[16, 16]}>
              {filteredOptions.map((opt) => {
                const userName = String(opt.label);
                const userId = String(opt.value);
                const checked = selectedUsers.includes(userId);

                return (
                  <Col
                    key={userId}
                    xs={24 / (gridCols.xs ?? 1)}
                    sm={24 / (gridCols.sm ?? 2)}
                    md={24 / (gridCols.md ?? 3)}
                    lg={24 / (gridCols.lg ?? 4)}
                    xl={24 / (gridCols.xl ?? 4)}
                    xxl={24 / (gridCols.xxl ?? 6)}
                  >
                    {/* ใช้ div เรียบๆ แทน Card ซ้อน เพื่อลดปัญหา layout/overflow */}
                    <div
                      className={`rounded-lg border p-3 transition hover:shadow-sm ${
                        checked ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="shrink-0">{getInitials(userName)}</Avatar>
                          <div className="min-w-0">
                            <div className="truncate font-medium">{highlight(userName, search)}</div>
                            <div className="text-xs text-gray-500">ID: {userId}</div>
                          </div>
                        </div>
                        <Checkbox value={userId}>
                          <span className="text-xs text-gray-600">เลือก</span>
                        </Checkbox>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        เลือกเพื่อแสดงวันลาของผู้ใช้นี้ในปฏิทิน
                      </p>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Checkbox.Group>
        )}
      </div>

      <Divider className="my-4" />

      {/* Footer inside the same big card */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          ทั้งหมด {users.length} ผู้ใช้ • ตรงกับค้นหา {filteredOptions.length}
        </span>
        <span className="font-medium">เลือกแล้ว {selectedUsers.length}</span>
      </div>

      {/* ---- ปุ่มบันทึกอยู่ในการ์ดใหญ่, แสดงต่อเมื่อส่ง onSave มาด้วย ---- */}
      {showSaveButton && onSave && (
        <div className="mt-3 text-right">
          <Button type="primary" onClick={onSave}>
            บันทึกการตั้งค่า
          </Button>
        </div>
      )}
    </Card>
  );
};

export default UserCheckboxList;
