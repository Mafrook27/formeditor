// src/services/token.service.ts
import axios from "axios";

const BASE_URL = "http://172.30.15.10:245";

export const generateBearerToken = async (): Promise<string> => {
  const response = await axios.post<string>(
    `${BASE_URL}/api/LMUserAuthenticate/v1/oauth/token`,
    {
      userName: "admin",
      password: "Tql@dmin#2019",
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const token = response.data; // RAW JWT STRING

  localStorage.setItem("accessToken", token);

  return token;
};
