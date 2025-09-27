import { useEffect, useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        login: "",
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
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                    <div className="mb-6 text-center">
                        <ApplicationLogo className="w-20 h-20 mx-auto mb-4" />
                        <h1 className="mb-2 text-3xl font-bold text-black dark:text-white ">
                            Toko 85
                        </h1>
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                            Login
                        </h2>
                        <p className="text-gray-500 ">Lanjutkan ke Dashboard</p>
                    </div>

                    <form onSubmit={submit}>
                        {errors && Object.keys(errors).length > 0 && (
                            <div className="p-3 mb-4 text-red-700 border border-red-100 rounded bg-red-50">
                                <ul className="pl-5 text-sm list-disc">
                                    {Object.entries(errors).map(([k, v]) => (
                                        <li key={k}>{v}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="mb-4">
                            <label
                                htmlFor="role"
                                className="block mb-2 font-bold text-gray-700"
                            >
                                Pilih Lokasi
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={role}
                                onChange={(e) => {
                                    setRole(e.target.value);
                                    setData("role", e.target.value);
                                }}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-blue-300 focus:ring-blue-200"
                            >
                                <option value="">-- Pilih Lokasi --</option>
                                <option value="Toko">Toko</option>
                                <option value="Gudang">Gudang</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="login"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Username or Email
                            </label>
                            <input
                                type="text"
                                name="login"
                                id="login"
                                className="block w-full px-4 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300"
                                value={data.login}
                                autoComplete="username"
                                onChange={(e) =>
                                    setData("login", e.target.value)
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
                                className="block w-full px-4 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 text-black"
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
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 "
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData("remember", e.target.checked)
                                    }
                                />
                                <label
                                    htmlFor="remember_me"
                                    className="block ml-2 text-sm text-gray-900"
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
                                className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
