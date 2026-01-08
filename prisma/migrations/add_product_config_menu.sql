-- Add "Konfigurasi Produk" menu item to s_menu_lpd
-- This should be placed under "Pengaturan" parent menu

-- First, find the Pengaturan parent ID (assuming it exists)
SET @pengaturan_id = (SELECT menu_lpd_id FROM s_menu_lpd WHERE nama_menu = 'Pengaturan' LIMIT 1);

-- Insert Konfigurasi Produk menu
INSERT INTO s_menu_lpd (nama_menu, modul, node, parent_id, icon, path, order_num, ACTIVE_FLAG, CREATE_WHO, CREATE_DATE)
VALUES (
    'Konfigurasi Produk',
    'SETTINGS',
    'MENU',
    @pengaturan_id,
    'Settings',
    '/settings/products',
    2, -- Order: after Profil Koperasi (1), before Manajemen User (3)
    1,
    'SYSTEM',
    NOW()
);

-- Get the new menu ID
SET @new_menu_id = LAST_INSERT_ID();

-- Grant access to ADMIN role (assuming ROLE_LPD_ID = 1 for ADMIN)
INSERT INTO s_menu_role_lpd (ROLE_LPD_ID, menu_lpd_id, can_create, can_read, can_update, can_delete)
VALUES (1, @new_menu_id, 1, 1, 1, 1);

SELECT 'Menu "Konfigurasi Produk" berhasil ditambahkan!' as result;
