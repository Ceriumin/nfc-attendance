import express from 'express';
import studentRouter from "@/routes/student.routes.ts";
import { notFound } from "@/middleware/notFound.ts";
import { errorHandler } from "@/middleware/errorHandler.ts";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/students', studentRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
