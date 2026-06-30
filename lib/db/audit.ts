import { connectToDatabase } from "./index";
import { AuditLog } from "@/types/db";

export async function logAuditEvent(
  userId: string,
  action: string,
  details: string
): Promise<void> {
  try {
    const { db } = await connectToDatabase();
    const auditLogs = db.collection<AuditLog>("audit_logs");
    
    await auditLogs.insertOne({
      userId,
      action,
      details,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}
