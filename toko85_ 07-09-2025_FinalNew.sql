/*
SQLyog Ultimate v13.1.1 (64 bit)
MySQL - 8.0.30 : Database - point_of_sales
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`point_of_sales` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `point_of_sales`;

/*Table structure for table `barcodes` */

DROP TABLE IF EXISTS `barcodes`;

CREATE TABLE `barcodes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `barcode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `barcodes_barcode_unique` (`barcode`),
  KEY `barcodes_product_id_foreign` (`product_id`),
  CONSTRAINT `barcodes_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `barcodes` */

insert  into `barcodes`(`id`,`product_id`,`barcode`,`created_at`,`updated_at`) values 
(1,1,'BRC_1757079048729858','2025-09-05 13:30:48','2025-09-05 13:30:48');

/*Table structure for table `cache` */

DROP TABLE IF EXISTS `cache`;

CREATE TABLE `cache` (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `cache` */

insert  into `cache`(`key`,`value`,`expiration`) values 
('spatie.permission.cache','a:3:{s:5:\"alias\";a:4:{s:1:\"a\";s:2:\"id\";s:1:\"b\";s:4:\"name\";s:1:\"c\";s:10:\"guard_name\";s:1:\"r\";s:5:\"roles\";}s:11:\"permissions\";a:77:{i:0;a:4:{s:1:\"a\";i:1;s:1:\"b\";s:16:\"dashboard-access\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:8;i:1;i:10;}}i:1;a:4:{s:1:\"a\";i:2;s:1:\"b\";s:12:\"users-access\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:8;}}i:2;a:4:{s:1:\"a\";i:3;s:1:\"b\";s:12:\"users-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:8;}}i:3;a:4:{s:1:\"a\";i:4;s:1:\"b\";s:12:\"users-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:8;}}i:4;a:4:{s:1:\"a\";i:5;s:1:\"b\";s:12:\"users-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:8;}}i:5;a:4:{s:1:\"a\";i:6;s:1:\"b\";s:12:\"roles-access\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:2;i:1;i:8;}}i:6;a:4:{s:1:\"a\";i:7;s:1:\"b\";s:12:\"roles-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:2;i:1;i:8;}}i:7;a:4:{s:1:\"a\";i:8;s:1:\"b\";s:12:\"roles-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:2;i:1;i:8;}}i:8;a:4:{s:1:\"a\";i:9;s:1:\"b\";s:12:\"roles-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:2;i:1;i:8;}}i:9;a:4:{s:1:\"a\";i:10;s:1:\"b\";s:18:\"permissions-access\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:3;i:1;i:8;}}i:10;a:4:{s:1:\"a\";i:11;s:1:\"b\";s:18:\"permissions-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:3;i:1;i:8;}}i:11;a:4:{s:1:\"a\";i:12;s:1:\"b\";s:18:\"permissions-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:3;i:1;i:8;}}i:12;a:4:{s:1:\"a\";i:13;s:1:\"b\";s:18:\"permissions-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:3;i:1;i:8;}}i:13;a:4:{s:1:\"a\";i:14;s:1:\"b\";s:17:\"categories-access\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:4;i:1;i:8;i:2;i:10;}}i:14;a:4:{s:1:\"a\";i:15;s:1:\"b\";s:17:\"categories-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:4;i:1;i:8;}}i:15;a:4:{s:1:\"a\";i:16;s:1:\"b\";s:15:\"categories-edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:4;i:1;i:8;}}i:16;a:4:{s:1:\"a\";i:17;s:1:\"b\";s:17:\"categories-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:4;i:1;i:8;}}i:17;a:4:{s:1:\"a\";i:18;s:1:\"b\";s:20:\"subcategories-access\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:4;i:1;i:8;i:2;i:10;}}i:18;a:4:{s:1:\"a\";i:19;s:1:\"b\";s:20:\"subcategories-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:4;i:1;i:8;}}i:19;a:4:{s:1:\"a\";i:20;s:1:\"b\";s:18:\"subcategories-edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:4;i:1;i:8;}}i:20;a:4:{s:1:\"a\";i:21;s:1:\"b\";s:20:\"subcategories-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:4;i:1;i:8;}}i:21;a:4:{s:1:\"a\";i:22;s:1:\"b\";s:15:\"products-access\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:5;i:1;i:8;i:2;i:10;}}i:22;a:4:{s:1:\"a\";i:23;s:1:\"b\";s:15:\"products-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:5;i:1;i:8;i:2;i:10;}}i:23;a:4:{s:1:\"a\";i:24;s:1:\"b\";s:13:\"products-edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:5;i:1;i:8;i:2;i:10;}}i:24;a:4:{s:1:\"a\";i:25;s:1:\"b\";s:15:\"products-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:5;i:1;i:8;}}i:25;a:4:{s:1:\"a\";i:26;s:1:\"b\";s:16:\"customers-access\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:6;i:1;i:8;}}i:26;a:4:{s:1:\"a\";i:27;s:1:\"b\";s:16:\"customers-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:6;i:1;i:8;}}i:27;a:4:{s:1:\"a\";i:28;s:1:\"b\";s:14:\"customers-edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:6;i:1;i:8;}}i:28;a:4:{s:1:\"a\";i:29;s:1:\"b\";s:16:\"customers-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:6;i:1;i:8;}}i:29;a:4:{s:1:\"a\";i:30;s:1:\"b\";s:16:\"suppliers-access\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:8;i:1;i:10;}}i:30;a:4:{s:1:\"a\";i:31;s:1:\"b\";s:16:\"suppliers-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:31;a:4:{s:1:\"a\";i:32;s:1:\"b\";s:14:\"suppliers-edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:32;a:4:{s:1:\"a\";i:33;s:1:\"b\";s:16:\"suppliers-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:33;a:4:{s:1:\"a\";i:34;s:1:\"b\";s:12:\"units-access\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:8;i:1;i:10;}}i:34;a:4:{s:1:\"a\";i:35;s:1:\"b\";s:12:\"units-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:35;a:4:{s:1:\"a\";i:36;s:1:\"b\";s:10:\"units-edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:36;a:4:{s:1:\"a\";i:37;s:1:\"b\";s:12:\"units-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:37;a:4:{s:1:\"a\";i:38;s:1:\"b\";s:19:\"transactions-access\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:7;i:1;i:8;i:2;i:12;}}i:38;a:4:{s:1:\"a\";i:39;s:1:\"b\";s:19:\"transactions-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:7;i:1;i:8;i:2;i:12;}}i:39;a:4:{s:1:\"a\";i:40;s:1:\"b\";s:17:\"transactions-edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:7;i:1;i:8;}}i:40;a:4:{s:1:\"a\";i:41;s:1:\"b\";s:19:\"transactions-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:4:{i:0;i:7;i:1;i:8;i:2;i:10;i:3;i:12;}}i:41;a:4:{s:1:\"a\";i:42;s:1:\"b\";s:16:\"purchases-access\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:8;i:1;i:10;i:2;i:12;}}i:42;a:4:{s:1:\"a\";i:43;s:1:\"b\";s:16:\"purchases-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:8;i:1;i:10;i:2;i:12;}}i:43;a:4:{s:1:\"a\";i:44;s:1:\"b\";s:14:\"purchases-edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:8;i:1;i:10;}}i:44;a:4:{s:1:\"a\";i:45;s:1:\"b\";s:16:\"purchases-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:45;a:4:{s:1:\"a\";i:46;s:1:\"b\";s:28:\"transaction-histories-access\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:46;a:4:{s:1:\"a\";i:47;s:1:\"b\";s:28:\"transaction-histories-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:47;a:4:{s:1:\"a\";i:48;s:1:\"b\";s:26:\"transaction-histories-edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:48;a:4:{s:1:\"a\";i:49;s:1:\"b\";s:28:\"transaction-histories-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:49;a:4:{s:1:\"a\";i:50;s:1:\"b\";s:12:\"tokos-access\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:50;a:4:{s:1:\"a\";i:51;s:1:\"b\";s:12:\"tokos-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:51;a:4:{s:1:\"a\";i:52;s:1:\"b\";s:10:\"tokos-edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:52;a:4:{s:1:\"a\";i:53;s:1:\"b\";s:12:\"tokos-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:53;a:4:{s:1:\"a\";i:54;s:1:\"b\";s:14:\"reports-access\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:54;a:4:{s:1:\"a\";i:55;s:1:\"b\";s:14:\"reports-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:55;a:4:{s:1:\"a\";i:56;s:1:\"b\";s:12:\"reports-edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:56;a:4:{s:1:\"a\";i:57;s:1:\"b\";s:14:\"reports-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:57;a:4:{s:1:\"a\";i:58;s:1:\"b\";s:14:\"reports-export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:8;i:1;i:10;i:2;i:12;}}i:58;a:4:{s:1:\"a\";i:59;s:1:\"b\";s:17:\"stock-view-access\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:59;a:4:{s:1:\"a\";i:60;s:1:\"b\";s:18:\"stocks.view.gudang\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:60;a:4:{s:1:\"a\";i:61;s:1:\"b\";s:16:\"stocks.view.toko\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:61;a:4:{s:1:\"a\";i:62;s:1:\"b\";s:16:\"warehouse.manage\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:62;a:4:{s:1:\"a\";i:63;s:1:\"b\";s:17:\"force-gudang-view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:8;i:1;i:12;}}i:63;a:4:{s:1:\"a\";i:64;s:1:\"b\";s:20:\"stock-movements.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:64;a:4:{s:1:\"a\";i:65;s:1:\"b\";s:22:\"stock-movements.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:65;a:4:{s:1:\"a\";i:66;s:1:\"b\";s:20:\"stock-movements.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:66;a:4:{s:1:\"a\";i:67;s:1:\"b\";s:22:\"stock-movements.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:67;a:4:{s:1:\"a\";i:68;s:1:\"b\";s:22:\"stock-movements.manage\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:68;a:4:{s:1:\"a\";i:69;s:1:\"b\";s:17:\"transactions.sell\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:8;i:1;i:12;}}i:69;a:4:{s:1:\"a\";i:70;s:1:\"b\";s:21:\"transactions.purchase\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:8;i:1;i:12;}}i:70;a:4:{s:1:\"a\";i:71;s:1:\"b\";s:17:\"deliveries-access\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:8;i:1;i:10;}}i:71;a:4:{s:1:\"a\";i:72;s:1:\"b\";s:19:\"transactions.manage\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:8;i:1;i:12;}}i:72;a:4:{s:1:\"a\";i:73;s:1:\"b\";s:16:\"purchases.manage\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:8;i:1;i:12;}}i:73;a:4:{s:1:\"a\";i:74;s:1:\"b\";s:6:\"gudang\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:74;a:4:{s:1:\"a\";i:75;s:1:\"b\";s:4:\"toko\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:8;}}i:75;a:4:{s:1:\"a\";i:76;s:1:\"b\";s:19:\"report-transactions\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:8;i:1;i:9;i:2;i:12;}}i:76;a:4:{s:1:\"a\";i:77;s:1:\"b\";s:20:\"reports.transactions\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:8;i:1;i:10;i:2;i:12;}}}s:5:\"roles\";a:11:{i:0;a:3:{s:1:\"a\";i:8;s:1:\"b\";s:11:\"super-admin\";s:1:\"c\";s:3:\"web\";}i:1;a:3:{s:1:\"a\";i:10;s:1:\"b\";s:6:\"Gudang\";s:1:\"c\";s:3:\"web\";}i:2;a:3:{s:1:\"a\";i:1;s:1:\"b\";s:12:\"users-access\";s:1:\"c\";s:3:\"web\";}i:3;a:3:{s:1:\"a\";i:2;s:1:\"b\";s:12:\"roles-access\";s:1:\"c\";s:3:\"web\";}i:4;a:3:{s:1:\"a\";i:3;s:1:\"b\";s:17:\"permission-access\";s:1:\"c\";s:3:\"web\";}i:5;a:3:{s:1:\"a\";i:4;s:1:\"b\";s:17:\"categories-access\";s:1:\"c\";s:3:\"web\";}i:6;a:3:{s:1:\"a\";i:5;s:1:\"b\";s:15:\"products-access\";s:1:\"c\";s:3:\"web\";}i:7;a:3:{s:1:\"a\";i:6;s:1:\"b\";s:16:\"customers-access\";s:1:\"c\";s:3:\"web\";}i:8;a:3:{s:1:\"a\";i:7;s:1:\"b\";s:19:\"transactions-access\";s:1:\"c\";s:3:\"web\";}i:9;a:3:{s:1:\"a\";i:12;s:1:\"b\";s:4:\"Toko\";s:1:\"c\";s:3:\"web\";}i:10;a:3:{s:1:\"a\";i:9;s:1:\"b\";s:20:\"reports.transactions\";s:1:\"c\";s:3:\"web\";}}}',1757268261);

/*Table structure for table `carts` */

DROP TABLE IF EXISTS `carts`;

CREATE TABLE `carts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cashier_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned DEFAULT NULL,
  `subcategory_id` bigint unsigned DEFAULT NULL,
  `unit_id` bigint unsigned DEFAULT NULL,
  `qty` int NOT NULL,
  `price` bigint NOT NULL,
  `toko_id` bigint unsigned DEFAULT NULL,
  `pakai_stok_toko` tinyint(1) NOT NULL DEFAULT '0',
  `toko_consumed` tinyint(1) NOT NULL DEFAULT '0',
  `stok_toko_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `carts_cashier_id_foreign` (`cashier_id`),
  KEY `carts_product_id_foreign` (`product_id`),
  KEY `carts_category_id_foreign` (`category_id`),
  KEY `carts_subcategory_id_foreign` (`subcategory_id`),
  KEY `carts_unit_id_foreign` (`unit_id`),
  KEY `carts_toko_id_foreign` (`toko_id`),
  CONSTRAINT `carts_cashier_id_foreign` FOREIGN KEY (`cashier_id`) REFERENCES `users` (`id`),
  CONSTRAINT `carts_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `carts_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `carts_subcategory_id_foreign` FOREIGN KEY (`subcategory_id`) REFERENCES `subcategories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `carts_toko_id_foreign` FOREIGN KEY (`toko_id`) REFERENCES `tokos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `carts_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `carts` */

/*Table structure for table `categories` */

DROP TABLE IF EXISTS `categories`;

CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `categories` */

insert  into `categories`(`id`,`code`,`image`,`name`,`description`,`created_at`,`updated_at`) values 
(1,'BERAS','','Beras','ini beras','2025-09-05 13:27:54','2025-09-05 13:27:54');

/*Table structure for table `customers` */

DROP TABLE IF EXISTS `customers`;

CREATE TABLE `customers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `deposit` decimal(16,2) NOT NULL DEFAULT '0.00',
  `no_telp` bigint NOT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `customers` */

insert  into `customers`(`id`,`name`,`deposit`,`no_telp`,`address`,`created_at`,`updated_at`) values 
(1,'Tono',707735.00,8903123,'Solo','2025-09-05 14:00:32','2025-09-07 02:23:27'),
(2,'Umum',510897.00,0,'','2025-09-05 15:52:17','2025-09-07 02:15:55');

/*Table structure for table `delivery_notes` */

DROP TABLE IF EXISTS `delivery_notes`;

CREATE TABLE `delivery_notes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `delivery_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nomor surat jalan unik',
  `transaction_id` bigint unsigned DEFAULT NULL,
  `product_id` bigint unsigned NOT NULL,
  `warehouse_id` bigint unsigned NOT NULL,
  `toko_id` bigint unsigned NOT NULL,
  `qty_transferred` decimal(15,2) NOT NULL COMMENT 'Jumlah yang ditransfer (unit asli)',
  `unit` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Unit satuan (kg, sak, ton)',
  `qty_kg` decimal(15,2) NOT NULL COMMENT 'Jumlah dalam kg untuk konsistensi',
  `status` enum('pending','in_transit','delivered','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT 'Status pengiriman',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Catatan tambahan',
  `delivered_at` timestamp NULL DEFAULT NULL COMMENT 'Tanggal pengiriman',
  `created_by` bigint unsigned NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `delivery_notes_delivery_number_unique` (`delivery_number`),
  KEY `delivery_notes_product_id_foreign` (`product_id`),
  KEY `delivery_notes_toko_id_foreign` (`toko_id`),
  KEY `delivery_notes_created_by_foreign` (`created_by`),
  KEY `delivery_notes_transaction_id_product_id_index` (`transaction_id`,`product_id`),
  KEY `delivery_notes_warehouse_id_toko_id_index` (`warehouse_id`,`toko_id`),
  KEY `delivery_notes_status_created_at_index` (`status`,`created_at`),
  KEY `delivery_notes_delivery_number_index` (`delivery_number`),
  CONSTRAINT `delivery_notes_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `delivery_notes_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `delivery_notes_toko_id_foreign` FOREIGN KEY (`toko_id`) REFERENCES `tokos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `delivery_notes_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `delivery_notes_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `delivery_notes` */

/*Table structure for table `failed_jobs` */

DROP TABLE IF EXISTS `failed_jobs`;

CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `connection` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `failed_jobs` */

/*Table structure for table `jobs` */

DROP TABLE IF EXISTS `jobs`;

CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `jobs` */

/*Table structure for table `migrations` */

DROP TABLE IF EXISTS `migrations`;

CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `migrations` */

insert  into `migrations`(`id`,`migration`,`batch`) values 
(1,'0001_01_01_000000_create_users_table',1),
(2,'0001_01_01_000001_create_cache_table',1),
(3,'0001_01_01_000002_create_jobs_table',1),
(4,'0001_01_01_000900_create_units_table',1),
(5,'0001_01_01_000905_create_categories_table',1),
(6,'0001_01_01_000910_create_subcategories_table',1),
(7,'0001_01_01_000920_create_customers_table',1),
(8,'0001_01_01_000930_create_warehouses_table',1),
(9,'0001_01_01_001000_create_unit_conversions_table',1),
(10,'0001_01_01_001010_create_products_table',1),
(11,'0001_01_01_001020_create_suppliers_table',1),
(12,'0001_01_01_001030_create_barcodes_table',1),
(13,'0001_01_01_001040_create_stocks_table',1),
(14,'0001_01_01_001050_create_price_histories_table',1),
(15,'0001_01_01_001060_create_carts_table',1),
(16,'0001_01_01_001090_create_transactions_table',1),
(17,'0001_01_01_001092_create_profits_table',1),
(18,'0001_01_01_001095_create_transaction_details_table',1),
(19,'0001_01_01_001100_create_unit_details_table',1),
(20,'0001_01_01_001300_create_purchases_table',1),
(21,'0001_01_01_001301_create_purchase_items_table',1),
(22,'0001_01_01_001400_create_permissions_table',1),
(23,'0001_01_01_001500_create_roles_table',1),
(24,'0001_01_01_001600_create_model_has_permissions_table',1),
(25,'0001_01_01_001700_create_model_has_roles_table',1),
(26,'0001_01_01_001800_create_role_has_permissions_table',1),
(27,'0001_01_01_001900_create_failed_jobs_table',1),
(28,'0001_01_01_002000_create_password_resets_table',1),
(29,'0001_01_01_002100_create_personal_access_tokens_table',1),
(30,'0001_01_01_002200_create_sessions_table',1),
(31,'2025_07_30_065009_add_warehouse_id_to_purchases_table',1),
(32,'2025_07_30_070154_add_total_pembelian_to_purchases_table',1),
(33,'2025_07_30_070449_add_user_id_to_purchases_table',1),
(34,'2025_07_30_074333_add_purchase_date_to_stocks_table',1),
(35,'2025_07_30_074939_update_qty_column_in_stocks_table',1),
(36,'2025_07_30_081748_create_stock_cards_table',1),
(37,'2025_08_03_000001_add_kuli_fee_to_purchase_items_table',1),
(38,'2025_08_03_021136_add_avatar_to_users_table',1),
(39,'2025_08_03_add_cash_to_transactions_table',1),
(40,'2025_08_03_add_discount_to_transactions_table',1),
(41,'2025_08_03_add_is_deposit_to_transactions_table',1),
(42,'2025_08_03_add_is_tempo_to_transactions_table',1),
(43,'2025_08_03_add_warehouse_id_to_transaction_details_table',1),
(44,'2025_08_03_warehouse_id_to_transactions_table',1),
(45,'2025_08_04_135613_add_deposit_to_customers_table',1),
(46,'2025_08_07_000000_create_stok_tokos_table',1),
(47,'2025_08_07_000000_create_tokos_table',1),
(48,'2025_08_09_000001_add_toko_id_to_purchases_table',1),
(49,'2025_08_10_000001_add_timbangan_to_purchase_items_table',1),
(50,'2025_08_12_000001_drop_warehouse_id_from_stok_tokos_table',1),
(51,'2025_08_12_062227_add_toko_id_to_stok_tokos_table',1),
(52,'2025_08_12_100000_add_toko_id_to_stock_cards_table',1),
(53,'2025_08_12_warehouse_id_nullable_in_stock_cards',1),
(54,'2025_08_15_000001_add_no_urut_to_transactions_table',1),
(55,'2025_08_16_000001_add_user_id_to_stok_tokos_table',1),
(56,'2025_08_16_133800_add_sisa_stok_to_stok_tokos_table',1),
(57,'2025_08_18_000000_add_type_to_transactions_table',1),
(58,'2025_08_18_000001_add_category_to_products_table',1),
(59,'2025_08_18_000002_add_location_to_products_table',1),
(60,'2025_08_22_000000_create_surat_jalans_table',1),
(61,'2025_08_23_000000_add_force_gudang_view_to_users_table',1),
(62,'2025_08_23_000000_create_stock_requests_table',1),
(63,'2025_08_23_000001_add_picked_at_to_surat_jalans_table',1),
(64,'2025_08_23_133845_add_default_to_image_column_in_categories_table',1),
(65,'2025_08_24_000000_add_toko_pakai_to_carts_table',1),
(66,'2025_08_24_010000_add_toko_consumed_column_to_carts_table',1),
(67,'2025_08_24_200000_add_stok_toko_id_to_carts_table',1),
(68,'2025_08_26_000000_create_transaction_histories_table',1),
(69,'2025_08_27_120000_add_transaction_time_to_transaction_histories_table',1),
(70,'2025_08_30_194010_rename_qty_to_stok_gudang_in_stocks_table',1),
(71,'2025_08_30_200830_fix_foreign_key_before_stocks_recreation',1),
(72,'2025_08_30_200838_recreate_stocks_table_with_new_structure',1),
(73,'2025_08_30_201020_create_stock_movements_table',1),
(74,'2025_08_30_201353_migrate_data_to_new_stocks_structure',1),
(75,'2025_08_31_023558_add_toko_id_to_stock_movements_table',1),
(76,'2025_08_31_025433_add_soft_deletes_to_tokos_table',1),
(77,'2025_08_31_032221_create_delivery_notes_table',1),
(78,'2025_08_31_042239_create_warehouse_stocks_table',1),
(79,'2025_08_31_042301_create_store_stocks_table',1),
(80,'2025_08_31_063044_add_qty_allocation_to_purchase_items_table',1),
(81,'2025_08_31_104503_fix_foreign_key_before_stocks_recreation',1),
(82,'2025_08_31_105351_migrate_stocks_to_new_system',1),
(83,'2025_08_31_105929_drop_old_stock_tables',1),
(84,'2025_09_03_124011_add_toko_id_to_transaction_histories_table',1),
(85,'2025_09_04_060617_migrate_transaction_histories_warehouse_to_toko',1),
(86,'2025_09_04_062555_add_transaction_number_to_transactions_table',1),
(87,'2025_09_04_144307_remove_warehouse_id_from_transaction_histories_table',1),
(88,'2025_09_05_072328_add_purchase_sale_details_to_transaction_histories_table',1),
(89,'2025_09_06_042646_make_transaction_id_nullable_in_delivery_notes_table',2),
(90,'2025_09_07_025957_add_location_fields_to_users_table',2);

/*Table structure for table `model_has_permissions` */

DROP TABLE IF EXISTS `model_has_permissions`;

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint unsigned NOT NULL,
  `model_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`),
  CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `model_has_permissions` */

insert  into `model_has_permissions`(`permission_id`,`model_type`,`model_id`) values 
(1,'App\\Models\\User',1),
(2,'App\\Models\\User',1),
(3,'App\\Models\\User',1),
(4,'App\\Models\\User',1),
(5,'App\\Models\\User',1),
(6,'App\\Models\\User',1),
(7,'App\\Models\\User',1),
(8,'App\\Models\\User',1),
(9,'App\\Models\\User',1),
(10,'App\\Models\\User',1),
(11,'App\\Models\\User',1),
(12,'App\\Models\\User',1),
(13,'App\\Models\\User',1),
(14,'App\\Models\\User',1),
(15,'App\\Models\\User',1),
(16,'App\\Models\\User',1),
(17,'App\\Models\\User',1),
(18,'App\\Models\\User',1),
(19,'App\\Models\\User',1),
(20,'App\\Models\\User',1),
(21,'App\\Models\\User',1),
(22,'App\\Models\\User',1),
(23,'App\\Models\\User',1),
(24,'App\\Models\\User',1),
(25,'App\\Models\\User',1),
(26,'App\\Models\\User',1),
(27,'App\\Models\\User',1),
(28,'App\\Models\\User',1),
(29,'App\\Models\\User',1),
(30,'App\\Models\\User',1),
(31,'App\\Models\\User',1),
(32,'App\\Models\\User',1),
(33,'App\\Models\\User',1),
(34,'App\\Models\\User',1),
(35,'App\\Models\\User',1),
(36,'App\\Models\\User',1),
(37,'App\\Models\\User',1),
(38,'App\\Models\\User',1),
(39,'App\\Models\\User',1),
(40,'App\\Models\\User',1),
(41,'App\\Models\\User',1),
(42,'App\\Models\\User',1),
(43,'App\\Models\\User',1),
(44,'App\\Models\\User',1),
(45,'App\\Models\\User',1),
(46,'App\\Models\\User',1),
(47,'App\\Models\\User',1),
(48,'App\\Models\\User',1),
(49,'App\\Models\\User',1),
(50,'App\\Models\\User',1),
(51,'App\\Models\\User',1),
(52,'App\\Models\\User',1),
(53,'App\\Models\\User',1),
(54,'App\\Models\\User',1),
(55,'App\\Models\\User',1),
(56,'App\\Models\\User',1),
(57,'App\\Models\\User',1),
(58,'App\\Models\\User',1),
(59,'App\\Models\\User',1),
(60,'App\\Models\\User',1),
(61,'App\\Models\\User',1),
(62,'App\\Models\\User',1),
(63,'App\\Models\\User',1),
(64,'App\\Models\\User',1),
(65,'App\\Models\\User',1),
(66,'App\\Models\\User',1),
(67,'App\\Models\\User',1),
(68,'App\\Models\\User',1),
(69,'App\\Models\\User',1),
(70,'App\\Models\\User',1),
(71,'App\\Models\\User',1),
(69,'App\\Models\\User',2);

/*Table structure for table `model_has_roles` */

DROP TABLE IF EXISTS `model_has_roles`;

CREATE TABLE `model_has_roles` (
  `role_id` bigint unsigned NOT NULL,
  `model_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`),
  CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `model_has_roles` */

insert  into `model_has_roles`(`role_id`,`model_type`,`model_id`) values 
(8,'App\\Models\\User',1),
(9,'App\\Models\\User',2),
(12,'App\\Models\\User',2),
(9,'App\\Models\\User',3),
(12,'App\\Models\\User',3);

/*Table structure for table `password_resets` */

DROP TABLE IF EXISTS `password_resets`;

CREATE TABLE `password_resets` (
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  KEY `password_resets_email_index` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `password_resets` */

/*Table structure for table `permissions` */

DROP TABLE IF EXISTS `permissions`;

CREATE TABLE `permissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `permissions` */

insert  into `permissions`(`id`,`name`,`guard_name`,`created_at`,`updated_at`) values 
(1,'dashboard-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(2,'users-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(3,'users-create','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(4,'users-update','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(5,'users-delete','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(6,'roles-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(7,'roles-create','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(8,'roles-update','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(9,'roles-delete','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(10,'permissions-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(11,'permissions-create','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(12,'permissions-update','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(13,'permissions-delete','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(14,'categories-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(15,'categories-create','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(16,'categories-edit','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(17,'categories-delete','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(18,'subcategories-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(19,'subcategories-create','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(20,'subcategories-edit','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(21,'subcategories-delete','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(22,'products-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(23,'products-create','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(24,'products-edit','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(25,'products-delete','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(26,'customers-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(27,'customers-create','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(28,'customers-edit','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(29,'customers-delete','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(30,'suppliers-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(31,'suppliers-create','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(32,'suppliers-edit','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(33,'suppliers-delete','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(34,'units-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(35,'units-create','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(36,'units-edit','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(37,'units-delete','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(38,'transactions-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(39,'transactions-create','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(40,'transactions-edit','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(41,'transactions-delete','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(42,'purchases-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(43,'purchases-create','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(44,'purchases-edit','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(45,'purchases-delete','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(46,'transaction-histories-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(47,'transaction-histories-create','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(48,'transaction-histories-edit','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(49,'transaction-histories-delete','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(50,'tokos-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(51,'tokos-create','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(52,'tokos-edit','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(53,'tokos-delete','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(54,'reports-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(55,'reports-create','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(56,'reports-edit','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(57,'reports-delete','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(58,'reports-export','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(59,'stock-view-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(60,'stocks.view.gudang','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(61,'stocks.view.toko','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(62,'warehouse.manage','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(63,'force-gudang-view','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(64,'stock-movements.view','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(65,'stock-movements.create','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(66,'stock-movements.edit','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(67,'stock-movements.delete','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(68,'stock-movements.manage','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(69,'transactions.sell','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(70,'transactions.purchase','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(71,'deliveries-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(72,'transactions.manage','web','2025-09-05 13:08:13','2025-09-05 13:08:13'),
(73,'purchases.manage','web','2025-09-05 13:08:13','2025-09-05 13:08:13'),
(74,'gudang','web','2025-09-06 17:11:11','2025-09-06 17:11:11'),
(75,'toko','web','2025-09-06 17:11:11','2025-09-06 17:11:11'),
(76,'report-transactions','web','2025-09-06 17:18:47','2025-09-06 17:18:47'),
(77,'reports.transactions','web','2025-09-06 17:22:36','2025-09-06 17:22:36');

/*Table structure for table `personal_access_tokens` */

DROP TABLE IF EXISTS `personal_access_tokens`;

CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `personal_access_tokens` */

/*Table structure for table `price_histories` */

DROP TABLE IF EXISTS `price_histories`;

CREATE TABLE `price_histories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `supplier_id` bigint unsigned NOT NULL,
  `price` decimal(16,2) NOT NULL,
  `date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `price_histories_product_id_foreign` (`product_id`),
  KEY `price_histories_supplier_id_foreign` (`supplier_id`),
  CONSTRAINT `price_histories_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `price_histories_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `price_histories` */

/*Table structure for table `products` */

DROP TABLE IF EXISTS `products`;

CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `category_id` bigint unsigned DEFAULT NULL,
  `unit_id` bigint unsigned DEFAULT NULL,
  `subcategory_id` bigint unsigned DEFAULT NULL,
  `barcode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `purchase_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `sell_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `min_stock` decimal(12,2) NOT NULL DEFAULT '0.00',
  `stock` double NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_barcode_unique` (`barcode`),
  KEY `products_category_id_foreign` (`category_id`),
  KEY `products_unit_id_foreign` (`unit_id`),
  KEY `products_subcategory_id_foreign` (`subcategory_id`),
  CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `products_subcategory_id_foreign` FOREIGN KEY (`subcategory_id`) REFERENCES `subcategories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `products_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `products` */

insert  into `products`(`id`,`category`,`location`,`name`,`description`,`category_id`,`unit_id`,`subcategory_id`,`barcode`,`purchase_price`,`sell_price`,`min_stock`,`stock`,`created_at`,`updated_at`,`deleted_at`) values 
(1,NULL,NULL,'Kelinci','ini beras kelinci',1,1,1,'BRC_1757079048729858',0.00,0.00,0.00,2450,'2025-09-05 13:30:48','2025-09-07 02:23:27',NULL);

/*Table structure for table `profits` */

DROP TABLE IF EXISTS `profits`;

CREATE TABLE `profits` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `transaction_id` bigint unsigned NOT NULL,
  `total` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `profits_transaction_id_foreign` (`transaction_id`),
  CONSTRAINT `profits_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `profits` */

insert  into `profits`(`id`,`transaction_id`,`total`,`created_at`,`updated_at`) values 
(9,9,750000,'2025-09-06 19:19:10','2025-09-06 19:19:10'),
(10,10,750000,'2025-09-07 02:23:27','2025-09-07 02:23:27');

/*Table structure for table `purchase_items` */

DROP TABLE IF EXISTS `purchase_items`;

CREATE TABLE `purchase_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `purchase_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned DEFAULT NULL,
  `subcategory_id` bigint unsigned DEFAULT NULL,
  `unit_id` bigint unsigned NOT NULL,
  `warehouse_id` bigint unsigned DEFAULT NULL,
  `qty` int NOT NULL,
  `qty_gudang` decimal(10,2) NOT NULL DEFAULT '0.00',
  `qty_toko` decimal(10,2) NOT NULL DEFAULT '0.00',
  `harga_pembelian` bigint NOT NULL DEFAULT '0',
  `subtotal` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `kuli_fee` bigint NOT NULL DEFAULT '0',
  `timbangan` decimal(15,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `purchase_items_purchase_id_foreign` (`purchase_id`),
  KEY `purchase_items_product_id_foreign` (`product_id`),
  KEY `purchase_items_category_id_foreign` (`category_id`),
  KEY `purchase_items_subcategory_id_foreign` (`subcategory_id`),
  KEY `purchase_items_unit_id_foreign` (`unit_id`),
  KEY `purchase_items_warehouse_id_foreign` (`warehouse_id`),
  CONSTRAINT `purchase_items_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `purchase_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `purchase_items_purchase_id_foreign` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  CONSTRAINT `purchase_items_subcategory_id_foreign` FOREIGN KEY (`subcategory_id`) REFERENCES `subcategories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `purchase_items_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`),
  CONSTRAINT `purchase_items_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `purchase_items` */

insert  into `purchase_items`(`id`,`purchase_id`,`product_id`,`category_id`,`subcategory_id`,`unit_id`,`warehouse_id`,`qty`,`qty_gudang`,`qty_toko`,`harga_pembelian`,`subtotal`,`created_at`,`updated_at`,`kuli_fee`,`timbangan`) values 
(2,2,1,1,1,1,NULL,2000,1000.00,1000.00,14000,28000000,'2025-09-06 18:50:30','2025-09-06 18:50:30',1000,5000.00);

/*Table structure for table `purchases` */

DROP TABLE IF EXISTS `purchases`;

CREATE TABLE `purchases` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `supplier_id` bigint unsigned NOT NULL,
  `warehouse_id` bigint unsigned DEFAULT NULL,
  `toko_id` bigint unsigned DEFAULT NULL,
  `purchase_date` date NOT NULL,
  `total_pembelian` bigint DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `invoice_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `purchases_invoice_number_unique` (`invoice_number`),
  KEY `purchases_supplier_id_foreign` (`supplier_id`),
  KEY `purchases_toko_id_foreign` (`toko_id`),
  CONSTRAINT `purchases_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchases_toko_id_foreign` FOREIGN KEY (`toko_id`) REFERENCES `tokos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `purchases` */

insert  into `purchases`(`id`,`supplier_id`,`warehouse_id`,`toko_id`,`purchase_date`,`total_pembelian`,`user_id`,`invoice_number`,`total`,`created_at`,`updated_at`) values 
(2,2,1,1,'2025-09-07',NULL,1,'PB-2025/09/07-001',28000000.00,'2025-09-06 18:50:30','2025-09-06 18:50:30');

/*Table structure for table `role_has_permissions` */

DROP TABLE IF EXISTS `role_has_permissions`;

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint unsigned NOT NULL,
  `role_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`permission_id`,`role_id`),
  KEY `role_has_permissions_role_id_foreign` (`role_id`),
  CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `role_has_permissions` */

insert  into `role_has_permissions`(`permission_id`,`role_id`) values 
(2,1),
(3,1),
(4,1),
(5,1),
(6,2),
(7,2),
(8,2),
(9,2),
(10,3),
(11,3),
(12,3),
(13,3),
(14,4),
(15,4),
(16,4),
(17,4),
(18,4),
(19,4),
(20,4),
(21,4),
(22,5),
(23,5),
(24,5),
(25,5),
(26,6),
(27,6),
(28,6),
(29,6),
(38,7),
(39,7),
(40,7),
(41,7),
(1,8),
(2,8),
(3,8),
(4,8),
(5,8),
(6,8),
(7,8),
(8,8),
(9,8),
(10,8),
(11,8),
(12,8),
(13,8),
(14,8),
(15,8),
(16,8),
(17,8),
(18,8),
(19,8),
(20,8),
(21,8),
(22,8),
(23,8),
(24,8),
(25,8),
(26,8),
(27,8),
(28,8),
(29,8),
(30,8),
(31,8),
(32,8),
(33,8),
(34,8),
(35,8),
(36,8),
(37,8),
(38,8),
(39,8),
(40,8),
(41,8),
(42,8),
(43,8),
(44,8),
(45,8),
(46,8),
(47,8),
(48,8),
(49,8),
(50,8),
(51,8),
(52,8),
(53,8),
(54,8),
(55,8),
(56,8),
(57,8),
(58,8),
(59,8),
(60,8),
(61,8),
(62,8),
(63,8),
(64,8),
(65,8),
(66,8),
(67,8),
(68,8),
(69,8),
(70,8),
(71,8),
(72,8),
(73,8),
(74,8),
(75,8),
(76,8),
(77,8),
(76,9),
(1,10),
(14,10),
(18,10),
(22,10),
(23,10),
(24,10),
(30,10),
(34,10),
(41,10),
(42,10),
(43,10),
(44,10),
(58,10),
(71,10),
(77,10),
(38,12),
(39,12),
(41,12),
(42,12),
(43,12),
(58,12),
(63,12),
(69,12),
(70,12),
(72,12),
(73,12),
(76,12),
(77,12);

/*Table structure for table `roles` */

DROP TABLE IF EXISTS `roles`;

CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `roles` */

insert  into `roles`(`id`,`name`,`guard_name`,`created_at`,`updated_at`) values 
(1,'users-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(2,'roles-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(3,'permission-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(4,'categories-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(5,'products-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(6,'customers-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(7,'transactions-access','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(8,'super-admin','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(9,'reports.transactions','web','2025-09-05 08:37:22','2025-09-06 17:13:37'),
(10,'Gudang','web','2025-09-05 08:37:22','2025-09-05 08:37:22'),
(12,'Toko','web','2025-09-06 17:17:31','2025-09-06 17:17:31');

/*Table structure for table `sessions` */

DROP TABLE IF EXISTS `sessions`;

CREATE TABLE `sessions` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `payload` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `sessions` */

insert  into `sessions`(`id`,`user_id`,`ip_address`,`user_agent`,`payload`,`last_activity`) values 
('7yRejFU9DmwO0E7vBAXqueCGiT69mENHp3vJLpzg',1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','YTo1OntzOjY6Il90b2tlbiI7czo0MDoidlJBc3IySXl0UDg3U2sycWNEaVFsRzZOc1lyZWhIM1pIMmtsaktDWSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mzc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9kYXNoYm9hcmQvdG9rb3MiO31zOjQ6InJvbGUiO3M6NDoiVG9rbyI7czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTt9',1757224332);

/*Table structure for table `stock_cards` */

DROP TABLE IF EXISTS `stock_cards`;

CREATE TABLE `stock_cards` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `warehouse_id` bigint unsigned DEFAULT NULL,
  `toko_id` bigint unsigned DEFAULT NULL,
  `unit_id` bigint unsigned DEFAULT NULL,
  `date` date NOT NULL,
  `type` enum('in','out','adjustment') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `qty` decimal(12,3) NOT NULL,
  `saldo` decimal(12,3) NOT NULL,
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `stock_cards_product_id_foreign` (`product_id`),
  KEY `stock_cards_warehouse_id_foreign` (`warehouse_id`),
  KEY `stock_cards_unit_id_foreign` (`unit_id`),
  KEY `stock_cards_user_id_foreign` (`user_id`),
  KEY `stock_cards_toko_id_foreign` (`toko_id`),
  CONSTRAINT `stock_cards_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `stock_cards_toko_id_foreign` FOREIGN KEY (`toko_id`) REFERENCES `tokos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `stock_cards_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL,
  CONSTRAINT `stock_cards_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `stock_cards_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `stock_cards` */

insert  into `stock_cards`(`id`,`product_id`,`warehouse_id`,`toko_id`,`unit_id`,`date`,`type`,`qty`,`saldo`,`note`,`user_id`,`created_at`,`updated_at`) values 
(11,1,1,NULL,1,'2025-09-07','in',1000.000,1000.000,'Pembelian #2',1,'2025-09-06 18:50:30','2025-09-06 18:50:30'),
(12,1,NULL,1,1,'2025-09-07','in',1000.000,1000.000,'Pembelian #2',1,'2025-09-06 18:50:30','2025-09-06 18:50:30'),
(13,1,NULL,1,1,'2025-09-06','out',50.000,950.000,'Penjualan #9',NULL,'2025-09-06 19:19:10','2025-09-06 19:19:10'),
(14,1,NULL,1,1,'2025-09-07','out',50.000,900.000,'Penjualan #10',NULL,'2025-09-07 02:23:27','2025-09-07 02:23:27');

/*Table structure for table `stock_movements` */

DROP TABLE IF EXISTS `stock_movements`;

CREATE TABLE `stock_movements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `warehouse_id` bigint unsigned DEFAULT NULL,
  `toko_id` bigint unsigned DEFAULT NULL,
  `type` enum('purchase','sale','transfer_in','transfer_out','adjustment') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity_in_kg` decimal(15,2) NOT NULL,
  `balance_after` decimal(15,2) NOT NULL,
  `reference_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint unsigned DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `stock_movements_warehouse_id_foreign` (`warehouse_id`),
  KEY `stock_movements_user_id_foreign` (`user_id`),
  KEY `stock_movements_product_id_warehouse_id_created_at_index` (`product_id`,`warehouse_id`,`created_at`),
  KEY `stock_movements_reference_type_reference_id_index` (`reference_type`,`reference_id`),
  KEY `stock_movements_toko_id_foreign` (`toko_id`),
  CONSTRAINT `stock_movements_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `stock_movements_toko_id_foreign` FOREIGN KEY (`toko_id`) REFERENCES `tokos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `stock_movements_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `stock_movements_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `stock_movements` */

insert  into `stock_movements`(`id`,`product_id`,`warehouse_id`,`toko_id`,`type`,`quantity_in_kg`,`balance_after`,`reference_type`,`reference_id`,`description`,`user_id`,`created_at`,`updated_at`) values 
(19,1,1,NULL,'purchase',1000.00,2000.00,'purchase',2,'Pembelian - PB-2025/09/07-001',1,'2025-09-06 18:50:30','2025-09-06 18:50:30'),
(20,1,NULL,1,'purchase',1000.00,1000.00,'purchase',2,'Pembelian - PB-2025/09/07-001',1,'2025-09-06 18:50:30','2025-09-06 18:50:30'),
(21,1,NULL,1,'sale',-50.00,950.00,'Transaction',9,'Penjualan dari stok toko',1,'2025-09-06 19:19:10','2025-09-06 19:19:10'),
(22,1,1,NULL,'sale',-50.00,950.00,'Transaction',9,'Penjualan #TRX-07/09/2025-001 (Gudang)',1,'2025-09-06 19:19:10','2025-09-06 19:19:10'),
(23,1,NULL,1,'sale',-50.00,900.00,'Transaction',10,'Penjualan dari stok toko',2,'2025-09-07 02:23:27','2025-09-07 02:23:27'),
(24,1,1,NULL,'sale',-50.00,950.00,'Transaction',10,'Penjualan #TRX-07/09/2025-002 (Gudang)',2,'2025-09-07 02:23:27','2025-09-07 02:23:27');

/*Table structure for table `stock_requests` */

DROP TABLE IF EXISTS `stock_requests`;

CREATE TABLE `stock_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `requester_id` bigint unsigned NOT NULL,
  `from_warehouse_id` bigint unsigned DEFAULT NULL,
  `to_toko_id` bigint unsigned DEFAULT NULL,
  `product_id` bigint unsigned NOT NULL,
  `unit_id` bigint unsigned DEFAULT NULL,
  `qty` decimal(16,4) NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `approved_by` bigint unsigned DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `stock_requests_requester_id_foreign` (`requester_id`),
  KEY `stock_requests_from_warehouse_id_foreign` (`from_warehouse_id`),
  KEY `stock_requests_to_toko_id_foreign` (`to_toko_id`),
  KEY `stock_requests_product_id_foreign` (`product_id`),
  KEY `stock_requests_unit_id_foreign` (`unit_id`),
  KEY `stock_requests_approved_by_foreign` (`approved_by`),
  CONSTRAINT `stock_requests_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `stock_requests_from_warehouse_id_foreign` FOREIGN KEY (`from_warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `stock_requests_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `stock_requests_requester_id_foreign` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `stock_requests_to_toko_id_foreign` FOREIGN KEY (`to_toko_id`) REFERENCES `tokos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `stock_requests_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `stock_requests` */

/*Table structure for table `store_stocks` */

DROP TABLE IF EXISTS `store_stocks`;

CREATE TABLE `store_stocks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `toko_id` bigint unsigned NOT NULL,
  `qty_in_kg` decimal(15,2) NOT NULL DEFAULT '0.00',
  `updated_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `store_stocks_product_id_toko_id_unique` (`product_id`,`toko_id`),
  KEY `store_stocks_toko_id_foreign` (`toko_id`),
  KEY `store_stocks_updated_by_foreign` (`updated_by`),
  KEY `store_stocks_product_id_toko_id_index` (`product_id`,`toko_id`),
  CONSTRAINT `store_stocks_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `store_stocks_toko_id_foreign` FOREIGN KEY (`toko_id`) REFERENCES `tokos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `store_stocks_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `store_stocks` */

insert  into `store_stocks`(`id`,`product_id`,`toko_id`,`qty_in_kg`,`updated_by`,`created_at`,`updated_at`) values 
(2,1,1,800.00,2,'2025-09-06 18:50:30','2025-09-07 02:23:27');

/*Table structure for table `subcategories` */

DROP TABLE IF EXISTS `subcategories`;

CREATE TABLE `subcategories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `category_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `subcategories_category_id_foreign` (`category_id`),
  CONSTRAINT `subcategories_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `subcategories` */

insert  into `subcategories`(`id`,`code`,`name`,`description`,`category_id`,`created_at`,`updated_at`) values 
(1,'C4','C4','ini beras c4',1,'2025-09-05 13:30:35','2025-09-05 13:30:35');

/*Table structure for table `suppliers` */

DROP TABLE IF EXISTS `suppliers`;

CREATE TABLE `suppliers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `suppliers` */

insert  into `suppliers`(`id`,`name`,`phone`,`address`,`created_at`,`updated_at`) values 
(2,'PT BULOG','02718888','Semarang','2025-09-05 11:24:34','2025-09-05 11:24:34');

/*Table structure for table `surat_jalans` */

DROP TABLE IF EXISTS `surat_jalans`;

CREATE TABLE `surat_jalans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `transaction_id` bigint unsigned DEFAULT NULL,
  `warehouse_id` bigint unsigned DEFAULT NULL,
  `toko_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `no_surat` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `picked_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `surat_jalans_transaction_id_foreign` (`transaction_id`),
  KEY `surat_jalans_warehouse_id_foreign` (`warehouse_id`),
  KEY `surat_jalans_toko_id_foreign` (`toko_id`),
  KEY `surat_jalans_user_id_foreign` (`user_id`),
  CONSTRAINT `surat_jalans_toko_id_foreign` FOREIGN KEY (`toko_id`) REFERENCES `tokos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `surat_jalans_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `surat_jalans_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `surat_jalans_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `surat_jalans` */

insert  into `surat_jalans`(`id`,`transaction_id`,`warehouse_id`,`toko_id`,`user_id`,`no_surat`,`notes`,`status`,`picked_at`,`created_at`,`updated_at`) values 
(1,NULL,1,NULL,2,'AUTO-SJ-20250905140038-1','Auto-created by SuratJalanService','pending',NULL,'2025-09-05 14:00:38','2025-09-05 14:00:38'),
(2,NULL,1,NULL,1,'AUTO-SJ-20250905153503-2','Auto-created by SuratJalanService','pending',NULL,'2025-09-05 15:35:03','2025-09-05 15:35:03'),
(3,NULL,1,NULL,1,'AUTO-SJ-20250905154743-3','Auto-created by SuratJalanService','pending',NULL,'2025-09-05 15:47:43','2025-09-05 15:47:43'),
(4,NULL,1,NULL,1,'AUTO-SJ-20250905155040-4','Auto-created by SuratJalanService','pending',NULL,'2025-09-05 15:50:40','2025-09-05 15:50:40'),
(5,NULL,1,NULL,1,'AUTO-SJ-20250905155217-5','Auto-created by SuratJalanService','pending',NULL,'2025-09-05 15:52:17','2025-09-05 15:52:17'),
(6,NULL,1,NULL,2,'AUTO-SJ-20250906174317-6','Auto-created by SuratJalanService','pending',NULL,'2025-09-06 17:43:17','2025-09-06 17:43:17'),
(7,NULL,1,NULL,2,'AUTO-SJ-20250906181744-7','Auto-created by SuratJalanService','pending',NULL,'2025-09-06 18:17:44','2025-09-06 18:17:44'),
(8,NULL,1,NULL,1,'AUTO-SJ-20250906184345-8','Auto-created by SuratJalanService','pending',NULL,'2025-09-06 18:43:45','2025-09-06 18:43:45'),
(9,9,1,NULL,1,'AUTO-SJ-20250906191910-9','Auto-created by SuratJalanService','pending',NULL,'2025-09-06 19:19:10','2025-09-06 19:19:10'),
(10,10,1,NULL,2,'AUTO-SJ-20250907022327-10','Auto-created by SuratJalanService','pending',NULL,'2025-09-07 02:23:27','2025-09-07 02:23:27');

/*Table structure for table `tokos` */

DROP TABLE IF EXISTS `tokos`;

CREATE TABLE `tokos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `tokos` */

insert  into `tokos`(`id`,`name`,`address`,`phone`,`description`,`created_at`,`updated_at`,`deleted_at`) values 
(1,'toko 85','Widuran','089564442','test','2025-09-05 09:31:07','2025-09-05 09:31:07',NULL);

/*Table structure for table `transaction_details` */

DROP TABLE IF EXISTS `transaction_details`;

CREATE TABLE `transaction_details` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `transaction_id` bigint unsigned NOT NULL,
  `warehouse_id` bigint unsigned DEFAULT NULL,
  `product_id` bigint unsigned NOT NULL,
  `unit_id` bigint unsigned DEFAULT NULL,
  `stock_id` bigint unsigned DEFAULT NULL,
  `qty` int NOT NULL,
  `price` bigint NOT NULL,
  `subtotal` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transaction_details_transaction_id_foreign` (`transaction_id`),
  KEY `transaction_details_product_id_foreign` (`product_id`),
  KEY `transaction_details_unit_id_foreign` (`unit_id`),
  KEY `transaction_details_stock_id_foreign` (`stock_id`),
  KEY `transaction_details_warehouse_id_foreign` (`warehouse_id`),
  CONSTRAINT `transaction_details_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `transaction_details_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transaction_details_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`),
  CONSTRAINT `transaction_details_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `transaction_details` */

insert  into `transaction_details`(`id`,`transaction_id`,`warehouse_id`,`product_id`,`unit_id`,`stock_id`,`qty`,`price`,`subtotal`,`created_at`,`updated_at`) values 
(9,9,1,1,1,NULL,50,15000,750000,'2025-09-06 19:19:10','2025-09-06 19:19:10'),
(10,10,1,1,1,NULL,50,15000,750000,'2025-09-07 02:23:27','2025-09-07 02:23:27');

/*Table structure for table `transaction_histories` */

DROP TABLE IF EXISTS `transaction_histories`;

CREATE TABLE `transaction_histories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `transaction_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_type` enum('purchase','sale','return','transfer','adjustment') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_date` datetime NOT NULL,
  `transaction_time` time DEFAULT NULL,
  `related_party` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `toko_id` bigint unsigned DEFAULT NULL,
  `product_id` bigint unsigned NOT NULL,
  `quantity` decimal(16,3) NOT NULL,
  `unit` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(14,3) DEFAULT NULL,
  `subtotal` decimal(18,3) DEFAULT NULL,
  `kuli_fee` decimal(14,3) DEFAULT NULL,
  `timbangan` decimal(16,3) DEFAULT NULL,
  `discount` decimal(14,3) DEFAULT NULL,
  `deposit_amount` decimal(14,3) DEFAULT NULL,
  `stock_before` decimal(18,3) NOT NULL,
  `stock_after` decimal(18,3) NOT NULL,
  `payment_status` enum('unpaid','partial','paid') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_histories_transaction_number_unique` (`transaction_number`),
  KEY `transaction_histories_product_id_foreign` (`product_id`),
  KEY `transaction_histories_created_by_foreign` (`created_by`),
  KEY `transaction_histories_toko_id_foreign` (`toko_id`),
  CONSTRAINT `transaction_histories_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transaction_histories_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transaction_histories_toko_id_foreign` FOREIGN KEY (`toko_id`) REFERENCES `tokos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `transaction_histories` */

insert  into `transaction_histories`(`id`,`transaction_number`,`transaction_type`,`transaction_date`,`transaction_time`,`related_party`,`toko_id`,`product_id`,`quantity`,`unit`,`price`,`subtotal`,`kuli_fee`,`timbangan`,`discount`,`deposit_amount`,`stock_before`,`stock_after`,`payment_status`,`notes`,`created_by`,`created_at`,`updated_at`) values 
(10,'PB-2025/09/07-001-2','purchase','2025-09-07 00:00:00','01:50:30','PT BULOG',1,1,2000.000,'kg',14000.000,28000000.000,1000.000,5000.000,NULL,NULL,2550.000,2550.000,NULL,'Auto-recorded from Purchase #2',1,'2025-09-06 18:50:30','2025-09-06 18:50:30'),
(11,'TRX-07/09/2025-001','sale','2025-09-07 00:00:00','02:19:10','Tono',NULL,1,50.000,'kg',15000.000,750000.000,NULL,NULL,0.000,210050.000,2500.000,2450.000,'paid','Auto-recorded from Transaction #9',1,'2025-09-06 19:19:10','2025-09-06 19:19:10'),
(12,'TRX-07/09/2025-002','sale','2025-09-07 00:00:00','09:23:27','Tono',NULL,1,50.000,'kg',15000.000,750000.000,NULL,NULL,0.000,250000.000,2450.000,2400.000,'paid','Auto-recorded from Transaction #10',2,'2025-09-07 02:23:27','2025-09-07 02:23:27');

/*Table structure for table `transactions` */

DROP TABLE IF EXISTS `transactions`;

CREATE TABLE `transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `no_urut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_id` bigint unsigned DEFAULT NULL,
  `warehouse_id` bigint unsigned DEFAULT NULL,
  `cashier_id` bigint unsigned NOT NULL,
  `total` decimal(16,2) NOT NULL DEFAULT '0.00',
  `grand_total` decimal(16,2) NOT NULL DEFAULT '0.00',
  `cash` decimal(16,2) NOT NULL DEFAULT '0.00',
  `payment` decimal(16,2) NOT NULL DEFAULT '0.00',
  `change` decimal(16,2) NOT NULL DEFAULT '0.00',
  `discount` decimal(16,2) NOT NULL DEFAULT '0.00',
  `invoice` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_tempo` tinyint(1) NOT NULL DEFAULT '0',
  `tempo_due_date` date DEFAULT NULL,
  `is_deposit` tinyint(1) NOT NULL DEFAULT '0',
  `deposit_amount` decimal(16,2) NOT NULL DEFAULT '0.00',
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transactions_customer_id_foreign` (`customer_id`),
  KEY `transactions_cashier_id_foreign` (`cashier_id`),
  KEY `transactions_warehouse_id_foreign` (`warehouse_id`),
  CONSTRAINT `transactions_cashier_id_foreign` FOREIGN KEY (`cashier_id`) REFERENCES `users` (`id`),
  CONSTRAINT `transactions_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transactions_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `transactions` */

insert  into `transactions`(`id`,`type`,`no_urut`,`transaction_number`,`customer_id`,`warehouse_id`,`cashier_id`,`total`,`grand_total`,`cash`,`payment`,`change`,`discount`,`invoice`,`payment_method`,`is_tempo`,`tempo_due_date`,`is_deposit`,`deposit_amount`,`status`,`created_at`,`updated_at`) values 
(9,NULL,'1','TRX-07/09/2025-001',1,1,1,0.00,750000.00,5000000.00,0.00,4460050.00,0.00,'TRX-07/09/2025-001','deposit',0,NULL,1,210050.00,NULL,'2025-09-06 19:19:10','2025-09-06 19:19:10'),
(10,NULL,'2','TRX-07/09/2025-002',1,1,2,0.00,750000.00,550000.00,0.00,50000.00,0.00,'TRX-07/09/2025-002','deposit',0,NULL,1,250000.00,NULL,'2025-09-07 02:23:27','2025-09-07 02:23:27');

/*Table structure for table `unit_conversions` */

DROP TABLE IF EXISTS `unit_conversions`;

CREATE TABLE `unit_conversions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `from_unit_id` bigint unsigned NOT NULL,
  `to_unit_id` bigint unsigned NOT NULL,
  `conversion_value` decimal(15,8) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `unit_conversions_from_unit_id_foreign` (`from_unit_id`),
  KEY `unit_conversions_to_unit_id_foreign` (`to_unit_id`),
  CONSTRAINT `unit_conversions_from_unit_id_foreign` FOREIGN KEY (`from_unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE,
  CONSTRAINT `unit_conversions_to_unit_id_foreign` FOREIGN KEY (`to_unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `unit_conversions` */

/*Table structure for table `unit_details` */

DROP TABLE IF EXISTS `unit_details`;

CREATE TABLE `unit_details` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `unit_id` bigint unsigned NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `abbreviation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `unit_details_unit_id_foreign` (`unit_id`),
  CONSTRAINT `unit_details_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `unit_details` */

/*Table structure for table `units` */

DROP TABLE IF EXISTS `units`;

CREATE TABLE `units` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `symbol` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conversion_to_kg` decimal(15,4) NOT NULL DEFAULT '1.0000',
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `units` */

insert  into `units`(`id`,`name`,`symbol`,`conversion_to_kg`,`is_default`,`created_at`,`updated_at`) values 
(1,'kg',NULL,1.0000,1,NULL,NULL),
(2,'sak',NULL,25.0000,0,NULL,NULL),
(3,'ton',NULL,1000.0000,0,NULL,NULL),
(4,'inner',NULL,2.5000,0,NULL,NULL);

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `force_gudang_view` tinyint(1) NOT NULL DEFAULT '0',
  `warehouse_id` bigint unsigned DEFAULT NULL,
  `toko_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_warehouse_id_foreign` (`warehouse_id`),
  KEY `users_toko_id_foreign` (`toko_id`),
  CONSTRAINT `users_toko_id_foreign` FOREIGN KEY (`toko_id`) REFERENCES `tokos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `users` */

insert  into `users`(`id`,`name`,`email`,`email_verified_at`,`password`,`remember_token`,`force_gudang_view`,`warehouse_id`,`toko_id`,`created_at`,`updated_at`,`avatar`) values 
(1,'Administrator','admin@admin.com',NULL,'$2y$12$fP8MQYYGgUWWxju1IP08P.6clRzEEXPWn/tF2TqkBaEKVPQXNCi6.',NULL,0,NULL,NULL,'2025-09-05 08:37:23','2025-09-05 08:37:23',NULL),
(2,'admin','admin_user@example.test',NULL,'$2y$12$x7UBAZd6jnwf6.adeBIpg.JKX7bGds1SsEvoKeHdi1eOGbdlD33FW',NULL,0,NULL,1,'2025-09-05 11:18:37','2025-09-07 03:01:12',NULL),
(3,'kasir','kasir@gmail.com',NULL,'$2y$12$JHyOb/bfm0yAPpJaPhL.A.KqJulxPDDlZAjDIP0iEnEdPGZ/cjMlm',NULL,0,NULL,1,'2025-09-06 14:07:20','2025-09-07 03:01:12',NULL);

/*Table structure for table `warehouse_stocks` */

DROP TABLE IF EXISTS `warehouse_stocks`;

CREATE TABLE `warehouse_stocks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `warehouse_id` bigint unsigned NOT NULL,
  `qty_in_kg` decimal(15,2) NOT NULL DEFAULT '0.00',
  `updated_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `warehouse_stocks_product_id_warehouse_id_unique` (`product_id`,`warehouse_id`),
  KEY `warehouse_stocks_warehouse_id_foreign` (`warehouse_id`),
  KEY `warehouse_stocks_updated_by_foreign` (`updated_by`),
  KEY `warehouse_stocks_product_id_warehouse_id_index` (`product_id`,`warehouse_id`),
  CONSTRAINT `warehouse_stocks_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `warehouse_stocks_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `warehouse_stocks_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `warehouse_stocks` */

insert  into `warehouse_stocks`(`id`,`product_id`,`warehouse_id`,`qty_in_kg`,`updated_by`,`created_at`,`updated_at`) values 
(1,1,1,1000.00,1,'2025-09-05 13:31:49','2025-09-06 18:50:30');

/*Table structure for table `warehouses` */

DROP TABLE IF EXISTS `warehouses`;

CREATE TABLE `warehouses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'gudang',
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `warehouses` */

insert  into `warehouses`(`id`,`name`,`type`,`code`,`phone`,`address`,`description`,`created_at`,`updated_at`) values 
(1,'Gudang Widuran','gudang','GDNG-WDR','02718877','Widuran - Jebres','test','2025-09-05 09:34:58','2025-09-05 09:34:58');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
