-- ============================================================
-- SQL Schema for Purchase & Procurement Module
-- Run this in phpMyAdmin or MySQL client for aim-backend DB
-- ============================================================

-- 1. Vendors Table
CREATE TABLE IF NOT EXISTS `vendors` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `vendor_name` VARCHAR(255) NOT NULL,
  `contact_person` VARCHAR(255) NULL,
  `gst_no` VARCHAR(50) NULL,
  `phone` VARCHAR(50) NULL,
  `email` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Items Master Catalog Table
CREATE TABLE IF NOT EXISTS `items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `item_name` VARCHAR(255) NOT NULL,
  `hsn_code` VARCHAR(50) NULL,
  `description` TEXT NULL,
  `unit` ENUM('unit', 'month', 'account', 'box', 'piece') NOT NULL DEFAULT 'unit',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Purchases Main Table
CREATE TABLE IF NOT EXISTS `purchases` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `purchase_no` VARCHAR(50) NOT NULL UNIQUE,
  `vendor_id` BIGINT UNSIGNED NOT NULL,
  `invoice_no` VARCHAR(100) NOT NULL,
  `invoice_file` VARCHAR(255) NULL,
  `purchase_date` DATE NOT NULL,
  `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `purchases_vendor_id_foreign` (`vendor_id`),
  CONSTRAINT `purchases_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Purchase Entry Line Items (supports multiple items per purchase)
CREATE TABLE IF NOT EXISTS `purchase_entry_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `purchase_id` BIGINT UNSIGNED NOT NULL,
  `item_id` BIGINT UNSIGNED NULL,
  `item_name` VARCHAR(255) NOT NULL,
  `hsn_code` VARCHAR(50) NULL,
  `unit` VARCHAR(50) NOT NULL DEFAULT 'unit',
  `quantity` DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  `rate` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `purchase_entry_items_purchase_id_foreign` (`purchase_id`),
  KEY `purchase_entry_items_item_id_foreign` (`item_id`),
  CONSTRAINT `purchase_entry_items_purchase_id_foreign` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_entry_items_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

