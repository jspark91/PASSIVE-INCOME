/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS harness installs a require hook to test TypeScript without adding a runtime dependency. */
/* Dependency-free server regression harness. Uses TypeScript's existing compiler for source loading. */
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const Module = require("node:module");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const ts = require("typescript");
const project = path.resolve(__dirname, "..");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  return originalResolve.call(this, request.startsWith("@/") ? path.join(project, "src", request.slice(2)) : request, parent, ...rest);
};
require.extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
}).outputText, filename);

// Always run against isolated temporary data, with no real credentials or notifications.
for (const key of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"]) delete process.env[key];
process.env.ADMIN_ACCESS_TOKEN = "synthetic-booking-test-token";
const { bookingInquirySchema } = require("../src/lib/booking-inquiry-schema.ts");
const storage = require("../src/lib/booking-storage.ts");
const { MAX_BOOKING_BODY_BYTES, MAX_REFERENCE_BYTES, parseBookingInquiry } = require("../src/lib/booking-inquiry-upload.ts");
const { POST } = require("../src/app/api/booking-inquiries/route.ts");
const { GET: listLeads } = require("../src/app/api/admin/leads/route.ts");
const { PATCH: updateStatus } = require("../src/app/api/admin/leads/[id]/status/route.ts");
const { GET: download } = require("../src/app/api/admin/leads/[id]/attachments/[attachmentId]/route.ts");
const supabaseModule = require("../src/lib/supabase.ts");
const valid = {
  name: "Synthetic Test", email: "nobody@example.invalid", visitor_status: "planning_trip",
  travel_start: "2027-01-10", travel_end: "2027-01-20", preferred_date: "2027-01-15",
  style: "Not sure", placement: "Forearm", size_width_cm: "5", size_height_cm: "8",
  description: "Synthetic reference inquiry for automated verification only.",
  age_confirmation: "true", privacy_agreement: "true", utm_source: "test-campaign", website: ""
};
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==", "base64");
function formRequest(fields = valid, files = []) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) if (value !== undefined) form.set(key, String(value));
  for (const file of files) form.append("references", new Blob([file.bytes], { type: file.type || "image/png" }), file.name || "reference.png");
  return new Request("http://localhost/api/booking-inquiries", { method: "POST", body: form });
}
function adminRequest(method = "GET", body, useCookie = false) {
  return new Request("http://localhost/api/admin/leads", {
    method,
    headers: { ...(useCookie ? { cookie: `ethnic_house_admin=${process.env.ADMIN_ACCESS_TOKEN}` } : { "x-admin-token": process.env.ADMIN_ACCESS_TOKEN }), ...(body ? { "content-type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
}

test("booking inquiries validate, persist and protect private intake", async (t) => {
  const temporary = await fsp.mkdtemp(path.join(os.tmpdir(), "ethnic-booking-test-"));
  process.env.BOOKING_DATA_DIR = path.join(temporary, "bookings");
  const originalAdmin = supabaseModule.getAdminSupabase;
  try {
    await t.test("dates, required contact, dimensions, consent and honeypot are validated", () => {
      assert.equal(bookingInquirySchema.safeParse(valid).success, true);
      for (const override of [
        { email: "" }, { email: "invalid" }, { phone: "abc" }, { whatsapp: "+1" },
        { age_confirmation: "false" }, { privacy_agreement: undefined }, { website: "spam" },
        { travel_start: "2027-02-30" }, { travel_end: "2027-01-09" }, { travel_end: "" },
        { travel_start: "", travel_end: "" }, { preferred_date: "2027-01-25" },
        { size_width_cm: "0" }, { size_width_cm: "201" }, { size_height_cm: "" },
        { budget_krw: "-1" }, { budget_krw: "1.5" }, { reference_image_url: "javascript:alert(1)" },
        { description: "Too short" }
      ]) assert.equal(bookingInquirySchema.safeParse({ ...valid, ...override }).success, false, JSON.stringify(override));
      assert.equal(bookingInquirySchema.safeParse({ ...valid, visitor_status: "resident", travel_start: "", travel_end: "", preferred_date: "", size_unsure: "true", size_width_cm: "", size_height_cm: "" }).success, true);
      assert.equal(bookingInquirySchema.safeParse({ ...valid, dates_flexible: "true", travel_start: "", travel_end: "", preferred_date: "", phone: "+82 10 1234 5678" }).success, true);
    });

    await t.test("multipart images verify signature, size, count and the bounded stream", async () => {
      const parsed = await parseBookingInquiry(formRequest(valid, [{ bytes: png, name: "../../reference.png" }]));
      assert.equal(parsed.references[0].metadata.filename, "reference.png");
      assert.equal(parsed.references[0].metadata.contentType, "image/png");
      for (const files of [
        [{ bytes: Buffer.from("not an image") }],
        [{ bytes: png, type: "image/jpeg" }],
        [{ bytes: Buffer.alloc(MAX_REFERENCE_BYTES + 1) }],
        Array.from({ length: 4 }, () => ({ bytes: png }))
      ]) assert.equal((await POST(formRequest(valid, files))).status, 400);
      const declared = new Request("http://localhost/api/booking-inquiries", { method: "POST", headers: { "content-type": "multipart/form-data; boundary=oversized", "content-length": String(MAX_BOOKING_BODY_BYTES + 1) }, body: "x" });
      assert.equal((await POST(declared)).status, 413);
      let canceled = false;
      let produced = 0;
      const stream = new ReadableStream({
        pull(controller) { produced++; controller.enqueue(new Uint8Array(1024 * 1024)); },
        cancel() { canceled = true; }
      });
      const chunked = new Request("http://localhost/api/booking-inquiries", { method: "POST", headers: { "content-type": "multipart/form-data; boundary=oversized" }, body: stream, duplex: "half" });
      assert.equal((await POST(chunked)).status, 413);
      assert.equal(canceled, true);
      assert.ok(produced <= 11, "Body reading must stop at the cap.");
    });

    let leadId;
    let attachmentId;
    await t.test("successful submission persists full intake and private references", async () => {
      const response = await POST(formRequest({ ...valid, preferred_artist_id: "artist-sample", preferred_design_title: "Original design choice" }, [{ bytes: png }]));
      assert.equal(response.status, 201);
      const result = await response.json();
      assert.equal(result.ok, true);
      leadId = result.id;
      assert.equal(storage.isLocalBookingId(leadId), true);
      const record = await storage.readLocalBooking(leadId);
      assert.equal(record.request.utm_source, "test-campaign");
      const intake = storage.readBookingIntake(record.events);
      assert.equal(intake.fields.description, valid.description);
      assert.equal(intake.fields.age_confirmation, true);
      assert.equal(intake.fields.privacy_agreement, true);
      assert.equal(intake.artist_label, "artist-sample");
      assert.equal(intake.design_label, "Original design choice");
      attachmentId = intake.attachments[0].id;
      assert.deepEqual(await fsp.readFile(storage.attachmentPath(attachmentId)), png);
    });

    await t.test("admin header/cookie authorize downloads; unauthenticated, traversal and unrelated IDs are rejected", async () => {
      const params = { params: Promise.resolve({ id: leadId, attachmentId }) };
      assert.equal((await listLeads(new Request("http://localhost/api/admin/leads"))).status, 401);
      assert.equal((await download(new Request("http://localhost/private"), params)).status, 401);
      for (const useCookie of [false, true]) {
        const response = await download(adminRequest("GET", undefined, useCookie), params);
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("cache-control"), "private, no-store");
        assert.equal(response.headers.get("x-content-type-options"), "nosniff");
        assert.deepEqual(Buffer.from(await response.arrayBuffer()), png);
      }
      assert.equal((await download(adminRequest(), { params: Promise.resolve({ id: leadId, attachmentId: "../../secrets" }) })).status, 404);
      assert.equal((await download(adminRequest(), { params: Promise.resolve({ id: `local-${require("node:crypto").randomUUID()}`, attachmentId }) })).status, 404);
      assert.throws(() => storage.attachmentPath("../../secret"));
    });

    await t.test("concurrent requests and status updates preserve every record and the original snapshot", async () => {
      const submitted = await Promise.all(Array.from({ length: 24 }, async (_, index) => {
        const response = await POST(formRequest({ ...valid, name: `Concurrent Test ${index}` }));
        assert.equal(response.status, 201);
        return (await response.json()).id;
      }));
      assert.equal(new Set(submitted).size, 24);
      const before = await storage.readLocalBooking(leadId);
      const originalNote = before.events[0].note;
      await Promise.all(Array.from({ length: 8 }, (_, index) => storage.updateBooking(leadId, { status: "contacted", memo: `Staff note ${index}` }, "api")));
      const response = await updateStatus(adminRequest("PATCH", { status: "quote_sent", note: "Final staff note", quoted_price_krw: 250000 }), { params: Promise.resolve({ id: leadId }) });
      assert.equal(response.status, 200);
      const after = await storage.readLocalBooking(leadId);
      assert.equal(after.events.length, 10);
      assert.equal(after.events[0].note, originalNote);
      assert.equal(after.request.memo, "Final staff note");
      assert.equal(after.request.status, "quote_sent");
      const list = await (await listLeads(adminRequest())).json();
      assert.equal(list.leads.length, 25);
      assert.equal((await updateStatus(adminRequest("PATCH", { status: "booked", quoted_price_krw: -1 }), { params: Promise.resolve({ id: leadId }) })).status, 400);
    });

    await t.test("configured database errors never fall back or return a receipt and staged images are cleaned", async () => {
      const before = (await storage.listLocalBookings()).length;
      const beforeFiles = await fsp.readdir(path.join(process.env.BOOKING_DATA_DIR, "attachments"));
      supabaseModule.getAdminSupabase = () => ({ from: () => ({ insert: () => ({ select: () => ({ single: async () => ({ data: null, error: { message: "Synthetic DB failure" } }) }) }) }) });
      const response = await POST(formRequest(valid, [{ bytes: png }]));
      assert.equal(response.status, 503);
      assert.equal((await response.json()).ok, false);
      assert.equal((await storage.listLocalBookings()).length, before);
      assert.deepEqual(await fsp.readdir(path.join(process.env.BOOKING_DATA_DIR, "attachments")), beforeFiles);
      supabaseModule.getAdminSupabase = originalAdmin;
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://synthetic.invalid";
      assert.equal((await POST(formRequest())).status, 503);
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    });

    await t.test("database adapter writes booking plus immutable intake and normalizes sample foreign keys", async () => {
      const writes = [];
      const id = require("node:crypto").randomUUID();
      supabaseModule.getAdminSupabase = () => ({ from: (table) => ({ insert: (value) => {
        writes.push({ table, value });
        return table === "booking_requests" ? { select: () => ({ single: async () => ({ data: { id }, error: null }) }) } : Promise.resolve({ error: null });
      } }) });
      try {
        const response = await POST(formRequest({ ...valid, preferred_artist_id: "artist-sample", preferred_design_id: "design-sample", preferred_design_title: "Selected sample" }));
        assert.equal(response.status, 201);
        assert.equal((await response.json()).id, id);
        assert.deepEqual(writes.map((write) => write.table), ["booking_requests", "lead_events"]);
        assert.equal(writes[0].value.preferred_artist_id, null);
        assert.equal(writes[0].value.preferred_design_id, null);
        assert.equal(writes[0].value.utm_source, "test-campaign");
        const intake = storage.readBookingIntake([writes[1].value]);
        assert.equal(intake.fields.preferred_artist_id, "artist-sample");
        assert.equal(intake.fields.preferred_design_id, "design-sample");
        assert.equal(intake.design_label, "Selected sample");
        assert.equal(intake.fields.description, valid.description);
      } finally { supabaseModule.getAdminSupabase = originalAdmin; }
    });

    await t.test("unwritable local storage returns failure without a success receipt", async () => {
      const blocker = path.join(temporary, "not-a-directory");
      await fsp.writeFile(blocker, "Synthetic storage failure");
      const previous = process.env.BOOKING_DATA_DIR;
      process.env.BOOKING_DATA_DIR = blocker;
      try {
        const response = await POST(formRequest(valid, [{ bytes: png }]));
        assert.equal(response.status, 503);
        assert.equal((await response.json()).ok, false);
      } finally { process.env.BOOKING_DATA_DIR = previous; }
    });
  } finally {
    supabaseModule.getAdminSupabase = originalAdmin;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Verify the resolved recursive-delete target is the exact task-created OS temp directory.
    const expectedPrefix = path.resolve(os.tmpdir()) + path.sep + "ethnic-booking-test-";
    assert.ok(path.resolve(temporary).startsWith(expectedPrefix));
    await fsp.rm(temporary, { recursive: true, force: true });
  }
});
