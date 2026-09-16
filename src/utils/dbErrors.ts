/**
 * Type guard for MySQL's "duplicate entry" error (violating a UNIQUE index,
 * e.g. a repeated student email). mysql2 surfaces this as `code: 'ER_DUP_ENTRY'`
 * / `errno: 1062`. The service catches it and translates it into a 409.
 */
export function isDuplicateKeyError(err: unknown): boolean {
    return hasCode(err, "ER_DUP_ENTRY");
}

/**
 * Insert/update referenced a row that doesn't exist (e.g. a session pointing at
 * a missing class_id). mysql2 surfaces this as `ER_NO_REFERENCED_ROW_2` / errno
 * 1452. The service translates it into a 400/404.
 */
export function isMissingReferenceError(err: unknown): boolean {
    return hasCode(err, "ER_NO_REFERENCED_ROW_2");
}

/**
 * Delete blocked because another row still references this one (e.g. deleting a
 * class that still has sessions). mysql2 surfaces this as `ER_ROW_IS_REFERENCED_2`
 * / errno 1451. The service translates it into a 409.
 */
export function isReferencedError(err: unknown): boolean {
    return hasCode(err, "ER_ROW_IS_REFERENCED_2");
}

function hasCode(err: unknown, code: string): boolean {
    return (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: string }).code === code
    );
}
