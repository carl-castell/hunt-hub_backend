import "express-session";

declare module "express-session" {
  interface SessionData {
    user?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      role: "admin" | "manager" | "staff";
      estateId: number | null;
    };
  }
}
