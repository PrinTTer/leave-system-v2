"use client";

import UserCard from "@/app/components/user-info/UserCard";
import { useUser } from "@/app/contexts/userContext";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FactFormInfo, OfficialdutyFactformInfo } from "@/types/factForm";
import { getFactFormById } from "@/services/factFormApi";
import { LeaveCategory } from "@/types/leaveType";
import FormalApplicationFormEdit from "./formal-application/general/page";
import { UserInfo } from "@/types/user";
import GeneralLeaveFormEdit from "./general-application/general/page";
import InternationalLeaveFormEdit from "./general-application/international/page";
import InternationalFormalLeaveFormEdit from "./formal-application/international/page";
import { Row, Col, Typography, Space } from "antd";

const EditLeaveApplication = () => {
  const userContext = useUser();
  const [user, setUser] = useState<UserInfo>({} as UserInfo);

  useEffect(() => {
    if (!userContext.user) return;

    const [firstName, lastName] = userContext.user.fullname.split(" ");

    setUser({
      ...userContext.user,
      firstName,
      lastName,
    });
  }, [userContext.user]);

  const searchParams = useSearchParams();
  const factFormId = searchParams.get("fact_form_id");
  const isEdit = searchParams.get("edit") === "true";

  const [info, setInfo] = useState<FactFormInfo>({} as FactFormInfo);

  const [officialdutyInfo, setOfficialdutyInfo] =
    useState<OfficialdutyFactformInfo>({} as OfficialdutyFactformInfo);

  useEffect(() => {
    if (!user?.nontri_account) return;

    if (!factFormId) return;

    const fetchLeaveHistory = async () => {
      const data = await getFactFormById(Number(factFormId));
      if (data.form.leave_type.category === LeaveCategory.OFFICIALDUTY) {
        setOfficialdutyInfo(data.form);
      } else {
        setInfo(data.form);
      }
    };
    fetchLeaveHistory();
  }, [factFormId, user?.nontri_account]);

  return (
    <div>
      <Row>
        <Col span={12}>
          <Typography.Title
            level={4}
            style={{ marginTop: 0, marginBottom: 0, fontSize: 18 }}
          >
            แก้ไขใบลา ({" "}
            {officialdutyInfo?.leave_type
              ? `${officialdutyInfo?.leave_type?.name} - ${officialdutyInfo?.leave_aboard}`
              : `${info?.leave_type?.name} - ${info?.leave_aboard}`}
            )
          </Typography.Title>
          <Typography.Title
            style={{
              marginTop: 0,
              marginBottom: 0,
              fontSize: 14,
              color: "#f95f5f",
            }}
          >
            หากต้องการเปลี่ยนประเภทการลากรุณาสร้างใบลาใหม่
          </Typography.Title>
        </Col>
      </Row>

      <UserCard />

      <Space
        direction="vertical"
        style={{ width: "100%", paddingRight: 30, paddingLeft: 30 }}
        size={10}
      >
        {officialdutyInfo && officialdutyInfo?.leave_aboard === "ในประเทศ" ? (
          <FormalApplicationFormEdit
            user={user}
            data={officialdutyInfo}
            is_edit={isEdit}
          />
        ) : officialdutyInfo &&
          officialdutyInfo?.leave_aboard === "ต่างประเทศ" ? (
          <InternationalFormalLeaveFormEdit
            user={user}
            data={officialdutyInfo}
            is_edit={isEdit}
          />
        ) : info?.leave_type?.category !== LeaveCategory.OFFICIALDUTY &&
          info?.leave_aboard === "ในประเทศ" ? (
          <GeneralLeaveFormEdit user={user} data={info} is_edit={isEdit} />
        ) : info?.leave_aboard === "ต่างประเทศ" ? (
          <InternationalLeaveFormEdit
            user={user}
            data={info}
            is_edit={isEdit}
          />
        ) : null}
      </Space>
    </div>
  );
};

export default EditLeaveApplication;
