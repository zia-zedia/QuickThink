import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { UserInsert } from "~/drizzle/schema";
import { api } from "~/utils/api";

export default function SignUpPage() {
  return (
    <>
      <Head>
        <title>Sign Up</title>
        <meta name="description" content="Sign up to QuickThink" />
      </Head>
      <div className="flex h-screen flex-col items-center justify-center p-5">
        <div className="flex flex-col py-4 text-center">
          <h1 className="text-2xl font-bold">Welcome to QuickThink!</h1>
        </div>
        <RegisterForm />
      </div>
    </>
  );
}

export function RegisterForm() {
  const [message, setMessage] = useState("");
  const createUser = api.example.createUser.useMutation({
    onSuccess: () => setMessage("success"),
  });
  function handleSignUp(signUpData: { email: string; password: string }) {
    createUser.mutate(signUpData);
  }

  return (
    <div className="max-w-xl flex-col rounded bg-[#1A2643] p-5 text-white sm:w-[50%]">
      <h1 className="text-3xl font-bold">Sign up</h1>
      <form
        className="flex flex-col gap-2 py-4"
        method="post"
        onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const formData = {
            email: (event.target as any).email.value,
            password: (event.target as any).password.value,
          };
          handleSignUp(formData);
        }}
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1 font-light">
            <label className="text-xl">Full Name:</label>
            <input
              className={`rounded p-3 text-black`}
              type="text"
              placeholder="Enter your name"
              name="full_name"
            />
          </div>
          <div className="flex flex-col gap-1 font-light">
            <label className="text-xl">Email:</label>
            <input
              className={`rounded p-3 text-black`}
              type="email"
              placeholder="Enter email"
              name="email"
            />
          </div>
          <div className="flex flex-col gap-1 font-light">
            <label className="text-xl">Password:</label>
            <input
              className="rounded p-3 text-black"
              type="password"
              placeholder="Enter password"
              name="password"
            />
          </div>
          <input
            className="rounded bg-[#849EFA] p-3"
            type="submit"
            value="Sign Up"
          />
        </div>
      </form>
      <p>
        Already have an account?{" "}
        <Link className="font-bold" href={"/login"}>
          Sign in
        </Link>
      </p>
      {message}
    </div>
  );
}
