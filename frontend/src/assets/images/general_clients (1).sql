-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 21, 2026 at 08:47 AM
-- Server version: 11.8.8-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u681343650_aim_backend`
--

-- --------------------------------------------------------

--
-- Table structure for table `general_clients`
--

CREATE TABLE `general_clients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `client_id` varchar(255) NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `contact_number` varchar(255) NOT NULL,
  `alt_contact_number` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `district` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `pin_code` varchar(255) DEFAULT NULL,
  `country_code` varchar(255) NOT NULL DEFAULT 'IN',
  `gst_type` enum('Intra-State','Inter-State') NOT NULL DEFAULT 'Intra-State',
  `gstin` varchar(255) DEFAULT NULL,
  `lead_source` varchar(255) DEFAULT NULL,
  `referred_by` varchar(255) DEFAULT NULL,
  `sold_by` varchar(255) NOT NULL DEFAULT 'Admin',
  `software_requirements` text DEFAULT NULL,
  `next_followup_date` date DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Attended',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `general_clients`
--

INSERT INTO `general_clients` (`id`, `client_id`, `client_name`, `company_name`, `email`, `contact_number`, `alt_contact_number`, `address`, `district`, `state`, `pin_code`, `country_code`, `gst_type`, `gstin`, `lead_source`, `referred_by`, `sold_by`, `software_requirements`, `next_followup_date`, `status`, `created_at`, `updated_at`) VALUES
(2, 'AIMGC52758', 'test1', 'testcom', 'OISHOELCLN16@GMAIL.COM', '+917250073639', NULL, 'NUNIA MAHINHAON KISHANGANJ', 'KISHANGANJ', 'Bihar', NULL, 'IN', 'Intra-State', NULL, 'Website', 'Direct', 'Admin', 'tutfuflfyufvibfybir', '2026-08-27', 'Attended', '2026-08-13 17:59:00', '2026-08-19 13:13:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `general_clients`
--
ALTER TABLE `general_clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `general_clients_client_id_unique` (`client_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `general_clients`
--
ALTER TABLE `general_clients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
