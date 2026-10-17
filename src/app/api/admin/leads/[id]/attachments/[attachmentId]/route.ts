import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-request";
import { getLeadEvents } from "@/lib/data";
import { attachmentPath, isLocalBookingId, isUuid, readBookingIntake } from "@/lib/booking-storage";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string; attachmentId: string }> }) {
  if (!isAuthorizedAdminRequest(request)) return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  const { id, attachmentId } = await params;
  if ((!isLocalBookingId(id) && !isUuid(id)) || !isUuid(attachmentId)) {
    return NextResponse.json({ ok: false, message: "Attachment not found." }, { status: 404 });
  }
  try {
    const intake = readBookingIntake(await getLeadEvents(id));
    const attachment = intake?.attachments.find((candidate) => candidate.id === attachmentId);
    if (!attachment) return NextResponse.json({ ok: false, message: "Attachment not found." }, { status: 404 });
    const bytes = await readFile(attachmentPath(attachment.id));
    return new NextResponse(bytes, { headers: {
      "Content-Type": attachment.contentType,
      "Content-Length": String(bytes.length),
      "Content-Disposition": `attachment; filename="reference-image"; filename*=UTF-8''${encodeURIComponent(attachment.filename)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox"
    } });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return NextResponse.json({ ok: false, message: "Attachment not found." }, { status: 404 });
    return NextResponse.json({ ok: false, message: "Could not read attachment." }, { status: 503 });
  }
}
