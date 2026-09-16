import * as userRepository from "@/repository/user.repository.ts";
import { hashPassword, verifyPassword } from "@/utils/password.ts";
import { signToken } from "@/utils/jwt.ts";
import { UnauthorizedError, ValidationError, ConflictError } from "@/utils/AppError.ts";
import { isDuplicateKeyError } from "@/utils/dbErrors.ts";
import type { JwtPayload, UserRole } from "@/types/jwt.ts";
import type { SafeUser, User, UserInput } from "@/types/user.ts";

const ROLES: readonly UserRole[] = ["student", "teacher", "admin"];

interface Credentials {
    email: string;
    password: string;
}

function assertValidCredentials(input: unknown): asserts input is Credentials {
    const data = input as Partial<Credentials> | null | undefined;
    if (!data?.email || !data?.password) {
        throw new ValidationError("email and password are required");
    }
}

function assertValidRegistration(input: unknown): asserts input is UserInput {
    const data = input as Partial<UserInput> | null | undefined;
    if (!data?.email || !data?.password || !data?.role) {
        throw new ValidationError("email, password and role are required");
    }
    if (!ROLES.includes(data.role)) {
        throw new ValidationError(`role must be one of: ${ROLES.join(", ")}`);
    }
}

function toSafeUser(user: User): SafeUser {
    const { password_hash, ...safe } = user;
    return safe;
}

function toPayload(user: User): JwtPayload {
    return {
        id: user.id,
        role: user.role,
        email: user.email,
        ...(user.student_id !== null ? { studentId: user.student_id } : {}),
    };
}

export async function login(
    input: unknown,
): Promise<{ token: string; user: SafeUser }> {
    assertValidCredentials(input);

    const user = await userRepository.getUserByEmail(input.email);

    if (!user || !(await verifyPassword(input.password, user.password_hash))) {
        throw new UnauthorizedError("Invalid email or password");
    }

    return { token: signToken(toPayload(user)), user: toSafeUser(user) };
}

export async function register(input: unknown): Promise<SafeUser> {
    assertValidRegistration(input);

    const passwordHash = await hashPassword(input.password);

    try {
        const user = await userRepository.createUser({
            email: input.email,
            passwordHash,
            role: input.role,
            ...(input.studentId !== undefined ? { studentId: input.studentId } : {}),
        });
        return toSafeUser(user);
    } catch (err) {
        if (isDuplicateKeyError(err)) {
            throw new ConflictError(`Email '${input.email}' is already in use`);
        }
        throw err;
    }
}
