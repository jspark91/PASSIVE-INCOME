import { NextResponse } from "next/server";
import { z } from "zod";
import { bookingPayloadSchema } from "@/lib/booking-schema";
import { insertBookingRequest } from "@/lib/booking-service";

const apiBookingSchema = bookingPayloadSchema.extend({
  privacy_agreement: z.literal(true)
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = apiBookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid booking request." },
      { status: 400 }
    );
  }

  const payload = bookingPayloadSchema.parse(parsed.data);
  const result = await insertBookingRequest(payload);

  if (!result.ok) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result, { status: 201 });
}
