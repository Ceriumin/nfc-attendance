CREATE TABLE IF NOT EXISTS cards
(
    id         INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    card_uid   VARCHAR(64) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS classes
(
    id   INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS sessions
(
    id         INT PRIMARY KEY AUTO_INCREMENT,
    day        ENUM('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time   TIME NOT NULL,
    class_id   INT NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

CREATE TABLE IF NOT EXISTS enrolments
(
    id         INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_id   INT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    UNIQUE (student_id, class_id)
);

CREATE TABLE IF NOT EXISTS attendance
(
    id         INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    session_id INT NOT NULL,
    status     ENUM('present','late','absent') NOT NULL,
    timestamp  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    UNIQUE (student_id, session_id)
);
