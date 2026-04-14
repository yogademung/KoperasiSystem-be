-- Insert Product Config Data
INSERT INTO `s_product_config` 
(`product_code`, `product_name`, `table_name`, `is_enabled`, `is_core`, `display_order`, `route_path`, `icon`, `default_interest_rate`, `min_interest_rate`, `max_interest_rate`)
VALUES
('ANGGOTA', 'Simpanan Anggota', 'm_nasabah_anggota', 1, 1, 1, '/simpanan/anggota', 'Users', 0.00, NULL, NULL),
('TABRELA', 'Simpanan Tabrela', 'm_nasabah_tab', 1, 0, 2, '/simpanan/tabrela', 'Wallet', 2.00, 1.00, 5.00),
('SIJANGKA', 'Simpanan Berjangka', 'm_nasabah_jangka', 1, 0, 3, '/simpanan/deposito', 'PiggyBank', 5.00, 3.00, 8.00),
('BRAHMACARI', 'Simpanan Brahmacari', 'm_nasabah_brahmacari', 1, 0, 4, '/simpanan/brahmacari', 'TrendingUp', 3.00, NULL, NULL),
('BALIMESARI', 'Simpanan Balimesari', 'm_nasabah_balimesari', 1, 0, 5, '/simpanan/balimesari', 'Sparkles', 3.50, NULL, NULL),
('WANAPRASTA', 'Simpanan Wanaprasta', 'm_nasabah_wanaprasta', 1, 0, 6, '/simpanan/wanaprasta', 'Leaf', 4.00, NULL, NULL)
ON DUPLICATE KEY UPDATE
  `product_name` = VALUES(`product_name`),
  `table_name` = VALUES(`table_name`),
  `route_path` = VALUES(`route_path`),
  `icon` = VALUES(`icon`),
  `is_core` = VALUES(`is_core`);
