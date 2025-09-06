<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;

class DatabaseBackup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:backup {--compress : Compress the backup file}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a backup of the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔄 Starting database backup...');

        $database = config('database.connections.mysql.database');
        $timestamp = now()->format('Y-m-d_H-i-s');
        $filename = "backup_{$database}_{$timestamp}.sql";

        $this->info("📊 Database: {$database}");
        $this->info("📁 Backup file: {$filename}");
        $this->info("⏱️  Timestamp: {$timestamp}");
        $this->newLine();

        try {
            // Create backup directory if it doesn't exist
            $backupPath = storage_path('app/backups/database');
            if (!is_dir($backupPath)) {
                mkdir($backupPath, 0755, true);
                $this->info("✅ Created backup directory: {$backupPath}");
            }

            $filePath = $backupPath . '/' . $filename;

            // Get database configuration
            $host = config('database.connections.mysql.host');
            $port = config('database.connections.mysql.port');
            $username = config('database.connections.mysql.username');
            $password = config('database.connections.mysql.password');

            // Try to find mysqldump in common locations
            $mysqldumpPaths = [
                'mysqldump',
                'C:\xampp\mysql\bin\mysqldump.exe',
                'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe',
                'C:\Program Files\MySQL\MySQL Server 5.7\bin\mysqldump.exe',
                'C:\mysql\bin\mysqldump.exe',
                'C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysqldump.exe',
                '"C:\Program Files\Herd\resources\mysql\bin\mysqldump.exe"'
            ];

            $mysqldumpPath = null;
            foreach ($mysqldumpPaths as $path) {
                $testCommand = $path . ' --version 2>nul';
                exec($testCommand, $output, $returnVar);
                if ($returnVar === 0) {
                    $mysqldumpPath = $path;
                    $this->info("✅ Found mysqldump at: {$path}");
                    break;
                }
            }

            if ($mysqldumpPath) {
                // Use mysqldump
                $command = sprintf(
                    '%s --host=%s --port=%s --user=%s --single-transaction --routines --triggers --add-drop-table --add-locks --extended-insert --quick --lock-tables=false %s > "%s"',
                    $mysqldumpPath,
                    $host,
                    $port,
                    $username,
                    $database,
                    $filePath
                );

                // Add password if not empty
                if (!empty($password)) {
                    $command = sprintf(
                        '%s --host=%s --port=%s --user=%s --password=%s --single-transaction --routines --triggers --add-drop-table --add-locks --extended-insert --quick --lock-tables=false %s > "%s"',
                        $mysqldumpPath,
                        $host,
                        $port,
                        $username,
                        $password,
                        $database,
                        $filePath
                    );
                }

                $this->info("🔄 Running mysqldump...");
                exec($command . ' 2>&1', $output, $returnVar);

                if ($returnVar === 0 && file_exists($filePath) && filesize($filePath) > 0) {
                    $this->info("✅ Backup completed using mysqldump!");
                } else {
                    throw new \Exception("Mysqldump failed: " . implode("\n", $output));
                }
            } else {
                // Fallback to Laravel-based backup
                $this->warn("⚠️  mysqldump not found, using Laravel-based backup...");
                $this->createLaravelBackup($filePath);
            }

            // Show file information
            $fileSize = $this->formatBytes(filesize($filePath));
            $this->info("📁 File: {$filePath}");
            $this->info("📊 Size: {$fileSize}");

            // Compress if requested
            if ($this->option('compress')) {
                $this->info("🗜️  Compressing backup...");
                $this->compressBackup($filePath);
            }

            // List recent backups
            $this->showRecentBackups($backupPath);

            $this->newLine();
            $this->info("🎉 Database backup completed successfully!");
            $this->showRestoreInstructions($filePath, $database, $username);
        } catch (\Exception $e) {
            $this->error("❌ Backup failed: " . $e->getMessage());
            return 1;
        }

        return 0;
    }

    private function createLaravelBackup($filePath)
    {
        $this->info("🔄 Creating Laravel-based backup...");

        $sql = "-- Laravel Database Backup\n";
        $sql .= "-- Generated: " . now()->format('Y-m-d H:i:s') . "\n";
        $sql .= "-- Database: " . config('database.connections.mysql.database') . "\n\n";

        $sql .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

        // Get all tables
        $tables = DB::select('SHOW TABLES');
        $databaseName = config('database.connections.mysql.database');
        $tableKey = "Tables_in_{$databaseName}";

        foreach ($tables as $table) {
            $tableName = $table->$tableKey;
            $this->info("📄 Backing up table: {$tableName}");

            // Get table structure
            $createTable = DB::select("SHOW CREATE TABLE `{$tableName}`")[0];
            $sql .= "-- Table structure for table `{$tableName}`\n";
            $sql .= "DROP TABLE IF EXISTS `{$tableName}`;\n";
            $sql .= $createTable->{'Create Table'} . ";\n\n";

            // Get table data
            $rows = DB::table($tableName)->get();
            if ($rows->count() > 0) {
                $sql .= "-- Dumping data for table `{$tableName}`\n";
                $sql .= "LOCK TABLES `{$tableName}` WRITE;\n";

                $values = [];
                foreach ($rows as $row) {
                    $rowArray = (array) $row;
                    $escapedValues = array_map(function ($value) {
                        if (is_null($value)) {
                            return 'NULL';
                        }
                        return "'" . addslashes($value) . "'";
                    }, $rowArray);
                    $values[] = '(' . implode(',', $escapedValues) . ')';
                }

                $columns = '(`' . implode('`,`', array_keys((array) $rows->first())) . '`)';
                $sql .= "INSERT INTO `{$tableName}` {$columns} VALUES\n";
                $sql .= implode(",\n", $values) . ";\n";
                $sql .= "UNLOCK TABLES;\n\n";
            }
        }

        $sql .= "SET FOREIGN_KEY_CHECKS=1;\n";

        file_put_contents($filePath, $sql);
        $this->info("✅ Laravel-based backup completed!");
    }

    private function compressBackup($filePath)
    {
        if (function_exists('gzencode')) {
            $sqlContent = file_get_contents($filePath);
            $compressed = gzencode($sqlContent, 9);
            $gzipFile = $filePath . '.gz';
            file_put_contents($gzipFile, $compressed);

            $originalSize = filesize($filePath);
            $compressedSize = filesize($gzipFile);
            $compressionRatio = round((1 - $compressedSize / $originalSize) * 100, 1);

            $this->info("📦 Compressed: {$gzipFile}");
            $this->info("📊 Compressed size: " . $this->formatBytes($compressedSize) . " ({$compressionRatio}% compression)");
        } else {
            $this->warn("⚠️  Compression not available (gzencode function not found)");
        }
    }

    private function showRecentBackups($backupPath)
    {
        $this->newLine();
        $this->info("📋 Recent backups:");

        $backupFiles = glob($backupPath . '/backup_*.sql*');
        if (empty($backupFiles)) {
            $this->warn("   No backup files found.");
            return;
        }

        // Sort by newest first
        usort($backupFiles, function ($a, $b) {
            return filemtime($b) - filemtime($a);
        });

        foreach (array_slice($backupFiles, 0, 5) as $file) {
            $fileName = basename($file);
            $fileSize = $this->formatBytes(filesize($file));
            $fileTime = date('Y-m-d H:i:s', filemtime($file));
            $this->line("   📄 {$fileName} ({$fileSize}) - {$fileTime}");
        }
    }

    private function showRestoreInstructions($filePath, $database, $username)
    {
        $this->newLine();
        $this->info("📖 Restore Instructions:");
        $this->line("   • Backup location: {$filePath}");
        $this->line("   • To restore: mysql -u {$username} -p {$database} < \"{$filePath}\"");
        if (file_exists($filePath . '.gz')) {
            $this->line("   • Or compressed: gunzip -c \"{$filePath}.gz\" | mysql -u {$username} -p {$database}");
        }
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
