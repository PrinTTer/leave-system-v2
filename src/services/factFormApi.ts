import { FactFormInput, OfficialdutyFactFormInput } from "@/types/factForm";
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
  data: OfficialdutyFactFormInput
) => {
  try {
    const response = await axios.post(
      `${API_BASE}/fact-form/officialduty`,
      data
    );
    console.log("response", response.data);
  } catch (error) {
    console.error("Can not get all fact-leave-credit", error);
  }
};
