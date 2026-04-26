import type { Artist, BookingRequest, FlashDesign, LeadEvent } from "./domain";

export type Database = {
  public: {
    Tables: {
      artists: {
        Row: Artist;
        Insert: Omit<Artist, "id"> & { id?: string };
        Update: Partial<Artist>;
      };
      flash_designs: {
        Row: FlashDesign;
        Insert: Omit<FlashDesign, "id"> & { id?: string };
        Update: Partial<FlashDesign>;
      };
      booking_requests: {
        Row: BookingRequest;
        Insert: Omit<BookingRequest, "id" | "created_at" | "status"> & {
          id?: string;
          created_at?: string;
          status?: BookingRequest["status"];
        };
        Update: Partial<BookingRequest>;
      };
      lead_events: {
        Row: LeadEvent;
        Insert: Omit<LeadEvent, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<LeadEvent>;
      };
    };
  };
};

