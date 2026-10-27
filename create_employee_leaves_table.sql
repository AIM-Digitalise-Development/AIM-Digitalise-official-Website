-- ==============================================================================
-- AIM Digitalise - Employee Leaves Table Schema
-- Table: employee_leaves
-- ==============================================================================

CREATE TABLE IF NOT EXISTS `employee_leaves` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `leave_type` enum('cl','el','sl','lop') NOT NULL COMMENT 'cl=Casual Leave, el=Earned Leave, sl=Sick Leave, lop=Loss of Pay',
  `from_date` date NOT NULL,
  `from_half` enum('full','fh','sh') NOT NULL DEFAULT 'full' COMMENT 'full=Full Day, fh=First Half, sh=Second Half',
  `to_date` date NOT NULL,
  `to_half` enum('full','fh','sh') NOT NULL DEFAULT 'full' COMMENT 'full=Full Day, fh=First Half, sh=Second Half',
  `total_days` decimal(4,1) NOT NULL COMMENT 'e.g. 0.5, 1.0, 1.5, 2.0',
  `reason` text NOT NULL,
  `medical_certificate_path` varchar(255) DEFAULT NULL COMMENT 'Uploaded medical certificate for SL > 3 days',
  `medical_certificate_name` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `admin_remarks` text DEFAULT NULL,
  `reviewed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `employee_leaves_employee_id_index` (`employee_id`),
  KEY `employee_leaves_leave_type_index` (`leave_type`),
  KEY `employee_leaves_status_index` (`status`),
  KEY `employee_leaves_from_date_index` (`from_date`),
  KEY `employee_leaves_to_date_index` (`to_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
