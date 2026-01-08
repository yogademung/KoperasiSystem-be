-- CreateTable
CREATE TABLE `s_product_config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_code` VARCHAR(50) NOT NULL,
    `product_name` VARCHAR(100) NOT NULL,
    `table_name` VARCHAR(100) NOT NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,
    `is_core` BOOLEAN NOT NULL DEFAULT false,
    `display_order` INTEGER NOT NULL,
    `route_path` VARCHAR(255) NOT NULL,
    `icon` VARCHAR(50) NULL,
    `default_interest_rate` DECIMAL(5, 2) NULL,
    `min_interest_rate` DECIMAL(5, 2) NULL,
    `max_interest_rate` DECIMAL(5, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `s_product_config_product_code_key`(`product_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
