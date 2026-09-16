import type { RowDataPacket } from "mysql2";

export interface Class {
    id: number;
    name: string;
}

export interface ClassInput {
    name: string;
}

/* ————————— Database Row Types ————————— */

export type ClassRow = Class & RowDataPacket;
