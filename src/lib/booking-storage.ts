import { randomUUID } from "node:crypto";
import { mkdir, open, readFile, readdir, rename, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { getAdminSupabase } from "@/lib/supabase";
import type { BookingRequest, LeadEvent, LeadStatus } from "@/types/domain";

export type BookingAttachment = {
  id: string;
  filename: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  size: number;
};
export type BookingIntake = {
  version: 1;
  submitted_at: string;
  fields: Record<string, string | number | boolean | undefined>;
  artist_label?: string;
  design_label?: string;
  attachments: BookingAttachment[];
};
type LocalBooking = { version: 1; request: BookingRequest; events: LeadEvent[] };
export type LeadUpdate = {
  status: LeadStatus;
  memo?: string | null;
  matched_artist_id?: string | null;
  quoted_price_krw?: number | null;
  lost_reason?: string | null;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function isUuid(value: string) { return uuidPattern.test(value); }
export function isLocalBookingId(value: string) { return value.startsWith("local-") && isUuid(value.slice(6)); }
export function getBookingDataDirectory() {
  return path.resolve(process.env.BOOKING_DATA_DIR || (process.env.CHAT_DATA_DIR
    ? path.join(process.env.CHAT_DATA_DIR, "bookings") : path.join(process.cwd(), ".data", "bookings")));
}
export function getBookingDatabase() {
  const database = getAdminSupabase();
  if (!database && (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    throw new Error("Booking database configuration is incomplete.");
  }
  return database;
}
function bookingPath(id: string) {
  if (!isLocalBookingId(id)) throw new Error("Invalid local booking ID.");
  return path.join(getBookingDataDirectory(), "requests", `${id}.json`);
}
async function atomicWrite(filename: string, value: unknown) {
  await mkdir(path.dirname(filename), { recursive: true, mode: 0o700 });
  const temporary = `${filename}.${randomUUID()}.tmp`;
  try {
    const handle = await open(temporary, "wx", 0o600);
    try { await handle.writeFile(JSON.stringify(value), "utf8"); await handle.sync(); } finally { await handle.close(); }
    await rename(temporary, filename);
  } finally {
    await unlink(temporary).catch((error: NodeJS.ErrnoException) => { if (error.code !== "ENOENT") throw error; });
  }
}
export function createdEvent(id: string, intake: BookingIntake): LeadEvent {
  return { id: randomUUID(), booking_request_id: id, event_type: "booking_created", note: JSON.stringify(intake), created_by: "public_form", created_at: intake.submitted_at };
}
export function readBookingIntake(events: LeadEvent[]): BookingIntake | null {
  const note = events.find((event) => event.event_type === "booking_created")?.note;
  if (!note) return null;
  try {
    const value = JSON.parse(note) as BookingIntake;
    return value.version === 1 && value.fields && Array.isArray(value.attachments) ? value : null;
  } catch { return null; }
}
export async function saveLocalBooking(request: Omit<BookingRequest, "id">, intake: BookingIntake) {
  const id = `local-${randomUUID()}`;
  const record: LocalBooking = { version: 1, request: { ...request, id }, events: [createdEvent(id, intake)] };
  await atomicWrite(bookingPath(id), record);
  return id;
}
export async function readLocalBooking(id: string): Promise<LocalBooking | null> {
  try { return JSON.parse(await readFile(bookingPath(id), "utf8")) as LocalBooking; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
}
export async function listLocalBookings(): Promise<BookingRequest[]> {
  let names: string[];
  try { names = await readdir(path.join(getBookingDataDirectory(), "requests")); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
  const records = await Promise.all(names.filter((name) => name.endsWith(".json") && isLocalBookingId(name.slice(0, -5))).map((name) => readLocalBooking(name.slice(0, -5))));
  return records.flatMap((record) => record ? [record.request] : []).sort((a, b) => b.created_at.localeCompare(a.created_at));
}
async function withLocalLock<T>(id: string, action: () => Promise<T>) {
  const filename = `${bookingPath(id)}.lock`;
  let handle;
  for (let attempt = 0; attempt < 200; attempt += 1) {
    try { handle = await open(filename, "wx", 0o600); break; }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      // A crashed process may leave a lock behind. Normal writes complete in milliseconds.
      const info = await stat(filename).catch(() => null);
      if (info && Date.now() - info.mtimeMs > 60000) await unlink(filename).catch(() => undefined);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }
  if (!handle) throw new Error("Booking is busy. Please retry.");
  try { return await action(); } finally { await handle.close(); await unlink(filename); }
}
export async function updateBooking(id: string, update: LeadUpdate, createdBy: "api" | "admin") {
  const event = {
    id: randomUUID(), booking_request_id: id, event_type: "status_changed",
    note: update.memo || `Status changed to ${update.status}`, created_by: createdBy, created_at: new Date().toISOString()
  };
  if (isLocalBookingId(id)) {
    return withLocalLock(id, async () => {
      const record = await readLocalBooking(id);
      if (!record) throw new Error("Booking request was not found.");
      record.request = { ...record.request, ...update };
      record.events.push(event);
      await atomicWrite(bookingPath(id), record);
    });
  }
  if (!isUuid(id)) throw new Error("Invalid booking ID.");
  const database = getBookingDatabase();
  if (!database) throw new Error("Booking request was not found.");
  const normalized = { ...update, ...(update.matched_artist_id !== undefined ? { matched_artist_id: update.matched_artist_id && isUuid(update.matched_artist_id) ? update.matched_artist_id : null } : {}) };
  const { data, error } = await database.from("booking_requests").update(normalized).eq("id", id).select("id").single();
  if (error || !data) throw new Error("Could not update booking request.");
  const { error: eventError } = await database.from("lead_events").insert(event);
  if (eventError) throw new Error("Booking status changed, but the timeline could not be saved. Please review the lead.");
}
export function attachmentPath(id: string) {
  if (!isUuid(id)) throw new Error("Invalid attachment ID.");
  return path.join(getBookingDataDirectory(), "attachments", id);
}
export async function saveBookingAttachments(files: { bytes: Buffer; metadata: BookingAttachment }[]) {
  const saved: string[] = [];
  try {
    await mkdir(path.join(getBookingDataDirectory(), "attachments"), { recursive: true, mode: 0o700 });
    for (const file of files) {
      const filename = attachmentPath(file.metadata.id);
      const handle = await open(filename, "wx", 0o600);
      saved.push(filename);
      try { await handle.writeFile(file.bytes); await handle.sync(); } finally { await handle.close(); }
    }
  } catch (error) {
    await Promise.all(saved.map((filename) => unlink(filename).catch(() => undefined)));
    throw error;
  }
}
export async function removeBookingAttachments(attachments: BookingAttachment[]) {
  await Promise.all(attachments.map((attachment) => unlink(attachmentPath(attachment.id)).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  })));
}
