const USERINFO = "UserInfo";
const STORENAME = "Storeinfo";

export class Config {
  static UserInfo: string | null = null;
  static storeinfo: string | null = null;
  // @ts-expect-error - Reserved for future use
  private static SessionID: string | null = null;
  /* ============================
     ✅ getUserInfoToken (Angular → React)
  ============================ */
  static getUserInfoToken(): string | null {
    if (typeof window !== "undefined") {
      this.UserInfo = window.sessionStorage.getItem(USERINFO);
      return this.UserInfo;
    }
    return null;
  }

  /* ============================
     ✅ getStoreInfo (Angular → React)
  ============================ */
  static getStoreInfo(): string | null {
    if (typeof window !== "undefined") {
      this.storeinfo = window.sessionStorage.getItem(STORENAME);
      return this.storeinfo;
    }
    return null;
  }

  /* ============================
     ✅ Optional helpers (recommended)
  ============================ */
  static setUserInfoToken(data: any) {
    window.sessionStorage.setItem(USERINFO, JSON.stringify(data));
  }

  static setStoreInfo(data: any) {
    window.sessionStorage.setItem(STORENAME, JSON.stringify(data));
  }

  static clearAll() {
    window.sessionStorage.clear();
  }
  static getAuthSessionID(): string {
    if (typeof window !== "undefined") {
      const sessionId = window.sessionStorage.getItem("AuthSessionID");
      this.SessionID = sessionId;
      return sessionId ?? "";
    }

    return "";
  }
}
