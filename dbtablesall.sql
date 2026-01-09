CREATE TABLE departments (
  department_id SERIAL PRIMARY KEY,
  department_name TEXT NOT NULL,
  department_code TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE designations (
  designation_id SERIAL PRIMARY KEY,
  designation_name TEXT NOT NULL,
  designation_code TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR NOT NULL UNIQUE,
  description TEXT
);



CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  full_name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone VARCHAR,
  is_active BOOLEAN DEFAULT true,
  department_id INT,
  designation_id INT,
  public_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT now(),

  CONSTRAINT fk_users_department
    FOREIGN KEY (department_id)
    REFERENCES departments(department_id),

  CONSTRAINT fk_users_designation
    FOREIGN KEY (designation_id)
    REFERENCES designations(designation_id)
);

CREATE TABLE user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (user_id, role_id),

  CONSTRAINT fk_user_roles_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id),

  CONSTRAINT fk_user_roles_role
    FOREIGN KEY (role_id)
    REFERENCES roles(role_id)
);




CREATE TABLE asset_categories (
  category_id SERIAL PRIMARY KEY,
  category_name VARCHAR NOT NULL,
  description TEXT,
  category_code TEXT UNIQUE
);

CREATE TABLE sub_categories (
  subcategory_id SERIAL PRIMARY KEY,
  category_id INT NOT NULL,
  subcategory_name VARCHAR NOT NULL,
  description TEXT,
  subcategory_code TEXT UNIQUE,

  CONSTRAINT fk_subcat_category
    FOREIGN KEY (category_id)
    REFERENCES asset_categories(category_id)
);



CREATE TABLE locations (
  location_id SERIAL PRIMARY KEY,
  location_name VARCHAR NOT NULL,
  address TEXT,
  region VARCHAR,
  description TEXT,
  lat DOUBLE PRECISION,
  long DOUBLE PRECISION
);

CREATE TABLE vendors (
  vendor_id SERIAL PRIMARY KEY,
  vendor_name VARCHAR NOT NULL,
  contact_person VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  address TEXT
);

CREATE TABLE assets (
  asset_id SERIAL PRIMARY KEY,
  asset_name VARCHAR NOT NULL,
  category_id INT,
  subcategory_id INT,
  serial_number VARCHAR UNIQUE,
  model_number VARCHAR,
  purchase_date DATE,
  purchase_cost NUMERIC,
  vendor_id INT,
  warranty_expiry DATE,
  location_id INT,
  assigned_to INT,
  department_id INT,
  maintenance_id INT,
  description TEXT,
  status TEXT,
  public_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (category_id) REFERENCES asset_categories(category_id),
  FOREIGN KEY (subcategory_id) REFERENCES sub_categories(subcategory_id),
  FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id),
  FOREIGN KEY (location_id) REFERENCES locations(location_id),
  FOREIGN KEY (assigned_to) REFERENCES users(user_id),
  FOREIGN KEY (department_id) REFERENCES departments(department_id)
);


CREATE TABLE asset_documents (
  document_id SERIAL PRIMARY KEY,
  asset_id INT NOT NULL,
  document_type VARCHAR,
  file_path TEXT NOT NULL,
  original_name TEXT,
  uploaded_by INT,
  uploaded_at TIMESTAMP DEFAULT now(),
  expiry_date DATE,

  FOREIGN KEY (asset_id) REFERENCES assets(asset_id),
  FOREIGN KEY (uploaded_by) REFERENCES users(user_id)
);




CREATE TABLE asset_failures (
  failure_id SERIAL PRIMARY KEY,
  asset_id INT NOT NULL,
  failure_description TEXT,
  failure_date DATE,
  resolved BOOLEAN DEFAULT false,
  resolved_date DATE,

  FOREIGN KEY (asset_id) REFERENCES assets(asset_id)
);

CREATE TABLE asset_history (
  history_id SERIAL PRIMARY KEY,
  asset_id INT NOT NULL,
  old_location_id INT,
  new_location_id INT,
  changed_by INT,
  change_date TIMESTAMP DEFAULT now(),

  FOREIGN KEY (asset_id) REFERENCES assets(asset_id),
  FOREIGN KEY (changed_by) REFERENCES users(user_id)
);

CREATE TABLE asset_status_history (
  history_id SERIAL PRIMARY KEY,
  asset_id INT NOT NULL,
  old_status VARCHAR,
  new_status VARCHAR,
  reason TEXT,
  changed_by INT,
  changed_at TIMESTAMP DEFAULT now(),
  asset_public_id TEXT,

  FOREIGN KEY (asset_id) REFERENCES assets(asset_id),
  FOREIGN KEY (changed_by) REFERENCES users(user_id)
);



CREATE TABLE asset_requests (
  request_id SERIAL PRIMARY KEY,
  asset_id INT NOT NULL,
  requested_by INT,
  requested_department_id INT,
  status TEXT,
  reason TEXT,
  admin_comment TEXT,
  reviewed_by INT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (asset_id) REFERENCES assets(asset_id),
  FOREIGN KEY (requested_by) REFERENCES users(user_id),
  FOREIGN KEY (reviewed_by) REFERENCES users(user_id),
  FOREIGN KEY (requested_department_id) REFERENCES departments(department_id)
);

CREATE TABLE maintenance_requests (
  maintenance_id SERIAL PRIMARY KEY,
  asset_id INT NOT NULL,
  reported_by INT,
  issue_description TEXT,
  maintenance_type VARCHAR,
  status VARCHAR,
  priority VARCHAR,
  assigned_vendor TEXT,
  created_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP,
  reviewed_by INT,
  cancelled_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,

  FOREIGN KEY (asset_id) REFERENCES assets(asset_id),
  FOREIGN KEY (reported_by) REFERENCES users(user_id),
  FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);


CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  actor_id INT,
  action TEXT,
  target_type VARCHAR,
  target_id INT,
  payload JSONB,
  created_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (actor_id) REFERENCES users(user_id)
);


CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assets_department ON assets(department_id);
CREATE INDEX idx_assets_assigned_to ON assets(assigned_to);

CREATE INDEX idx_asset_requests_status ON asset_requests(status);
CREATE INDEX idx_asset_requests_asset ON asset_requests(asset_id);

CREATE INDEX idx_telemetry_asset_ts ON telemetry(asset_id, ts);
CREATE INDEX idx_audit_actor ON audit_log(actor_id);
