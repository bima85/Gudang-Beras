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
(26,'App\\Models\\User',2),
(1,'App\\Models\\User',7),
(2,'App\\Models\\User',7),
(3,'App\\Models\\User',7),
(4,'App\\Models\\User',7),
(5,'App\\Models\\User',7),
(6,'App\\Models\\User',7),
(7,'App\\Models\\User',7),
(8,'App\\Models\\User',7),
(9,'App\\Models\\User',7),
(10,'App\\Models\\User',7),
(11,'App\\Models\\User',7),
(12,'App\\Models\\User',7),
(13,'App\\Models\\User',7),
(14,'App\\Models\\User',7),
(15,'App\\Models\\User',7),
(16,'App\\Models\\User',7),
(17,'App\\Models\\User',7),
(18,'App\\Models\\User',7),
(19,'App\\Models\\User',7),
(20,'App\\Models\\User',7),
(21,'App\\Models\\User',7),
(22,'App\\Models\\User',7),
(23,'App\\Models\\User',7),
(24,'App\\Models\\User',7),
(25,'App\\Models\\User',7),
(26,'App\\Models\\User',7),
(26,'App\\Models\\User',8),
(1,'App\\Models\\User',9),
(2,'App\\Models\\User',9),
(3,'App\\Models\\User',9),
(4,'App\\Models\\User',9),
(5,'App\\Models\\User',9),
(6,'App\\Models\\User',9),
(7,'App\\Models\\User',9),
(8,'App\\Models\\User',9),
(9,'App\\Models\\User',9),
(10,'App\\Models\\User',9),
(11,'App\\Models\\User',9),
(12,'App\\Models\\User',9),
(13,'App\\Models\\User',9),
(14,'App\\Models\\User',9),
(15,'App\\Models\\User',9),
(16,'App\\Models\\User',9),
(17,'App\\Models\\User',9),
(18,'App\\Models\\User',9),
(19,'App\\Models\\User',9),
(20,'App\\Models\\User',9),
(21,'App\\Models\\User',9),
(22,'App\\Models\\User',9),
(23,'App\\Models\\User',9),
(24,'App\\Models\\User',9),
(25,'App\\Models\\User',9),
(26,'App\\Models\\User',9),
(26,'App\\Models\\User',10);

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
(7,'App\\Models\\User',6),
(8,'App\\Models\\User',7),
(8,'App\\Models\\User',9);

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
(18,5),
(19,5),
(20,5),
(21,5),
(22,6),
(23,6),
(24,6),
(25,6),
(26,7);

/*Table structure for table `roles` */

DROP TABLE IF EXISTS `roles`;

CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `roles` */

insert  into `roles`(`id`,`name`,`guard_name`,`created_at`,`updated_at`) values 
(1,'users-access','web','2025-07-22 09:57:41','2025-07-22 09:57:41'),
(2,'roles-access','web','2025-07-22 09:57:41','2025-07-22 09:57:41'),
(3,'permission-access','web','2025-07-22 09:57:41','2025-07-22 09:57:41'),
(4,'categories-access','web','2025-07-22 09:57:41','2025-07-22 09:57:41'),
(5,'products-access','web','2025-07-22 09:57:41','2025-07-22 09:57:41'),
(6,'customers-access','web','2025-07-22 09:57:41','2025-07-22 09:57:41'),
(7,'transactions-access','web','2025-07-22 09:57:41','2025-07-22 09:57:41'),
(8,'super-admin','web','2025-07-22 09:57:41','2025-07-22 09:57:41');

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `users` */

insert  into `users`(`id`,`name`,`avatar`,`email`,`email_verified_at`,`password`,`remember_token`,`created_at`,`updated_at`) values 
(1,'Bima Rigantara',NULL,'admin@admin.com',NULL,'$2y$12$fCbZ8sZaIA00wrfBjv1cTeiJO4.M3rsdQwzQ2nb1jLjZJ9bqpZqIC',NULL,'2025-07-22 09:57:41','2025-07-22 09:57:41'),
(2,'Cashier',NULL,'cashier@gmail.com',NULL,'$2y$12$Aiu60iO3EhILTNhb/GujjujlVOUEKJUlLEgIv1n8Saa5.kfLNO7yS',NULL,'2025-07-22 09:57:41','2025-07-22 09:57:41'),
(3,'kasir',NULL,'kasir@kasir.com',NULL,'$2y$12$H3KVpKnoqdV27tQ3I4Xqc.eWtLWTRqSjtXHv5mbZscxT0TPRDMMtO',NULL,'2025-08-02 15:42:41','2025-08-02 15:42:41'),
(6,'Yohe',NULL,'yohe@yohe.com',NULL,'$2y$12$x72VL14EQgLvUmd7dZ464eboN3.Ff40.3JlCWl1Q/SYfSY1zOS3Pq',NULL,'2025-08-02 16:02:30','2025-08-02 16:02:30'),
(7,'Administrator',NULL,'administrator@administrator.com',NULL,'$2y$12$3PQFnT541XPbuow3cvY1KOxSKp.Y96rBePuodswh4m14TPT05xHP2',NULL,'2025-08-02 16:24:40','2025-08-02 16:24:40'),
(8,'Wulan',NULL,'wulan@gmail.com',NULL,'$2y$12$RmCtJ89XbbUJcItgTGMaQuHY6wbNYF8fEVETctFZtuLnB6p.K.Euy',NULL,'2025-08-02 16:24:40','2025-08-02 16:24:40'),
(9,'bima',NULL,'bima@bima.com',NULL,'$2y$12$cnI936o7o/aikKqEEa1Y3uT4hhTq.y8nWUFhM6QlrBJsV3p2h5Goa',NULL,'2025-08-02 16:41:07','2025-08-02 16:41:07'),
(10,'evan',NULL,'evan@gmail.com',NULL,'$2y$12$UWH7lcoGalfObXg4HSIgnerShWso7nSnthAdXGaBoEDKX9uAaIVMe',NULL,'2025-08-02 16:41:07','2025-08-02 16:41:07'),
(11,'stevanus',NULL,'stevanus@gmail.com',NULL,'$2y$12$218N6.QVpXD8Y8pVOoAxlOTwuzd0P/HHDV15Tv3gK5cz6Rs1TcANK',NULL,'2025-08-02 16:51:46','2025-08-02 16:51:46');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
