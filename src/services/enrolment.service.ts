import * as enrolmentRepository from "@/repository/enrolment.repository.ts";
import { NotFoundError, ValidationError, ConflictError } from "@/utils/AppError.ts";
import { isDuplicateKeyError, isMissingReferenceError } from "@/utils/dbErrors.ts";
import type { Enrolment, EnrolmentInput } from "@/types/enrolment.ts";

function assertValidId(id: number): void {
    if (!Number.isInteger(id) || id < 1) {
        throw new ValidationError("Invalid enrolment ID");
    }
}

function assertValidInput(input: unknown): asserts input is EnrolmentInput {
    const data = input as Partial<EnrolmentInput> | null | undefined;
    if (
        !Number.isInteger(data?.studentId) ||
        !Number.isInteger(data?.classId)
    ) {
        throw new ValidationError("studentId and classId are required");
    }
}

export async function getEnrolmentById(id: number): Promise<Enrolment> {
    assertValidId(id);

    const found = await enrolmentRepository.getEnrolmentById(id);
    if (!found) throw new NotFoundError("Enrolment not found");

    return found;
}

export async function getEnrolments(query: Record<string, unknown>): Promise<Enrolment[]> {
    if (query.studentId !== undefined) {
        const studentId = Number(query.studentId);
        if (!Number.isInteger(studentId) || studentId < 1) {
            throw new ValidationError("Invalid studentId");
        }
        return enrolmentRepository.getEnrolmentsByStudent(studentId);
    }

    if (query.classId !== undefined) {
        const classId = Number(query.classId);
        if (!Number.isInteger(classId) || classId < 1) {
            throw new ValidationError("Invalid classId");
        }
        return enrolmentRepository.getEnrolmentsByClass(classId);
    }

    return enrolmentRepository.getAllEnrolments();
}

export async function createEnrolment(input: unknown): Promise<Enrolment> {
    assertValidInput(input);

    try {
        return await enrolmentRepository.createEnrolment(input);
    } catch (err) {
        if (isDuplicateKeyError(err)) {
            throw new ConflictError("Student is already enrolled in this class");
        }
        if (isMissingReferenceError(err)) {
            throw new ValidationError("The referenced student or class does not exist");
        }
        throw err;
    }
}

export async function deleteEnrolment(id: number): Promise<void> {
    assertValidId(id);

    const deleted = await enrolmentRepository.deleteEnrolment(id);
    if (!deleted) throw new NotFoundError("Enrolment not found");
}
