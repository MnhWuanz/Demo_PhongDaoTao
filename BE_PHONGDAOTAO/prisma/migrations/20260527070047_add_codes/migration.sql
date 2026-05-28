/*
  Warnings:

  - You are about to alter the column `end_date` on the `course` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `start_date` on the `course` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - Added the required column `courseCode` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentCode` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherCode` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `course` ADD COLUMN `courseCode` VARCHAR(10) NOT NULL,
    MODIFY `end_date` DATETIME NULL,
    MODIFY `start_date` DATETIME NULL;

-- AlterTable
ALTER TABLE `student` ADD COLUMN `studentCode` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `teacher` ADD COLUMN `teacherCode` VARCHAR(255) NOT NULL;
