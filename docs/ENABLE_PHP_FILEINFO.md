Enable PHP fileinfo extension (Windows, CLI + Apache/IIS)

Why: The error "Unable to guess the MIME type as no guessers are available (have you enabled the php_fileinfo extension?)" indicates the `fileinfo` extension is not active. `fileinfo` is required by libraries that attempt to detect MIME types (used in exports and file handling).

Steps (Windows, PHP installed at `C:\php`):

1. Open `C:\php\php.ini` in an editor with admin privileges.
2. Search for the line that mentions `extension=fileinfo` or `;extension=fileinfo`.
3. If it's commented out (starts with `;`), remove the `;` so it becomes:

    extension=fileinfo

    If the line is missing, add it under the `Dynamic Extensions` section.

4. Save `php.ini`.

5. Restart any PHP/FPM/HTTP service you're using. If using `php artisan serve` stop and restart it. If using Apache, restart Apache.

6. Verify from CLI:

    ```bash
    php -m | grep fileinfo
    ```

    You should see `fileinfo` in the list.

Notes:

-   If you run PHP through a web server (Apache, Nginx+PHP-FPM), make sure you edit the `php.ini` used by that SAPIs (can differ from CLI). Use `phpinfo()` in a small PHP file served by your web server to confirm the loaded `php.ini` when accessed via browser.
-   On some Windows PHP distributions `php_fileinfo.dll` exists in `ext/` directory and `extension=fileinfo` is enough; on older builds you might need to enable the .dll explicitly (rare).

After enabling `fileinfo`, try the export endpoints again. If you want, I can apply the setting on this environment (I have access) — confirm and I'll uncomment/add the line and restart the dev server.
