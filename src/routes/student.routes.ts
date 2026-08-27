import * as studentController from '@/controllers/student.controller.ts';
import { Router } from 'express';

const studentRouter = Router();

studentRouter.get('/', studentController.getAllStudents);

studentRouter.get('/:id', studentController.getStudentById);

/* ————————— Administrative Endpoints ————————— */

studentRouter.post('/', studentController.createStudent);

studentRouter.put('/:id', studentController.updateStudent);

studentRouter.delete('/:id', studentController.deleteStudent);

export default studentRouter;