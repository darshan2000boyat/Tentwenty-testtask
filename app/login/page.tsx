"use client";

import { useRouter } from "next/navigation";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

type LoginResponse = {
  message: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
};

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password too short")
    .required("Password is required"),
});

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (values: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      
      const data: LoginResponse = await res.json();

      if (res.ok) {
        toast.success("Login successful!");
        router.push("/timesheets");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      <div className="flex flex-col items-center justify-center px-6 py-12 bg-white text-black">
        <Formik
          initialValues={{ email: "", password: "", rememberMe: false }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form className="flex flex-col w-full max-w-xl">
              <h2 className="text-2xl font-bold text-black mb-2">
                Welcome back
              </h2>

              <div className="my-4">
                <label
                  htmlFor="email"
                  className="block text-md font-medium text-black mb-1"
                >
                  Email
                </label>
                <Field
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  className="p-2 border border-slate-400 rounded-lg w-full placeholder:text-black"
                />
                {errors.email && touched.email && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-md font-medium text-black mb-1"
                >
                  Password
                </label>
                <Field
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••••"
                  className="p-2 border border-slate-400 rounded-lg w-full placeholder:text-black placeholder:tracking-wider"
                />
                {errors.password && touched.password && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.password}
                  </div>
                )}
              </div>

              <div
                className="flex items-center mb-4 cursor-pointer"
                onClick={() => setFieldValue("rememberMe", !values.rememberMe)}
              >
                <Field
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  className="mr-2"
                  checked={values.rememberMe}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm text-black cursor-pointer"
                >
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white py-2.5 px-5 rounded-lg hover:bg-blue-700"
              >
                Sign in
              </button>
            </Form>
          )}
        </Formik>
      </div>

      <div className="hidden lg:flex bg-blue-600 flex-col justify-center px-18 py-12 text-white">
        <h1 className="font-inter text-4xl lg:text-5xl leading-tight font-semibold mb-6">
          ticktock
        </h1>

        <p className="font-inter text-lg leading-relaxed text-gray-100">
          Introducing ticktock, our cutting-edge timesheet web application
          designed to revolutionize how you manage employee work hours.
        </p>
      </div>
    </main>
  );
}
