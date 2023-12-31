import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { z } from "zod";
import { check } from "drizzle-orm/mysql-core";

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="description" content="Log into QuickThink" />
        <link rel="icon" href="/white_logo.png" />
      </Head>
      <div className="flex h-screen flex-col items-center justify-center p-5">
        <div className="flex flex-col py-4 text-center">
          <h1 className="text-2xl font-bold">Welcome Back!</h1>
          <h1 className="text-xl font-light">It's good to see you again!</h1>
        </div>
        <LoginForm />
      </div>
    </>
  );
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<{
    isValid: boolean;
    message: string;
  }>({ isValid: true, message: "" });
  const [message, setMessage] = useState("");
  const {
    isLoading,
    isError,
    data: checkLogin,
    error,
  } = api.auth.isLoggedIn.useQuery();

  useEffect(() => {
    const emailValid = z.string().email().safeParse(email);
    if (email.length === 0) {
      setEmailError({ isValid: true, message: "" });
      return;
    }
    if (!emailValid.success) {
      setEmailError({ isValid: false, message: "Please enter a valid email" });
      return;
    }
    setEmailError({ isValid: true, message: "" });
  }, [email]);

  const loginUser = api.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.session)
        if (data.user?.role === "student") {
          window.location.href = "/student";
        } else if (data.user?.role === "teacher") {
          window.location.href = "/teacher";
        }
    },
    onError: (error) => {
      setMessage(`Login Failed, ${error.message}`);
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>An error ocurred: {error.message}</div>;
  }

  if (checkLogin?.loggedIn) {
    if (checkLogin?.role === "student") {
      window.location.href = "/student";
    } else if (checkLogin?.role === "teacher") {
      window.location.href = "/teacher";
    }
  }

  function handleLogin(loginData: { email: string; password: string }) {
    loginUser.mutate(loginData);
  }
  return (
    <div className="max-w-xl flex-col rounded bg-[#1A2643] p-5 text-white sm:w-[50%]">
      <h1 className="text-3xl font-bold">Login to QuickThink</h1>
      <form
        className="flex flex-col gap-2 py-4"
        method="post"
        onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          if (!emailError.isValid) {
            return;
          }
          const formData = {
            email: (event.target as any).email.value,
            password: (event.target as any).password.value,
          };
          handleLogin(formData);
        }}
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1 font-light">
            <label className="text-xl">Email:</label>
            <input
              className={`rounded p-3 text-black ${
                emailError.isValid ? "" : "border-2 border-red-400"
              }`}
              type="email"
              placeholder="Enter email"
              name="email"
              onChange={(event) => {
                setEmail(event.target.value);
              }}
            />
            <div className="font-light text-red-300">{emailError.message}</div>
          </div>
          <div className="flex flex-col gap-1 font-light">
            <label className="text-xl">Password:</label>
            <input
              className="rounded p-3 text-black"
              type="password"
              placeholder="Enter password"
              name="password"
              onChange={(event) => {
                setPassword(event.target.value);
              }}
            />
          </div>
          <input
            className="rounded bg-[#849EFA] p-3 text-white"
            type="submit"
            value="Login"
          />
        </div>
      </form>
      <p>
        Don't have an account?{" "}
        <Link className="font-bold" href={"register"}>
          Sign up
        </Link>
      </p>
      <span className="text-red-400">{message}</span>
    </div>
  );
}
