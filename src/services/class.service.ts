import * as classRepository from "@/repository/class.repository.ts";
import { NotFoundError, ValidationError, ConflictError } from "@/utils/AppError.ts";
import { isDuplicateKeyError, isReferencedError } from "@/utils/dbErrors.ts";
import type { Class, ClassInput } from "@/types/class.ts";

function assertValidId(id: number): void {
    if (!Number.isInteger(id) || id < 1) {
        throw new ValidationError("Invalid class ID");
    }
}

function assertValidInput(input: unknown): asserts input is ClassInput {
    const data = input as Partial<ClassInput> | null | undefined;
    if (!data?.name || typeof data.name !== "string") {
        throw new ValidationError("name is required");
    }
}

async function onDuplicateNameConflict<T>(
    name: string,
    run: () => Promise<T>,
): Promise<T> {
    try {
        return await run();
    } catch (err) {
        if (isDuplicateKeyError(err)) {
            throw new ConflictError(`Class '${name}' already exists`);
        }
        throw err;
    }
}

export async function getClassById(id: number): Promise<Class> {
    assertValidId(id);

    const found = await classRepository.getClassById(id);
    if (!found) throw new NotFoundError("Class not found");

    return found;
}

export async function getAllClasses(): Promise<Class[]> {
    return classRepository.getAllClasses();
}

export async function createClass(input: unknown): Promise<Class> {
    assertValidInput(input);

    return onDuplicateNameConflict(input.name, () =>
        classRepository.createClass(input),
    );
}

export async function updateClass(id: number, input: unknown): Promise<Class> {
    assertValidId(id);
    assertValidInput(input);

    const updated = await onDuplicateNameConflict(input.name, () =>
        classRepository.updateClass(id, input),
    );

    if (!updated) throw new NotFoundError("Class not found");

    return updated;
}

export async function deleteClass(id: number): Promise<void> {
    assertValidId(id);

    try {
        const deleted = await classRepository.deleteClass(id);
        if (!deleted) throw new NotFoundError("Class not found");
    } catch (err) {
        if (isReferencedError(err)) {
            throw new ConflictError(
                "Class still has sessions or enrolments and cannot be deleted",
            );
        }
        throw err;
    }
}
