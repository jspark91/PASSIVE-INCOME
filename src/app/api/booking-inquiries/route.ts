import { NextResponse } from "next/server";
import { InquiryRequestError, parseBookingInquiry } from "@/lib/booking-inquiry-upload";
import { insertBookingInquiry } from "@/lib/booking-service";
import { removeBookingAttachments, saveBookingAttachments, type BookingAttachment } from "@/lib/booking-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let attachments: BookingAttachment[] = [];
  let persisted = false;
  try {
    const { input, references } = await parseBookingInquiry(request);
    attachments = references.map((reference) => reference.metadata);
    if (references.length) await saveBookingAttachments(references);
    const result = await insertBookingInquiry(input, attachments);
    persisted = true;
    return NextResponse.json(result, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (!persisted && attachments.length) {
      try { await removeBookingAttachments(attachments); } catch { console.error("Booking attachment cleanup needs review."); }
    }
    if (error instanceof InquiryRequestError) {
      return NextResponse.json({ ok: false, message: error.message, fieldErrors: error.fieldErrors }, { status: error.status });
    }
    console.error("Booking inquiry storage failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ ok: false, message: "Your inquiry could not be saved. Please try again or contact the studio. No appointment has been confirmed." }, { status: 503 });
  }
}
