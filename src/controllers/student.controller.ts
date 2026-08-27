import type { Request, Response, NextFunction } from "express";
import * as studentService from "@/services/student.service.ts";

export async function getAllStudents(_req: Request, res: Response, next: NextFunction) {
    try {
        const students = await studentService.getAllStudents();
        return res.status(200).json(students);
    } catch (error) {
        next(error);
    }
}

export async function getStudentById(req: Request, res: Response, next: NextFunction) {
    try {
        const student = await studentService.getStudentById(Number(req.params.id));
        return res.status(200).json(student);
    } catch (error) {
        next(error);
    }
}

export async function createStudent(req: Request, res: Response, next: NextFunction) {
    try {
        const student = await studentService.createStudent(req.body);
        return res.status(201).json(student);
    } catch (error) {
        next(error);
    }
}

export async function updateStudent(req: Request, res: Response, next: NextFunction) {
    try {
        const student = await studentService.updateStudent(Number(req.params.id), req.body);
        return res.status(200).json(student);
    } catch (error) {
        next(error);
    }
}

export async function deleteStudent(req: Request, res: Response, next: NextFunction) {
    try {
        await studentService.deleteStudent(Number(req.params.id));
        return res.status(204).send();
    } catch (error) {
        next(error);
    }
}
