'use client';

import React, { useMemo, useCallback } from 'react';
import { Checkbox, Input, List, Avatar, Button, Empty, Divider, Tooltip } from 'antd';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';

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
}

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
  maxHeight = 320,
  showSelectAllActions = true,
}) => {
  const filteredOptions = useMemo(
    () =>
      users
        .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
        .map((u) => ({ label: u.name, value: u.id })),
    [users, search],
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

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
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

      <Divider className="my-0" />

      {/* List */}
      <div style={{ maxHeight, overflowY: 'auto' }} className="p-2">
        {filteredOptions.length === 0 ? (
          <div className="py-10">
            <Empty description="ไม่พบผู้ใช้" />
          </div>
        ) : (
          <Checkbox.Group
            options={[]}
            value={selectedUsers}
            onChange={valueChange}
            className="w-full"
          >
            <List
              grid={{ gutter: 12, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 6 }}
              dataSource={filteredOptions}
              renderItem={(opt) => {
                const userName = String(opt.label);
                const userId = String(opt.value);
                return (
                  <List.Item>
                    <label className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 hover:shadow-sm">
                      <Checkbox value={userId} />
                      <Avatar>{getInitials(userName)}</Avatar>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{highlight(userName, search)}</div>
                        <div className="text-xs text-gray-500">ID: {userId}</div>
                      </div>
                    </label>
                  </List.Item>
                );
              }}
            />
          </Checkbox.Group>
        )}
      </div>

      <Divider className="my-0" />

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <span className="text-gray-600">
          ทั้งหมด {users.length} ผู้ใช้ • ตรงกับค้นหา {filteredOptions.length}
        </span>
        <span className="font-medium">เลือกแล้ว {selectedUsers.length}</span>
      </div>
    </div>
  );
};

export default UserCheckboxList;
