import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { bindings } from "../bindings.server";

/* Quote requests are written to this site's own D1 database. Nothing about
   this touches a third party, and the table is created on first use so a
   fresh deploy cannot drop a customer's message on the floor. */

export const SERVICE_OPTIONS = [
  "Starlink sales or install",
  "Whole home WiFi",
  "Whole home sound",
  "TV mounting",
  "Camera system",
  "Wireless alarm",
  "WiFi past the house",
  "New construction prewire",
  "Something else",
] as const;

const QuoteInput = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().max(160).optional().or(z.literal("")),
  town: z.string().trim().max(120).optional().or(z.literal("")),
  service: z.string().trim().min(2).max(80),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

const CREATE = `CREATE TABLE IF NOT EXISTS quote_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  town TEXT,
  service TEXT NOT NULL,
  message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`;

export const submitQuote = createServerFn({ method: "POST" })
  .inputValidator(QuoteInput)
  .handler(async ({ data }) => {
    const { DB } = bindings();
    if (!DB) {
      return {
        ok: false as const,
        reason: "storage" as const,
      };
    }
    await DB.prepare(CREATE).run();
    await DB.prepare(
      `INSERT INTO quote_requests (name, phone, email, town, service, message)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
    )
      .bind(
        data.name,
        data.phone,
        data.email || null,
        data.town || null,
        data.service,
        data.message || null,
      )
      .run();
    return { ok: true as const };
  });
