import express from 'express';
import authRouter from "@/routes/auth.routes.ts";
import meRouter from "@/routes/me.routes.ts";
import studentRouter from "@/routes/student.routes.ts";
import attendanceRouter from "@/routes/attendance.routes.ts";
import classRouter from "@/routes/class.routes.ts";
import sessionRouter from "@/routes/session.routes.ts";
import enrolmentRouter from "@/routes/enrolment.routes.ts";
import cardRouter from "@/routes/card.routes.ts";
import { requireAuth } from "@/middleware/auth.ts";
import { notFound } from "@/middleware/notFound.ts";
import { errorHandler } from "@/middleware/errorHandler.ts";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public: obtaining a token.
app.use('/api/auth', authRouter);

// Everything below requires a valid Bearer token.
app.use('/api/me', meRouter);
app.use('/api/students', requireAuth, studentRouter);
app.use('/api/attendance', requireAuth, attendanceRouter);
app.use('/api/classes', requireAuth, classRouter);
app.use('/api/sessions', requireAuth, sessionRouter);
app.use('/api/enrolments', requireAuth, enrolmentRouter);
app.use('/api/cards', requireAuth, cardRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
