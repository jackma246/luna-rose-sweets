import { prisma } from "@/lib/prisma";
import type { AdminActor } from "@/lib/adminAuth";

type AuditClient = Pick<typeof prisma, "adminAuditLog">;

export type AdminAuditInput = {
  actor: AdminActor;
  method: string;
  path: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  requestJson?: unknown;
  responseJson?: unknown;
  ok: boolean;
};

export async function logAdminWriteWithClient(client: AuditClient, input: AdminAuditInput) {
  if (input.actor.actorType !== "sunjae_agent") return;

  await client.adminAuditLog.create({
    data: {
      actorType: input.actor.actorType,
      actorId: input.actor.actorId,
      method: input.method,
      path: input.path,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      requestJson: input.requestJson as never,
      responseJson: input.responseJson as never,
      ok: input.ok,
    },
  });
}

export async function logAdminWrite(input: AdminAuditInput) {
  await logAdminWriteWithClient(prisma, input);
}
