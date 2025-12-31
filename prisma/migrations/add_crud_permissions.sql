-- Add CRUD permissions to menu_role table
-- Phase 10 Enhancement: Granular operation-level permissions

ALTER TABLE s_menu_role_lpd 
ADD COLUMN can_create BOOLEAN DEFAULT FALSE,
ADD COLUMN can_read BOOLEAN DEFAULT TRUE,
ADD COLUMN can_update BOOLEAN DEFAULT FALSE,
ADD COLUMN can_delete BOOLEAN DEFAULT FALSE;

-- Update existing records to have READ permission by default
UPDATE s_menu_role_lpd 
SET can_read = TRUE 
WHERE can_read IS NULL;

COMMENT ON COLUMN s_menu_role_lpd.can_create IS 'Permission to create/add new records in this menu';
COMMENT ON COLUMN s_menu_role_lpd.can_read IS 'Permission to view/read records in this menu';
COMMENT ON COLUMN s_menu_role_lpd.can_update IS 'Permission to edit/update records in this menu';
COMMENT ON COLUMN s_menu_role_lpd.can_delete IS 'Permission to delete/remove records in this menu';
