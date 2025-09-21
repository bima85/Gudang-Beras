<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title inertia>{{ config('app.name', 'Laravel') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.googleapis.com/css2?family=Jost:wght@500;600;700;800&display=swap" rel="stylesheet">

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
    @inertiaHead
    <style>
        html.dark body {
            background-color: rgb(3 7 18 / 0.9);
        }
    </style>
    <script>
        // Immediately apply initial theme to <html> to avoid FOUC/partial styling
        (function() {
            try {
                var darkMode = localStorage.getItem('darkMode') === 'true';
                var root = document.documentElement;
                if (darkMode) {
                    root.classList.add('dark');
                    root.classList.remove('light');
                } else {
                    root.classList.remove('dark');
                    root.classList.add('light');
                }
            } catch (e) {
                console.warn('Could not apply initial theme:', e);
            }
        })();
    </script>
</head>

<body class="font-sans antialiased bg-[#E9E9E9] dark:bg-gray-900 transition-colors"
    style="font-family: 'Jost', sans-serif;" onload="setInitialTheme()">
    @inertia
    <script>
        function setInitialTheme() {
            const darkMode = localStorage.getItem('darkMode') === 'true';
            const root = document.documentElement;
            if (darkMode) {
                root.classList.add('dark');
                root.classList.remove('light');
            } else {
                root.classList.add('light');
                root.classList.remove('dark');
            }
        }
    </script>
</body>

</html>
