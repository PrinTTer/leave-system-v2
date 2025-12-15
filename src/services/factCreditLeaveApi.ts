import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const getAllFactLeaveCreditLeftByUser = async (
  nontri_account: string
) => {
  try {
    const response = await axios.get(
      `${API_BASE}/fact-leave-credit/${nontri_account}/left`
    );
    return response.data;
  } catch (error) {
    console.error("Can not get all fact-leave-credit", error);
  }
};

export const getAllFactLeaveCreditByUser = async (nontri_account: string) => {
  try {
    const response = await axios.get(
      `${API_BASE}/fact-leave-credit/${nontri_account}`
    );
    return response.data;
  } catch (error) {
    console.error("Can not get all fact-leave-credit", error);
  }
};

export const getPersonalAndVacationLeave = async (nontri_account: string) => {
  try {
    const response = await axios.get(
      `${API_BASE}/fact-leave-credit/${nontri_account}/personal-vacation-left`
    );

    return response.data;
  } catch (error) {
    console.error("Can not get all fact-leave-credit", error);
  }
};
