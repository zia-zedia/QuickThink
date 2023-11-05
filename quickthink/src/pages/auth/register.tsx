import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { string, z } from "zod";
import { api } from "~/utils/api";

export default function RegisterPage() {
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
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState("");

  const createUser = api.auth.signUp.useMutation({
    onSuccess: () => {
      setIsValid(true);
    },
  });
  function handleSignUp(signUpData: any) {
    const registerValid = z.object({
      authData: z.object({
        email: z.string().email(),
        password: z.string().min(7).max(24),
      }),
      userData: z.object({
        firstName: z.string(),
        lastName: z.string(),
        role: z.enum(["student", "teacher"]),
      }),
    });
    const isValid = registerValid.safeParse(signUpData).success;
    if (!isValid) {
      console.log("nope");
      setIsValid(false);
      return;
    }
    console.log("something");
    createUser.mutate({
      authData: signUpData.authData,
      userData: {
        firstName: signUpData.userData.firstName,
        lastName: signUpData.userData.lastName,
        role: signUpData.userData.role,
      },
    });
  }
  return (
    <div className="max-w-xl flex-col rounded bg-[#1A2643] p-5 text-white shadow-lg sm:w-[50%]">
      <h1 className="text-3xl font-bold">Sign up</h1>
      {isValid ? (
        ""
      ) : (
        <p className="text-red-400">Please fill in all the form elements</p>
      )}
      <form
        className="flex flex-col gap-2 py-4"
        method="post"
        onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const formData = {
            authData: {
              email: (event.target as any).email.value,
              password: (event.target as any).password.value,
            },
            userData: {
              firstName: (event.target as any).first_name.value,
              lastName: (event.target as any).last_name.value,
              role: (event.target as any).role.value,
            },
          };
          handleSignUp(formData);
        }}
        onFocus={() => {
          setIsValid(true);
        }}
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1 font-light">
            <label className="text-xl">First Name:</label>
            <input
              className={`rounded p-3 text-black`}
              type="text"
              placeholder="Enter your first name"
              name="first_name"
            />
          </div>
          <div className="flex flex-col gap-1 font-light">
            <label className="text-xl">Last Name:</label>
            <input
              className={`rounded p-3 text-black`}
              type="text"
              placeholder="Enter your last name"
              name="last_name"
            />
          </div>
          <div className="flex flex-col gap-1 font-light">
            <label className="text-xl">Role:</label>
            <select className="rounded p-3 text-black" name="role">
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
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
            className="cursor-pointer rounded bg-[#849EFA] p-3"
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
    </div>
  );
}
