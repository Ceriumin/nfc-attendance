import authRouter from "./auth.routes.ts";
import meRouter from "./me.routes.ts";
import studentRouter from "./student.routes.ts";
import attendanceRouter from "./attendance.routes.ts";
import classRouter from "./class.routes.ts";
import sessionRouter from "./session.routes.ts";
import enrolmentRouter from "./enrolment.routes.ts";
import cardRouter from "./card.routes.ts";

export default [
    authRouter,
    meRouter,
    studentRouter,
    attendanceRouter,
    classRouter,
    sessionRouter,
    enrolmentRouter,
    cardRouter,
];
