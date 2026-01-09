-- Drop existing ProductConfig table if exists (has old schema with interest_period)
DROP TABLE IF EXISTS `s_product_config`;

-- Create ProductConfig table with correct schema
CREATE TABLE `s_product_config` (
  `product_id` INT NOT NULL AUTO_INCREMENT,
  `product_code` VARCHAR(50) NOT NULL,
  `product_name` VARCHAR(100) NOT NULL,
  `table_name` VARCHAR(100) NOT NULL,
  `is_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_core` BOOLEAN NOT NULL DEFAULT FALSE,
  `display_order` INT NOT NULL DEFAULT 0,
  `route_path` VARCHAR(255) NULL,
  `icon` VARCHAR(50) NULL,
  `default_interest_rate` DECIMAL(5, 2) NULL DEFAULT 0,
  `min_interest_rate` DECIMAL(5, 2) NULL,
  `max_interest_rate` DECIMAL(5, 2) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  
  PRIMARY KEY (`product_id`),
  UNIQUE INDEX `s_product_config_product_code_key`(`product_code`),
  INDEX `s_product_config_is_enabled_idx`(`is_enabled`),
  INDEX `s_product_config_display_order_idx`(`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
