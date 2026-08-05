-- EURO TROUSERS CUSTOMS & WAREHOUSE MANAGEMENT SYSTEM
-- MariaDB / MySQL 8.0+ Production Database Schema
-- SAIF Zone, Sharjah, UAE

CREATE DATABASE IF NOT EXISTS `customsdb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `customsdb`;

-- 1. Users & RBAC
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(128) NOT NULL,
  `name_ar` VARCHAR(128) NULL,
  `email` VARCHAR(128) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(32) NOT NULL,
  `department` VARCHAR(64) NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `failed_login_attempts` INT DEFAULT 0,
  `locked_until` DATETIME NULL,
  `must_change_password` TINYINT(1) DEFAULT 1,
  `whatsapp_opt_in` TINYINT(1) DEFAULT 0,
  `phone_number` VARCHAR(32) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `user_sessions` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `last_active_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `is_revoked` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `permissions_matrix` (
  `role` VARCHAR(32) PRIMARY KEY,
  `permissions_json` JSON NOT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. System Settings & Master Data
CREATE TABLE IF NOT EXISTS `company_settings` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `company_name_en` VARCHAR(255) NOT NULL,
  `company_name_ar` VARCHAR(255) NOT NULL,
  `saif_zone_license_no` VARCHAR(64) NOT NULL,
  `sharjah_customs_code` VARCHAR(64) NOT NULL,
  `vat_trn` VARCHAR(32) NOT NULL,
  `facility_plot_no` VARCHAR(64) NOT NULL,
  `gm_approval_threshold_aed` DECIMAL(15,2) DEFAULT 100000.00,
  `holding_escalation_days` INT DEFAULT 3,
  `logo_url` TEXT NULL,
  `letterhead_en_text` TEXT NULL,
  `letterhead_ar_text` TEXT NULL,
  `signature_image_url` TEXT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `hs_codes` (
  `code` VARCHAR(16) PRIMARY KEY,
  `description_en` TEXT NOT NULL,
  `description_ar` TEXT NOT NULL,
  `duty_rate_percent` DECIMAL(5,2) NOT NULL,
  `vat_rate_percent` DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  `uom` VARCHAR(16) NOT NULL,
  `controlled_status` VARCHAR(32) NOT NULL,
  `free_zone_duty_exempt` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `partners` (
  `id` VARCHAR(64) PRIMARY KEY,
  `code` VARCHAR(32) NOT NULL UNIQUE,
  `name_en` VARCHAR(255) NOT NULL,
  `name_ar` VARCHAR(255) NULL,
  `partner_type` VARCHAR(32) NOT NULL,
  `country` VARCHAR(64) NOT NULL,
  `trn` VARCHAR(32) NULL,
  `customs_code` VARCHAR(64) NULL,
  `address` TEXT NULL,
  `is_active` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `item_master` (
  `id` VARCHAR(64) PRIMARY KEY,
  `item_code` VARCHAR(64) NOT NULL UNIQUE,
  `description_en` VARCHAR(255) NOT NULL,
  `description_ar` VARCHAR(255) NULL,
  `hs_code` VARCHAR(16) NOT NULL,
  `uom` VARCHAR(16) NOT NULL,
  `unit_weight_kg` DECIMAL(10,3) DEFAULT 0.000,
  `standard_unit_price_usd` DECIMAL(12,2) DEFAULT 0.00,
  `is_active` TINYINT(1) DEFAULT 1,
  FOREIGN KEY (`hs_code`) REFERENCES `hs_codes`(`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Declarations & Line Items
CREATE TABLE IF NOT EXISTS `declarations` (
  `id` VARCHAR(64) PRIMARY KEY,
  `declaration_no` VARCHAR(64) NOT NULL UNIQUE,
  `version` INT DEFAULT 1,
  `declaration_type` ENUM('IMPORT','EXPORT','TRANSFER') NOT NULL,
  `status` VARCHAR(32) NOT NULL,
  `declaration_date` DATE NOT NULL,
  `shipment_ref` VARCHAR(64) NULL,
  `invoice_no` VARCHAR(64) NOT NULL,
  `invoice_date` DATE NOT NULL,
  `po_so_number` VARCHAR(64) NULL,
  `partner_id` VARCHAR(64) NOT NULL,
  `partner_name` VARCHAR(255) NOT NULL,
  `country_of_origin` VARCHAR(64) NOT NULL,
  `country_of_destination` VARCHAR(64) NOT NULL,
  `port_of_loading` VARCHAR(128) NOT NULL,
  `port_of_discharge` VARCHAR(128) NOT NULL,
  `transport_mode` VARCHAR(32) NOT NULL,
  `bl_awb_no` VARCHAR(64) NOT NULL,
  `currency` VARCHAR(8) DEFAULT 'USD',
  `exchange_rate_to_aed` DECIMAL(10,4) DEFAULT 3.6725,
  `cif_value_original` DECIMAL(15,2) NOT NULL,
  `cif_value_aed` DECIMAL(15,2) NOT NULL,
  `total_duty_aed` DECIMAL(15,2) DEFAULT 0.00,
  `total_vat_aed` DECIMAL(15,2) DEFAULT 0.00,
  `saif_zone_ref_no` VARCHAR(64) NULL,
  `bayan_no` VARCHAR(64) NULL,
  `submitted_by` VARCHAR(128) NULL,
  `reviewed_by` VARCHAR(128) NULL,
  `approved_by` VARCHAR(128) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `declaration_items` (
  `id` VARCHAR(64) PRIMARY KEY,
  `declaration_id` VARCHAR(64) NOT NULL,
  `item_code` VARCHAR(64) NOT NULL,
  `description_en` VARCHAR(255) NOT NULL,
  `hs_code` VARCHAR(16) NOT NULL,
  `quantity` DECIMAL(12,2) NOT NULL,
  `uom` VARCHAR(16) NOT NULL,
  `unit_price` DECIMAL(12,2) NOT NULL,
  `cif_value_original` DECIMAL(15,2) NOT NULL,
  `cif_value_aed` DECIMAL(15,2) NOT NULL,
  `duty_rate_percent` DECIMAL(5,2) NOT NULL,
  `duty_amount_aed` DECIMAL(15,2) NOT NULL,
  `vat_rate_percent` DECIMAL(5,2) NOT NULL,
  `vat_amount_aed` DECIMAL(15,2) NOT NULL,
  `free_zone_exempt` TINYINT(1) DEFAULT 1,
  FOREIGN KEY (`declaration_id`) REFERENCES `declarations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `declaration_transitions` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `declaration_id` VARCHAR(64) NOT NULL,
  `from_status` VARCHAR(32) NOT NULL,
  `to_status` VARCHAR(32) NOT NULL,
  `performed_by_id` VARCHAR(64) NOT NULL,
  `performed_by_name` VARCHAR(128) NOT NULL,
  `performed_by_role` VARCHAR(32) NOT NULL,
  `remarks` TEXT NULL,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`declaration_id`) REFERENCES `declarations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Containers, Inspections & Gate Passes
CREATE TABLE IF NOT EXISTS `containers` (
  `id` VARCHAR(64) PRIMARY KEY,
  `container_no` VARCHAR(32) NOT NULL UNIQUE,
  `seal_no` VARCHAR(64) NOT NULL,
  `size_type` VARCHAR(16) NOT NULL,
  `shipment_mode` ENUM('FCL','LCL','AIR') DEFAULT 'FCL',
  `declaration_no` VARCHAR(64) NULL,
  `arrival_date` DATE NOT NULL,
  `free_days` INT DEFAULT 10,
  `return_due_date` DATE NOT NULL,
  `returned_date` DATE NULL,
  `status` VARCHAR(32) NOT NULL,
  `demurrage_fee_aed` DECIMAL(12,2) DEFAULT 0.00,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `holds` (
  `id` VARCHAR(64) PRIMARY KEY,
  `declaration_no` VARCHAR(64) NOT NULL,
  `held_by` VARCHAR(128) NOT NULL,
  `held_at_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `hold_reason` TEXT NOT NULL,
  `status` ENUM('ACTIVE_HOLD','RESOLVED_RELEASED') DEFAULT 'ACTIVE_HOLD',
  `resolved_by` VARCHAR(128) NULL,
  `resolution_notes` TEXT NULL,
  `resolved_at` DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Stock Ledger & Reconciliations
CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `item_code` VARCHAR(64) NOT NULL,
  `hs_code` VARCHAR(16) NOT NULL,
  `movement_type` ENUM('IMPORT_RECEIPT','TRANSFER_IN','TRANSFER_OUT','EXPORT_DISPATCH','ADJUSTMENT_REVERSAL') NOT NULL,
  `declaration_no` VARCHAR(64) NULL,
  `quantity` DECIMAL(12,2) NOT NULL,
  `uom` VARCHAR(16) NOT NULL,
  `customs_balance_after` DECIMAL(12,2) NOT NULL,
  `warehouse_balance_after` DECIMAL(12,2) NOT NULL,
  `created_by` VARCHAR(128) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Notification Outbox
CREATE TABLE IF NOT EXISTS `notification_outbox` (
  `id` VARCHAR(64) PRIMARY KEY,
  `event` VARCHAR(64) NOT NULL,
  `channel` ENUM('EMAIL','WHATSAPP','SYSTEM') NOT NULL,
  `recipient` VARCHAR(255) NOT NULL,
  `recipient_name` VARCHAR(128) NULL,
  `subject` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `status` ENUM('QUEUED','SENT','FAILED','RETRYING') DEFAULT 'QUEUED',
  `attempts` INT DEFAULT 0,
  `max_attempts` INT DEFAULT 3,
  `sent_at` DATETIME NULL,
  `error_message` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Audit Log
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(64) PRIMARY KEY,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `user_id` VARCHAR(64) NOT NULL,
  `user_name` VARCHAR(128) NOT NULL,
  `user_role` VARCHAR(32) NOT NULL,
  `module` VARCHAR(64) NOT NULL,
  `action` VARCHAR(64) NOT NULL,
  `entity_type` VARCHAR(64) NOT NULL,
  `entity_id` VARCHAR(64) NOT NULL,
  `entity_ref` VARCHAR(128) NOT NULL,
  `details` TEXT NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `before_state` JSON NULL,
  `after_state` JSON NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
