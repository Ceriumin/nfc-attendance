import * as studentRepository from "@/repository/student.repository.ts";
import { NotFoundError, ValidationError, ConflictError } from "@/utils/AppError.ts";
import { isDuplicateKeyError } from "@/utils/dbErrors.ts";
import type { Student, StudentInput } from "@/types/student.ts";

function assertValidId(id: number): void {
    if (!Number.isInteger(id) || id < 1) {
        throw new ValidationError("Invalid student ID");
    }
}

function assertValidInput(input: unknown): asserts input is StudentInput {
    const data = input as Partial<StudentInput> | null | undefined;
    if (!data?.firstName || !data?.lastName || !data?.email || !data?.course) {
        throw new ValidationError(
            "firstName, lastName, email and course are all required",
        );
    }
}

async function onDuplicateEmailConflict<T>(
    email: string,
    run: () => Promise<T>,
): Promise<T> {
    try {
        return await run();
    } catch (err) {
        if (isDuplicateKeyError(err)) {
            throw new ConflictError(`Email '${email}' is already in use`);
        }
        throw err;
    }
}

export async function getStudentById(id: number): Promise<Student> {
    assertValidId(id);

    const student = await studentRepository.getStudentById(id);
    if (!student) throw new NotFoundError("Student not found");

    return student;
}

export async function getAllStudents(): Promise<Student[]> {
    return studentRepository.getAllStudents();
}

export async function createStudent(input: unknown): Promise<Student> {
    assertValidInput(input);

    return onDuplicateEmailConflict(input.email, () =>
        studentRepository.createStudent(input),
    );
}

export async function updateStudent(
    id: number,
    input: unknown,
): Promise<Student> {
    assertValidId(id);
    assertValidInput(input);

    const student = await onDuplicateEmailConflict(input.email, () =>
        studentRepository.updateStudent(id, input),
    );

    if (!student) throw new NotFoundError("Student not found");

    return student;
}

export async function deleteStudent(id: number): Promise<void> {
    assertValidId(id);

    const deleted = await studentRepository.deleteStudent(id);
    if (!deleted) throw new NotFoundError("Student not found");
}
