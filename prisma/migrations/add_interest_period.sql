-- Add interest_period column to s_product_config
ALTER TABLE `s_product_config` 
ADD COLUMN `interest_period` VARCHAR(20) NULL DEFAULT 'MONTHLY' AFTER `max_interest_rate`;

-- Update existing products with appropriate periods
UPDATE `s_product_config` 
SET `interest_period` = CASE 
    WHEN `product_code` = 'ANGGOTA' THEN NULL
    WHEN `product_code` = 'DEPOSITO' THEN 'MONTHLY'
    ELSE 'MONTHLY'
END;
