/*
  Warnings:

  - You are about to drop the `course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `enrollment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `room` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shift` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `study` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teacher` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Course` DROP FOREIGN KEY `Course_endShiftId_fkey`;

-- DropForeignKey
ALTER TABLE `Course` DROP FOREIGN KEY `Course_roomId_fkey`;

-- DropForeignKey
ALTER TABLE `Course` DROP FOREIGN KEY `Course_startShiftId_fkey`;

-- DropForeignKey
ALTER TABLE `Course` DROP FOREIGN KEY `Course_teacherId_fkey`;

-- DropForeignKey
ALTER TABLE `Enrollment` DROP FOREIGN KEY `Enrollment_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `Enrollment` DROP FOREIGN KEY `Enrollment_studentId_fkey`;

-- DropTable
DROP TABLE `Course`;

-- DropTable
DROP TABLE `Enrollment`;

-- DropTable
DROP TABLE `Room`;

-- DropTable
DROP TABLE `Shift`;

-- DropTable
DROP TABLE `Student`;

-- DropTable
DROP TABLE `Study`;

-- DropTable
DROP TABLE `Teacher`;

-- CreateTable
CREATE TABLE `EDU_STUDENTS` (
    `id_student` INTEGER NOT NULL AUTO_INCREMENT,
    `student_code` VARCHAR(100) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `class` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `is_face_registered` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `EDU_STUDENTS_student_code_key`(`student_code`),
    PRIMARY KEY (`id_student`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EDU_TEACHERS` (
    `id_teacher` INTEGER NOT NULL AUTO_INCREMENT,
    `teacher_code` VARCHAR(100) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL DEFAULT '',
    `id_user` INTEGER NULL,

    UNIQUE INDEX `EDU_TEACHERS_teacher_code_key`(`teacher_code`),
    UNIQUE INDEX `EDU_TEACHERS_id_user_key`(`id_user`),
    PRIMARY KEY (`id_teacher`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EDU_SHIFTS` (
    `id_shift` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `start_time` VARCHAR(10) NOT NULL,
    `end_time` VARCHAR(10) NOT NULL,

    UNIQUE INDEX `EDU_SHIFTS_name_key`(`name`),
    PRIMARY KEY (`id_shift`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EDU_ROOMS` (
    `id_room` INTEGER NOT NULL AUTO_INCREMENT,
    `room_code` VARCHAR(100) NOT NULL,
    `capacity` INTEGER NOT NULL,

    UNIQUE INDEX `EDU_ROOMS_room_code_key`(`room_code`),
    PRIMARY KEY (`id_room`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EDU_SUBJECTS` (
    `id_subject` INTEGER NOT NULL AUTO_INCREMENT,
    `subject_code` VARCHAR(30) NOT NULL,
    `name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `EDU_SUBJECTS_subject_code_key`(`subject_code`),
    PRIMARY KEY (`id_subject`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EDU_COURSE_CLASSES` (
    `id_course_class` INTEGER NOT NULL AUTO_INCREMENT,
    `course_code` VARCHAR(100) NOT NULL,
    `id_subject` INTEGER NOT NULL,
    `id_teacher` INTEGER NOT NULL,

    UNIQUE INDEX `EDU_COURSE_CLASSES_course_code_key`(`course_code`),
    PRIMARY KEY (`id_course_class`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EDU_COURSE_SCHEDULE` (
    `id_course_schedule` INTEGER NOT NULL AUTO_INCREMENT,
    `id_course_class` INTEGER NOT NULL,
    `id_room` INTEGER NOT NULL,
    `id_startShift` INTEGER NOT NULL,
    `id_endShift` INTEGER NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `dayOfWeek` INTEGER NOT NULL,

    PRIMARY KEY (`id_course_schedule`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EDU_ENROLLMENT` (
    `id_enrollment` INTEGER NOT NULL AUTO_INCREMENT,
    `id_student` INTEGER NOT NULL,
    `id_course_class` INTEGER NOT NULL,

    UNIQUE INDEX `EDU_ENROLLMENT_id_student_id_course_class_key`(`id_student`, `id_course_class`),
    PRIMARY KEY (`id_enrollment`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EDU_COURSE_CLASSES` ADD CONSTRAINT `EDU_COURSE_CLASSES_id_subject_fkey` FOREIGN KEY (`id_subject`) REFERENCES `EDU_SUBJECTS`(`id_subject`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EDU_COURSE_CLASSES` ADD CONSTRAINT `EDU_COURSE_CLASSES_id_teacher_fkey` FOREIGN KEY (`id_teacher`) REFERENCES `EDU_TEACHERS`(`id_teacher`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EDU_COURSE_SCHEDULE` ADD CONSTRAINT `EDU_COURSE_SCHEDULE_id_course_class_fkey` FOREIGN KEY (`id_course_class`) REFERENCES `EDU_COURSE_CLASSES`(`id_course_class`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EDU_COURSE_SCHEDULE` ADD CONSTRAINT `EDU_COURSE_SCHEDULE_id_room_fkey` FOREIGN KEY (`id_room`) REFERENCES `EDU_ROOMS`(`id_room`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EDU_COURSE_SCHEDULE` ADD CONSTRAINT `EDU_COURSE_SCHEDULE_id_startShift_fkey` FOREIGN KEY (`id_startShift`) REFERENCES `EDU_SHIFTS`(`id_shift`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EDU_COURSE_SCHEDULE` ADD CONSTRAINT `EDU_COURSE_SCHEDULE_id_endShift_fkey` FOREIGN KEY (`id_endShift`) REFERENCES `EDU_SHIFTS`(`id_shift`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EDU_ENROLLMENT` ADD CONSTRAINT `EDU_ENROLLMENT_id_student_fkey` FOREIGN KEY (`id_student`) REFERENCES `EDU_STUDENTS`(`id_student`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EDU_ENROLLMENT` ADD CONSTRAINT `EDU_ENROLLMENT_id_course_class_fkey` FOREIGN KEY (`id_course_class`) REFERENCES `EDU_COURSE_CLASSES`(`id_course_class`) ON DELETE CASCADE ON UPDATE CASCADE;
