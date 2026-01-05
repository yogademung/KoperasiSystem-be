-- DropForeignKey
ALTER TABLE `s_user_lpd` DROP FOREIGN KEY `s_user_lpd_ROLE_LPD_ID_fkey`;

-- AlterTable
ALTER TABLE `s_user_lpd` MODIFY `ROLE_LPD_ID` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `s_user_lpd` ADD CONSTRAINT `s_user_lpd_ROLE_LPD_ID_fkey` FOREIGN KEY (`ROLE_LPD_ID`) REFERENCES `s_role_lpd`(`ROLE_LPD_ID`) ON DELETE SET NULL ON UPDATE CASCADE;
