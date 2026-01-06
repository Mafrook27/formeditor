import CryptoJS from "crypto-js";

/* ============================
   ✅ SECRET KEY (same as Angular)
============================ */
const SECRET_KEY =
  import.meta.env.VITE_SECRET_KEY ||
  "RPhNkT1eXouaSYfbWRDhfyiGK7Ryap6wABenCPXN08T1tcUiNWc467d0IAQRgHPsZx81HiJQZX3/PkSKb2HzRbEd1R4by+NdnmLk+pdEbh4=";

/* ============================
   ✅ ENCRYPT FUNCTION

============================ */
export const encrypt = (data: any) => {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    SECRET_KEY,
  ).toString();

  return {
    Enc_Str: encrypted,
  };
};

/* ============================
   ✅ DECRYPT DATA (Angular DecryptData)
============================ */
export const decrypt = <T = any>(response: any): T => {
  if (response) {
    const bytes = CryptoJS.AES.decrypt(response, SECRET_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData as T;
  }

  return response;
};
