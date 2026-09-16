import * as studentController from '@/controllers/student.controller.ts';
import { requireRole } from '@/middleware/auth.ts';
import { requireOwnStudentParam } from '@/middleware/ownership.ts';
import { Router } from 'express';

const studentRouter = Router();

/* ————————— Read ————————— */

// Listing every student is staff-only; students can't enumerate the roster.
studentRouter.get('/', requireRole('teacher', 'admin'), studentController.getAllStudents);

// A student may fetch only their own record; teachers/admins may fetch any.
studentRouter.get('/:id', requireOwnStudentParam('id'), studentController.getStudentById);

/* ————————— Administrative Endpoints ————————— */

studentRouter.post('/', requireRole('admin'), studentController.createStudent);

studentRouter.put('/:id', requireRole('admin'), studentController.updateStudent);

studentRouter.delete('/:id', requireRole('admin'), studentController.deleteStudent);

export default studentRouter;
