import { Config } from "@/shared/lib/config";
function getCurrentUser() {
  return "repave";
}

export const getAuthHeaders = () => {
  let UserId = "";
  let SessionID = "";

  const userinfo = Config.getUserInfoToken();
  const userInfo = userinfo ? JSON.parse(userinfo) : null;

  if (userInfo) {
    UserId = userInfo.UserId;
    SessionID = userInfo.SessionID;
  }

  const token = Config.getStoreInfo();
  const store = token ? JSON.parse(token).store : getCurrentUser();

  return {
    authorization: store,
    UserId,
    SessionID,
  };
};
