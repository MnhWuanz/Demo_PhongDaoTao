/*
  Warnings:

  - You are about to drop the column `shiftId` on the `course` table. All the data in the column will be lost.
  - You are about to alter the column `end_date` on the `course` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `start_date` on the `course` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- DropForeignKey
ALTER TABLE `Course` DROP FOREIGN KEY `Course_shiftId_fkey`;

-- DropIndex
DROP INDEX `Course_shiftId_fkey` ON `Course`;

-- AlterTable
ALTER TABLE `Course` DROP COLUMN `shiftId`,
    ADD COLUMN `endShiftId` INTEGER NULL,
    ADD COLUMN `startShiftId` INTEGER NULL,
    MODIFY `end_date` DATETIME NULL,
    MODIFY `start_date` DATETIME NULL;

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_startShiftId_fkey` FOREIGN KEY (`startShiftId`) REFERENCES `Shift`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_endShiftId_fkey` FOREIGN KEY (`endShiftId`) REFERENCES `Shift`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
