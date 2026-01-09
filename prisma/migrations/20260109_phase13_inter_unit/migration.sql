-- Phase 13: Inter-Unit Transactions
-- Migration: Create inter_unit_transaction and inter_unit_elimination tables

-- Create InterUnitTransaction table
CREATE TABLE IF NOT EXISTS `inter_unit_transaction` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `transaction_date` DATETIME(3) NOT NULL,
  `source_unit_id` INTEGER NOT NULL,
  `dest_unit_id` INTEGER NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `description` VARCHAR(500) NULL,
  `transaction_type` ENUM('TRANSFER', 'SERVICE', 'ALLOCATION') NOT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'POSTED', 'ELIMINATED') NOT NULL DEFAULT 'PENDING',
  `reference_no` VARCHAR(50) NULL,
  `journal_id` INTEGER NULL,
  `elimination_journal_id` INTEGER NULL,
  `created_by` INTEGER NOT NULL,
  `approved_by` INTEGER NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  
  PRIMARY KEY (`id`),
  UNIQUE INDEX `inter_unit_transaction_reference_no_key`(`reference_no`),
  INDEX `inter_unit_transaction_transaction_date_idx`(`transaction_date`),
  INDEX `inter_unit_transaction_status_idx`(`status`),
  INDEX `inter_unit_transaction_source_unit_id_idx`(`source_unit_id`),
  INDEX `inter_unit_transaction_dest_unit_id_idx`(`dest_unit_id`),
  INDEX `inter_unit_transaction_created_by_idx`(`created_by`),
  INDEX `inter_unit_transaction_approved_by_idx`(`approved_by`),
  
  CONSTRAINT `inter_unit_transaction_created_by_fkey` 
    FOREIGN KEY (`created_by`) REFERENCES `s_user_lpd`(`USER_ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `inter_unit_transaction_approved_by_fkey` 
    FOREIGN KEY (`approved_by`) REFERENCES `s_user_lpd`(`USER_ID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create InterUnitElimination table
CREATE TABLE IF NOT EXISTS `inter_unit_elimination` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `period_year` INTEGER NOT NULL,
  `period_month` INTEGER NOT NULL,
  `total_eliminated` DECIMAL(15, 2) NOT NULL,
  `journal_id` INTEGER NULL,
  `processed_date` DATETIME(3) NULL,
  `processed_by` INTEGER NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE INDEX `inter_unit_elimination_period_year_period_month_key`(`period_year`, `period_month`),
  INDEX `inter_unit_elimination_journal_id_idx`(`journal_id`),
  INDEX `inter_unit_elimination_processed_by_idx`(`processed_by`),
  
  CONSTRAINT `inter_unit_elimination_processed_by_fkey` 
    FOREIGN KEY (`processed_by`) REFERENCES `s_user_lpd`(`USER_ID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
