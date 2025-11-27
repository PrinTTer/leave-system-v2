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
  onSave?: () => void;
  showSaveButton?: boolean;
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
  onSave,
  showSaveButton = true,
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
      className="rounded-xl shadow-sm"
      title={<span className="font-semibold">{title}</span>}
      styles={{
        body: { padding: 16 },
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

            {/* List = card แนวยาว แถวเดียวต่อคน */}
      <div style={{ maxHeight, overflowY: 'auto', width: '100%' }}>
        {filteredOptions.length === 0 ? (
          <div className="py-10">
            <Empty description="ไม่พบผู้ใช้" />
          </div>
        ) : (
          <Checkbox.Group
            value={selectedUsers}
            onChange={valueChange}
            style={{ width: '100%', display: 'block' }}
          >
            {/* ระยะห่างระหว่างการ์ด */}
            <div className="flex flex-col gap-4 w-full mt-1">
              {filteredOptions.map((opt) => {
                const userName = String(opt.label);
                const userId = String(opt.value);
                const checked = selectedUsers.includes(userId);

                return (
                  <label
                    key={userId}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 24px', // padding รอบการ์ด
                      gap: 24,              // 👈 ช่องว่างระหว่าง Checkbox / Avatar / Text
                    }}
                    className={`
                      rounded-xl border bg-white cursor-pointer
                      transition hover:shadow-md hover:bg-gray-50
                      ${checked ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}
                    `}
                  >
                    {/* ทุก element อยู่แถวเดียวกัน */}
                    <Checkbox value={userId} className="shrink-0" />

                    <Avatar className="shrink-0">
                      {getInitials(userName)}
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <span className="truncate whitespace-nowrap font-medium">
                        {highlight(userName, search)}{' '}
                        <span className="text-xs text-gray-500 ml-6">
                          ID: {userId}
                        </span>
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </Checkbox.Group>
        )}
      </div>


      <Divider className="my-4" />

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          ทั้งหมด {users.length} ผู้ใช้ • ตรงกับค้นหา {filteredOptions.length}
        </span>
        <span className="font-medium">เลือกแล้ว {selectedUsers.length}</span>
      </div>

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
