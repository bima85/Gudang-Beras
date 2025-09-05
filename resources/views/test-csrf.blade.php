<!DOCTYPE html>
<html>

<head>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
</head>

<body>
    <h1>CSRF Test</h1>
    <button onclick="testCSRF()">Test CSRF Token</button>

    <script>
        // Set CSRF token
        const token = document.head.querySelector('meta[name="csrf-token"]');
        if (token) {
            axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
            console.log('CSRF Token set:', token.content);
        } else {
            console.error('CSRF token not found');
        }

        function testCSRF() {
            // Test request to addToCart
            axios.post('/dashboard/transactions/addToCart', {
                    product_id: 1,
                    qty: 1,
                    unit_id: 1
                })
                .then(response => {
                    console.log('Success:', response.data);
                    alert('Success: ' + JSON.stringify(response.data));
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error: ' + error.response?.status + ' - ' + (error.response?.data?.message || error
                    .message));
                });
        }
    </script>
</body>

</html>
