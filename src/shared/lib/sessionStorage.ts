const AUTH_TOKEN = "authToken";
const USER_INFO = "UserInfo";
const AUTH_SESSION_ID = "SessionID";
// const STORE_INFO = "Storeinfo";
const ACTIVE_SESSION = "ActiveSession";
const SPARK_DIALPAD = "SparkDialPadInfo";
const REPORT_INFO = "ReportInfo";
const DRAWER_ENABLED_STATUS = "DrawerEnabledStatus";
/* ============================
   ✅ SAME AS Config.setLoggedInToken
============================ */
export const setLoggedInToken = (
  token: string,
  userInfo: any,
  sessionID: string,
) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(AUTH_TOKEN, token);
    sessionStorage.setItem(USER_INFO, JSON.stringify(userInfo));
    sessionStorage.setItem(AUTH_SESSION_ID, sessionID);
  }
};

export const setStoreInfo = (storeinfo: any) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("Storeinfo", JSON.stringify(storeinfo));
  }
};

/* ============================
   ✅ SAME AS Config.setSparkDialpadInfo
============================ */
export const setSparkDialpadInfo = (sparkinfo: any) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(
      SPARK_DIALPAD,
      JSON.stringify(sparkinfo), // ✅ FIX
    );
  }
};

/* ============================
   ✅ SAME AS Config.setLoggedinuserSession
============================ */
export const setLoggedinuserSession = (sessionlist: any) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(ACTIVE_SESSION, JSON.stringify(sessionlist));
  }
};
export const setReportInfo = (reportId: number) => {
  if (typeof window !== "undefined") {
    const value = { id: reportId }; // ✅ wrap in object
    sessionStorage.setItem(REPORT_INFO, JSON.stringify(value));
  }
};
export const setDrawerEnabledStatus = (bool: boolean): void => {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(DRAWER_ENABLED_STATUS, JSON.stringify(bool));
  }
};
/* ============================
   ✅ GETTERS (OPTIONAL)
============================ */
export const getAuthToken = () => sessionStorage.getItem(AUTH_TOKEN);

export const getSessionID = () => sessionStorage.getItem(AUTH_SESSION_ID);

export const getUserInfo = () => {
  const data = sessionStorage.getItem(USER_INFO);
  return data ? JSON.parse(data) : null;
};

export const clearSession = () => {
  sessionStorage.clear();
};
export const getReportInfo = (): { id: number } | null => {
  if (typeof window !== "undefined") {
    const data = sessionStorage.getItem(REPORT_INFO);
    return data ? JSON.parse(data) : null;
  }
  return null;
};
export const getDrawerEnabledStatus = (): boolean | null => {
  if (typeof window !== "undefined") {
    const value = window.sessionStorage.getItem(DRAWER_ENABLED_STATUS);
    return value !== null ? JSON.parse(value) : null;
  }
  return null;
};

export const getLoggedinuserSession = (): any => {
  if (typeof window !== "undefined") {
    const data = sessionStorage.getItem(ACTIVE_SESSION);
    return data ? JSON.parse(data) : null;
  }
  return null;
};
