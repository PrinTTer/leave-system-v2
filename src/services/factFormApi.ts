import {
  FactFormInput,
  OfficialdutyFactFormInput,
  SearchFactformDto,
} from "@/types/factForm";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const createFactform = async (data: FactFormInput) => {
  try {
    const response = await axios.post(`${API_BASE}/fact-form`, data);
    console.log("response", response.data);
  } catch (error) {
    console.error("Can not get all fact-leave-credit", error);
  }
};

export const createOfficialdutyFactform = async (
  data: OfficialdutyFactFormInput,
) => {
  try {
    const response = await axios.post(
      `${API_BASE}/fact-form/officialduty`,
      data,
    );
    console.log("response", response.data);
  } catch (error) {
    console.error("Can not get all fact-leave-credit", error);
  }
};

export const searchLeaveHistory = async (
  nontri_account: string,
  param: SearchFactformDto,
) => {
  const arr = [];

  if (param.fiscal_year) {
    arr.push(`fiscal_year=${param.fiscal_year}`);
  }
  if (param.leave_type_id) {
    arr.push(`leave_type_id=${param.leave_type_id}`);
  }
  if (param.search) {
    arr.push(`search=${param.search}`);
  }

  const queryParam = arr.join("&");

  try {
    const response = await axios.get(
      `${API_BASE}/fact-form/history/${nontri_account}?${queryParam}`,
    );
    return response.data;
  } catch (error) {
    console.error("Can not get all fact-leave-credit", error);
  }
};

export async function getFactFormById(fact_form_id: number) {
  try {
    const response = await axios.get(`${API_BASE}/fact-form/${fact_form_id}`);
    return response.data;
  } catch (error) {
    console.error("Can not get fact form by id", error);
  }
}

export async function updateFactForm(
  nontri_account: string,
  fact_form_id: number,
  data: FactFormInput | OfficialdutyFactFormInput,
) {
  try {
    const response = await axios.patch(
      `${API_BASE}/fact-form/${nontri_account}/${fact_form_id}`,
      data,
    );
    console.log(response);
  } catch (error) {
    console.error("Can not get fact form by id", error);
  }
}

export async function cancelLeaveForm(fact_form_id: number) {
  try {
    const response = await axios.get(
      `${API_BASE}/fact-form/cancel/${fact_form_id}`,
    );
    console.log(response);
  } catch (error) {
    console.error("Can not get fact form by id", error);
  }
}
