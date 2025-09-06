import { useEffect, useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
        role: "Toko", // Default to Toko
    });

    const [role, setRole] = useState("Toko");

    useEffect(() => {
        return () => {
            reset("password");
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        // Set role in form data before submitting
        setData("role", role);

        // Simple post with current data
        const response = post(route("login"), {
            onSuccess: (page) => {
                console.log("✅ Login onSuccess triggered:", page);
                console.log("  - Component:", page?.component || "unknown");
                console.log("  - Props:", page?.props || {});
                console.log("  - URL:", page?.url || "unknown");

                // Refresh CSRF token after successful login
                setTimeout(() => {
                    const metaToken = document.querySelector(
                        'meta[name="csrf-token"]'
                    );
                    if (metaToken) {
                        // Get fresh token from current page
                        fetch(window.location.href, {
                            method: "GET",
                            credentials: "include",
                        })
                            .then((response) => response.text())
                            .then((html) => {
                                const parser = new DOMParser();
                                const doc = parser.parseFromString(
                                    html,
                                    "text/html"
                                );
                                const newToken = doc.querySelector(
                                    'meta[name="csrf-token"]'
                                );
                                if (
                                    newToken &&
                                    newToken.content !== metaToken.content
                                ) {
                                    metaToken.content = newToken.content;
                                    console.log(
                                        "🔄 CSRF token refreshed after login"
                                    );
                                }
                            })
                            .catch((error) => {
                                console.warn(
                                    "Failed to refresh CSRF token:",
                                    error
                                );
                            });
                    }
                }, 1000);
            },
            onError: (errors) => {
                console.log("❌ Login onError triggered:", errors);
                console.log("  - Error keys:", Object.keys(errors));
                console.log("  - Error values:", errors);
            },
            onFinish: () => {
                console.log("🏁 Login onFinish triggered");
                console.log("  - Processing state:", processing);
                console.log("  - Has errors:", Object.keys(errors).length > 0);
            },
            onProgress: (progress) => {
                console.log("📊 Login onProgress triggered:", progress);
            },
        });

        console.log("🚀 Login form submission initiated:", response);
    };

    return (
        <>
            <Head title="Log in" />
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                    <div className="text-center mb-6">
                        <ApplicationLogo className="w-20 h-20 mx-auto mb-4" />
                        <h1 className="text-3xl text-black font-bold mb-2">
                            Toko_88
                        </h1>
                        <h2 className="text-xl font-semibold text-gray-700">
                            Login
                        </h2>
                        <p className="text-gray-500">Lanjutkan ke Dashboard</p>
                    </div>

                    <form onSubmit={submit}>
                        {errors && Object.keys(errors).length > 0 && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded">
                                <ul className="list-disc pl-5 text-sm">
                                    {Object.entries(errors).map(([k, v]) => (
                                        <li key={k}>{v}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="mb-4">
                            <label
                                htmlFor="role"
                                className="block text-gray-700 font-bold mb-2"
                            >
                                Pilih Role
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={role}
                                onChange={(e) => {
                                    setRole(e.target.value);
                                    setData("role", e.target.value);
                                }}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-opacity-50"
                            >
                                <option value="Toko">Toko</option>
                                <option value="Gudang">Gudang</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <input
                                    id="remember_me"
                                    name="remember"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData("remember", e.target.checked)
                                    }
                                />
                                <label
                                    htmlFor="remember_me"
                                    className="ml-2 block text-sm text-gray-900"
                                >
                                    Ingat saya
                                </label>
                            </div>

                            <a
                                href="#"
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Lupa Password?
                            </a>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Masuk
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
