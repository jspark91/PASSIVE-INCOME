import { randomUUID } from "node:crypto";
import { bookingInquirySchema } from "@/lib/booking-inquiry-schema";
import type { BookingAttachment } from "@/lib/booking-storage";

export const MAX_BOOKING_BODY_BYTES = 8 * 1024 * 1024;
export const MAX_REFERENCE_BYTES = 2 * 1024 * 1024;
export class InquiryRequestError extends Error {
  constructor(message: string, public status = 400, public fieldErrors?: Record<string, string[]>) { super(message); }
}
export function identifyReferenceImage(bytes: Buffer): BookingAttachment["contentType"] | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}
async function boundedFormData(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data;")) {
    throw new InquiryRequestError("Please submit the inquiry as a form.", 415);
  }
  const contentLength = request.headers.get("content-length");
  if (contentLength && (!/^\d+$/.test(contentLength) || Number(contentLength) > MAX_BOOKING_BODY_BYTES)) {
    throw new InquiryRequestError("The inquiry is too large. Upload up to 3 images, 2 MB each.", 413);
  }
  if (!request.body) throw new InquiryRequestError("The form is empty.");
  const reader = request.body.getReader();
  const chunks: Buffer[] = [];
  let length = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      length += chunk.value.byteLength;
      if (length > MAX_BOOKING_BODY_BYTES) {
        await reader.cancel();
        throw new InquiryRequestError("The inquiry is too large. Upload up to 3 images, 2 MB each.", 413);
      }
      chunks.push(Buffer.from(chunk.value));
    }
    // Bound the stream before the multipart parser buffers its contents.
    return await new Request(request.url, { method: "POST", headers: request.headers, body: Buffer.concat(chunks) }).formData();
  } catch (error) {
    if (error instanceof InquiryRequestError) throw error;
    throw new InquiryRequestError("The form could not be read. Please try again.");
  } finally { reader.releaseLock(); }
}
export async function parseBookingInquiry(request: Request) {
  const form = await boundedFormData(request);
  const raw: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (key === "references") continue;
    if (typeof value !== "string" || Object.prototype.hasOwnProperty.call(raw, key)) {
      throw new InquiryRequestError("Please check the form fields.");
    }
    raw[key] = value;
  }
  const parsed = bookingInquirySchema.safeParse(raw);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    throw new InquiryRequestError(parsed.error.issues[0]?.message || "Please check the form.", 400, fields);
  }
  const files = form.getAll("references").filter((value) => !(typeof value !== "string" && !value.name && !value.size));
  if (files.length > 3) throw new InquiryRequestError("Please upload no more than 3 reference images.", 400, { references: ["Choose up to 3 images."] });
  const references: { bytes: Buffer; metadata: BookingAttachment }[] = [];
  for (const file of files) {
    if (typeof file === "string" || !file.size || file.size > MAX_REFERENCE_BYTES) {
      throw new InquiryRequestError("Each reference image must be no larger than 2 MB.", 400, { references: ["Choose JPEG, PNG or WebP images, up to 2 MB each."] });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const contentType = identifyReferenceImage(bytes);
    if (!contentType || file.type !== contentType) {
      throw new InquiryRequestError("Please upload valid JPEG, PNG or WebP images.", 400, { references: ["The image format could not be verified."] });
    }
    references.push({ bytes, metadata: {
      id: randomUUID(),
      filename: file.name.replace(/\\/g, "/").split("/").pop()!.replace(/[\x00-\x1f\x7f]/g, "").slice(0, 160) || "reference-image",
      contentType,
      size: bytes.length
    } });
  }
  return { input: parsed.data, references };
}
