import type { RowDataPacket } from "mysql2";

export interface Card {
    id: number;
    student_id: number;
    card_uid: string;
    created_at: Date;
}

export interface CardInput {
    studentId: number;
    cardUid: string;
}

/* ————————— Database Row Types ————————— */

export type CardRow = Card & RowDataPacket;
