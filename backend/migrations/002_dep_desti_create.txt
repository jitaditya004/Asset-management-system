CREATE TABLE departments (
  department_id SERIAL PRIMARY KEY,
  department_name TEXT NOT NULL UNIQUE,
  department_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE designations (
  designation_id SERIAL PRIMARY KEY,
  designation_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- bro didnt created these tables and says i modify database

--add column before it, 
ALTER TABLE users
ADD CONSTRAINT fk_users_department
FOREIGN KEY (department_id)
REFERENCES departments(department_id)
ON DELETE set null;

ALTER TABLE users
ADD CONSTRAINT fk_users_designation
FOREIGN KEY (designation_id)
REFERENCES designations(designation_id)
ON DELETE SET NULL;

CREATE INDEX idx_users_department_id
ON users(department_id);

CREATE INDEX idx_users_designation_id
ON users(designation_id);



ALTER TABLE users
ADD COLUMN public_id TEXT;


INSERT INTO roles (role_name, description)
VALUES
  ('ADMIN', 'System administrator with full access'),
  ('ASSET_MANAGER', 'Manages assets within a department'),
  ('USER', 'Regular user with limited access');


INSERT INTO designations (designation_name)
VALUES
  ('Software Engineer'),
  ('Senior Software Engineer'),
  ('System Administrator'),
  ('IT Support Engineer'),
  ('HR Executive'),
  ('HR Manager'),
  ('Finance Analyst'),
  ('Accounts Manager'),
  ('Operations Executive'),
  ('Operations Manager'),
  ('Asset Manager'),
  ('Procurement Officer');


INSERT INTO departments (department_name, department_code)
VALUES
  ('Information Technology', 'IT'),
  ('Human Resources', 'HR'),
  ('Finance', 'FIN'),
  ('Operations', 'OPS'),
  ('Administration', 'ADM');



INSERT INTO asset_categories (category_name, category_code)
VALUES
  ('Electronics', 'ELC'),
  ('Furniture', 'FUR'),
  ('IT Equipment', 'ITE');



-- Electronics
INSERT INTO sub_categories (subcategory_name, subcategory_code, category_id)
VALUES
  ('Laptop', 'LAP', (SELECT category_id FROM asset_categories WHERE category_name = 'Electronics')),
  ('Mobile', 'MOB', (SELECT category_id FROM asset_categories WHERE category_name = 'Electronics')),
  ('Printer', 'PRT', (SELECT category_id FROM asset_categories WHERE category_name = 'Electronics'));

-- Furniture
INSERT INTO sub_categories (subcategory_name, subcategory_code, category_id)
VALUES
  ('Chair', 'CHR', (SELECT category_id FROM asset_categories WHERE category_name = 'Furniture')),
  ('Table', 'TBL', (SELECT category_id FROM asset_categories WHERE category_name = 'Furniture'));

-- IT Equipment
INSERT INTO sub_categories (subcategory_name, subcategory_code, category_id)
VALUES
  ('Server', 'SRV', (SELECT category_id FROM asset_categories WHERE category_name = 'IT Equipment')),
  ('Router', 'RTR', (SELECT category_id FROM asset_categories WHERE category_name = 'IT Equipment'));



INSERT INTO vendors (vendor_name)
VALUES
  ('Dell'),
  ('HP'),
  ('Lenovo'),
  ('Apple'),
  ('Samsung');


--asset public id, location id rename



alter table locations
add column lat double precision;

alter table locations
add column long double precision;

alter table assets 
add column department_id int

alter table asset_documents
add column original_name text;



CREATE TYPE asset_status AS ENUM (
  'REQUESTED',
  'ACTIVE',
  'IN_REPAIR',
  'RETIRED'
);

ALTER TABLE assets
ADD COLUMN status asset_status NOT NULL DEFAULT 'REQUESTED'; --status not always active when created


ALTER TABLE assets
ALTER COLUMN status SET DEFAULT 'ACTIVE';

CREATE TABLE asset_status_history (
  history_id SERIAL PRIMARY KEY,

  asset_id INT NOT NULL
    REFERENCES assets(asset_id)
    ON DELETE CASCADE,

  old_status VARCHAR(50) NOT NULL,
  new_status VARCHAR(50) NOT NULL,

  reason TEXT,

  changed_by INT
    REFERENCES users(user_id),

  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);





CREATE INDEX idx_asset_status_history_asset
ON asset_status_history(asset_id);

CREATE INDEX idx_asset_status_history_changed_at
ON asset_status_history(changed_at);
