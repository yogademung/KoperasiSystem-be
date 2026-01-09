-- Phase 13 Week 3: Cost Centers
-- Create cost_center table with hierarchical structure

CREATE TABLE `cost_center` (
  `cost_center_id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `parent_id` INT NULL,
  `business_unit_id` INT NULL,
  `manager_id` INT NULL,
  `budget` DECIMAL(15, 2) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  
  PRIMARY KEY (`cost_center_id`),
  UNIQUE INDEX `cost_center_code_key`(`code`),
  INDEX `cost_center_parent_id_idx`(`parent_id`),
  INDEX `cost_center_business_unit_id_idx`(`business_unit_id`),
  INDEX `cost_center_manager_id_idx`(`manager_id`),
  INDEX `cost_center_is_active_idx`(`is_active`),
  
  CONSTRAINT `cost_center_parent_id_fkey` 
    FOREIGN KEY (`parent_id`) REFERENCES `cost_center`(`cost_center_id`) 
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `cost_center_manager_id_fkey` 
    FOREIGN KEY (`manager_id`) REFERENCES `s_user_lpd`(`USER_ID`) 
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `cost_center_created_by_fkey` 
    FOREIGN KEY (`created_by`) REFERENCES `s_user_lpd`(`USER_ID`) 
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
