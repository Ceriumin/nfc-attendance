import { db } from "@/database/connection.ts";
import type { ResultSetHeader } from "mysql2";
import type { Card, CardInput, CardRow } from "@/types/card.ts";

export async function getCardById(id: number): Promise<Card | null> {
    const [rows] = await db.query<CardRow[]>(
        `SELECT * FROM cards WHERE id = ?`,
        [id],
    );
    return rows[0] ?? null;
}

export async function getCardByUid(cardUid: string): Promise<Card | null> {
    const [rows] = await db.query<CardRow[]>(
        `SELECT * FROM cards WHERE card_uid = ?`,
        [cardUid],
    );
    return rows[0] ?? null;
}

export async function getAllCards(): Promise<Card[]> {
    const [rows] = await db.query<CardRow[]>(`SELECT * FROM cards`);
    return rows;
}

export async function getCardsByStudent(studentId: number): Promise<Card[]> {
    const [rows] = await db.query<CardRow[]>(
        `SELECT * FROM cards WHERE student_id = ?`,
        [studentId],
    );
    return rows;
}

export async function createCard(data: CardInput): Promise<Card> {
    const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO cards (student_id, card_uid) VALUES (?, ?)`,
        [data.studentId, data.cardUid],
    );

    // The row was just inserted, so it always exists.
    return (await getCardById(result.insertId))!;
}

export async function deleteCard(id: number): Promise<boolean> {
    const [result] = await db.query<ResultSetHeader>(
        `DELETE FROM cards WHERE id = ?`,
        [id],
    );
    return result.affectedRows > 0;
}
