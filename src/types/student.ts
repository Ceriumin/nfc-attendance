export interface Student {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    course: string;
    created_at: Date;
    updated_at: Date;
}

export interface StudentInput {
    firstName: string;
    lastName: string;
    email: string;
    course: string;
}
