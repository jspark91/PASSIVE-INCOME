import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const base = new URL(process.env.BOOKING_SMOKE_BASE_URL || "http://127.0.0.1:3101");
assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(base.hostname), "Run against an isolated local server only.");
const token = process.env.BOOKING_SMOKE_ADMIN_TOKEN;
assert.ok(token, "Set BOOKING_SMOKE_ADMIN_TOKEN to the local test server's admin token.");
const dataDir = path.resolve(process.env.BOOKING_SMOKE_DATA_DIR || ".data/qa-inquiries");
const privateTestRoot = path.resolve(".data") + path.sep;
assert.ok(dataDir.startsWith(privateTestRoot), "Use a test directory inside the checkout's ignored .data directory.");
const auth = { "x-admin-token": token };
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=", "base64");
let checks = 0;
const check = (name) => { checks += 1; console.log(`PASS ${name}`); };

function form(overrides = {}) {
  const values = {
    name: "Local QA Visitor", email: "inquiry-qa@example.invalid", phone: "+61 400 000 000",
    visitor_status: "planning_trip", travel_start: "2099-04-10", travel_end: "2099-04-20",
    preferred_date: "2099-04-15", preferred_time: "Afternoon, Korea time",
    style: "Fine-line", placement: "Left upper arm", size_width_cm: "5", size_height_cm: "8",
    budget_krw: "250000", preferred_artist_id: "artist-yoonseul",
    description: "A small botanical design for a future Seoul trip.",
    age_confirmation: "true", privacy_agreement: "true", source: "local_qa",
    utm_source: "google", utm_medium: "cpc", utm_campaign: "inquiry_local_test", website: "",
    ...overrides
  };
  const result = new FormData();
  for (const [key, value] of Object.entries(values)) if (value !== undefined) result.set(key, value);
  return result;
}
const submit = (body) => fetch(new URL("/api/booking-inquiries", base), { method: "POST", body });
const list = async () => {
  const response = await fetch(new URL("/api/admin/leads", base), { headers: auth });
  assert.equal(response.status, 200);
  return (await response.json()).leads;
};

const health = await (await fetch(new URL("/api/health", base))).json();
assert.equal(health.supabaseConfigured, false, "Use a local server without a configured production database.");
const page = await (await fetch(new URL("/booking?artist=artist-yoonseul&style=Fine-line&utm_source=qa_source&utm_campaign=qa_prefill", base))).text();
for (const name of ["name", "email", "visitor_status", "travel_start", "travel_end", "placement", "size_width_cm", "size_height_cm", "style", "preferred_date", "description", "age_confirmation", "privacy_agreement"]) {
  assert.ok(page.includes(`name="${name}"`), `Missing rendered field ${name}`);
}
assert.ok(page.includes("Plan your tattoo before your Korea trip."));
assert.ok(page.includes('name="utm_campaign" value="qa_prefill"'));
assert.ok(page.includes('name="utm_source" value="qa_source"'));
assert.ok(page.includes('value="artist-yoonseul" selected=""'));
assert.ok(page.includes('accept="image/jpeg,image/png,image/webp"'));
check("rendered inquiry fields, artist choice and campaign prefill");
const before = await list();
const consent = await submit(form({ privacy_agreement: undefined }));
assert.equal(consent.status, 400); check("missing consent rejected");
const reversed = await submit(form({ travel_end: "2099-04-01" }));
assert.equal(reversed.status, 400); check("invalid travel range rejected");
const wrongImage = form(); wrongImage.append("references", new Blob(["<html>not an image</html>"], { type: "image/png" }), "fake.png");
assert.equal((await submit(wrongImage)).status, 400); check("disguised image rejected");
assert.equal((await list()).length, before.length); check("invalid submissions leave no records");

const valid = form(); valid.append("references", new Blob([png], { type: "image/png" }), "reference.png");
const response = await submit(valid);
const result = await response.json();
assert.equal(response.status, 201, JSON.stringify(result)); assert.equal(result.ok, true); assert.ok(result.id);
const record = JSON.parse(await readFile(path.join(dataDir, "requests", `${result.id}.json`), "utf8"));
assert.equal(record.request.email, "inquiry-qa@example.invalid");
assert.equal(record.request.utm_campaign, "inquiry_local_test");
const intake = JSON.parse(record.events.find((event) => event.event_type === "booking_created").note);
assert.equal(intake.fields.phone, "+61 400 000 000"); assert.equal(intake.fields.description, "A small botanical design for a future Seoul trip.");
assert.equal(intake.attachments.length, 1); check("inquiry, attribution and original intake persisted");
const attachmentUrl = new URL(`/api/admin/leads/${result.id}/attachments/${intake.attachments[0].id}`, base);
assert.equal((await fetch(attachmentUrl)).status, 401); check("private image requires admin authentication");
const attachment = await fetch(attachmentUrl, { headers: auth });
assert.equal(attachment.status, 200); assert.equal(attachment.headers.get("x-content-type-options"), "nosniff");
assert.deepEqual(Buffer.from(await attachment.arrayBuffer()), png); check("authenticated private image download matches upload");
const cookie = { Cookie: `ethnic_house_admin=${encodeURIComponent(token)}` };
const detailUrl = new URL(`/admin/leads/${result.id}`, base);
const detail = await (await fetch(detailUrl, { headers: cookie })).text();
assert.ok(detail.includes("Local QA Visitor")); assert.ok(detail.includes("reference.png")); check("admin detail renders original inquiry and attachment");
const updated = await fetch(new URL(`/api/admin/leads/${result.id}/status`, base), {
  method: "PATCH", headers: { ...auth, "Content-Type": "application/json" },
  body: JSON.stringify({ status: "contacted", note: "Reviewed local test inquiry." })
});
assert.equal(updated.status, 200);
const afterUpdate = JSON.parse(await readFile(path.join(dataDir, "requests", `${result.id}.json`), "utf8"));
assert.equal(afterUpdate.request.status, "contacted");
assert.deepEqual(afterUpdate.events[0], record.events[0]); check("admin status update preserves original intake");
const parallel = await Promise.all(Array.from({ length: 3 }, (_, index) => submit(form({ name: `Local Parallel Visitor ${index}` }))));
assert.ok(parallel.every((item) => item.status === 201));
const ids = await Promise.all(parallel.map(async (item) => (await item.json()).id));
assert.equal(new Set(ids).size, 3);
assert.equal((await list()).length, before.length + 4); check("parallel submissions are retained without lost writes");
console.log(`Completed ${checks} local HTTP checks. Synthetic records remain in ${dataDir}.`);
