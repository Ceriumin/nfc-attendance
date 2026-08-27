/**
 * Type guard for MySQL's "duplicate entry" error (violating a UNIQUE index,
 * e.g. a repeated student email). mysql2 surfaces this as `code: 'ER_DUP_ENTRY'`
 * / `errno: 1062`. The service catches it and translates it into a 409.
 */
export function isDuplicateKeyError(err: unknown): boolean {
    return (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: string }).code === "ER_DUP_ENTRY"
    );
}
