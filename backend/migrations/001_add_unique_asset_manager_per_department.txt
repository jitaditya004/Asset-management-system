-- Migration: Add partial unique index to enforce one ASSET_MANAGER per department
-- This ensures that each department can have only ONE user with ASSET_MANAGER role

-- First, ensure the roles exist (if not already present)
-- Note: Role names are case-sensitive. Use uppercase to match code expectations.
INSERT INTO roles (role_name, description) 
VALUES 
  ('ADMIN', 'System administrator with full access'),
  ('ASSET_MANAGER', 'Manages assets for their department'),
  ('USER', 'Regular user with limited access')
ON CONFLICT (role_name) DO NOTHING;

-- If you have existing lowercase roles, you may need to update them:
-- UPDATE roles SET role_name = 'ADMIN' WHERE role_name = 'admin';
-- UPDATE roles SET role_name = 'ASSET_MANAGER' WHERE role_name = 'asset_manager';
-- UPDATE roles SET role_name = 'USER' WHERE role_name = 'viewer' OR role_name = 'user';

-- Create a partial unique index on user_roles + users.department_id
-- This ensures only one ASSET_MANAGER per department
-- The index only applies when role_name = 'ASSET_MANAGER'
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_asset_manager_per_department
ON user_roles (user_id)
WHERE EXISTS (
  SELECT 1 
  FROM users u
  JOIN roles r ON r.role_id = user_roles.role_id
  WHERE u.user_id = user_roles.user_id 
  AND r.role_name = 'ASSET_MANAGER'
);

-- Alternative approach: Create a function-based unique constraint
-- This is more reliable for enforcing the constraint
-- First, create a function to check uniqueness
CREATE OR REPLACE FUNCTION check_one_asset_manager_per_department()
RETURNS TRIGGER AS $$
DECLARE
  user_dept_id INTEGER;
  existing_manager_count INTEGER;
BEGIN
  -- Get the department_id of the user being assigned ASSET_MANAGER role
  SELECT department_id INTO user_dept_id
  FROM users
  WHERE user_id = NEW.user_id;
  
  -- Check if role being assigned is ASSET_MANAGER
  IF EXISTS (
    SELECT 1 FROM roles WHERE role_id = NEW.role_id AND role_name = 'ASSET_MANAGER'
  ) THEN
    -- Count existing ASSET_MANAGERs in this department
    SELECT COUNT(*) INTO existing_manager_count
    FROM user_roles ur
    JOIN users u ON ur.user_id = u.user_id
    JOIN roles r ON ur.role_id = r.role_id
    WHERE u.department_id = user_dept_id
    AND r.role_name = 'ASSET_MANAGER'
    AND ur.user_id != NEW.user_id; -- Exclude current user
    
    IF existing_manager_count > 0 THEN
      RAISE EXCEPTION 'Department already has an ASSET_MANAGER. Only one ASSET_MANAGER per department is allowed.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce the constraint
DROP TRIGGER IF EXISTS trigger_one_asset_manager_per_department ON user_roles;
CREATE TRIGGER trigger_one_asset_manager_per_department
BEFORE INSERT OR UPDATE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION check_one_asset_manager_per_department();

-- Add comment explaining the constraint
COMMENT ON FUNCTION check_one_asset_manager_per_department() IS 
'Enforces that each department can have only one ASSET_MANAGER. Trigger fires on INSERT/UPDATE to user_roles table.';

