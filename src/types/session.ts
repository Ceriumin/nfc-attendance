import type { RowDataPacket } from "mysql2";

export type Weekday =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

export interface Session {
    id: number;
    day: Weekday;
    start_time: string; // "HH:MM:SS"
    end_time: string; // "HH:MM:SS"
    class_id: number;
}

export interface SessionInput {
    day: Weekday;
    startTime: string;
    endTime: string;
    classId: number;
}

/* ————————— Database Row Types ————————— */

export type SessionRow = Session & RowDataPacket;
