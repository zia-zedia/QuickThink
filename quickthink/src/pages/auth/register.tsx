import { useUser } from "@supabase/auth-helpers-react";
import { TRPCClientError } from "@trpc/client";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ZodString, z } from "zod";
import { api } from "~/utils/api";

export default function RegisterPage() {
  return (
    <>
      <Head>
        <title>Sign Up</title>
        <meta name="description" content="Sign up to QuickThink" />
      </Head>
      <div className="flex h-screen flex-col items-center justify-center bg-[#fbfbff] p-5">
        <RegisterForm />
      </div>
    </>
  );
}

export function RegisterForm() {
  const [isValid, setIsValid] = useState(true);
  const [errors, setError] = useState<string[]>([]);
  const [serverError, setServerError] = useState("");
  const user = useUser();
  const createUser = api.auth.signUp.useMutation({
    onSuccess: (data) => {
      setIsValid(true);
      if (data.user?.role === "student") {
        window.location.href = "/student";
      } else if (data.user?.role === "teacher") {
        window.location.href = "/teacher";
      }
    },
    onError: (error) => {
      setServerError(error.message);
    },
  });
  function checkEmailAvailability(email: string) {
    const emailValidator = z.string().email();
    if (!emailValidator.safeParse(email)) {
      return;
    }
  }
  function handleSignUp(signUpData: any) {
    const registerValid = z.object({
      authData: z.object({
        email: z.string().email(),
        password: z.string().min(7).max(24),
      }),
      userData: z.object({
        username: z.string().min(5).max(15),
        firstName: z.string(),
        lastName: z.string(),
        role: z.enum(["student", "teacher"]),
      }),
    });
    const isValid = registerValid.safeParse(signUpData).success;
    if (!isValid) {
      console.log("nope");
    }
    console.log("something");
    createUser.mutate({
      authData: signUpData.authData,
      userData: {
        userName: signUpData.userData.userName,
        firstName: signUpData.userData.firstName,
        lastName: signUpData.userData.lastName,
        role: signUpData.userData.role,
      },
    });
  }
  return (
    <div className="max-w-xl flex-col overflow-y-scroll rounded bg-[#1A2643] p-5 text-white shadow-lg sm:w-[50%]">
      <h1 className="text-3xl font-bold">Sign up to QuickThink</h1>
      {isValid ? (
        ""
      ) : (
        <p className="text-red-400">
          Please fill in all the form elements properly
        </p>
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
              userName: (event.target as any).user_name.value,
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
            <label className="text-xl">Enter your username:</label>
            <input
              className={`rounded p-3 text-black`}
              type="text"
              placeholder="Enter a username"
              name="user_name"
              onChange={(event) => {
                const usernameValidator = z.string().min(5).max(15);
                if (
                  !usernameValidator.safeParse(event.target.value).success &&
                  event.target.value.trim() !== ""
                ) {
                  if (errors.find((err) => err === "Invalid username")) {
                    return;
                  }
                  setError(errors.concat("Invalid username"));
                  return;
                }
                setError(
                  [...errors].filter((err) => err !== "Invalid username"),
                );
              }}
            />
          </div>
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
              onChange={(event) => {
                const emailValidator = z.string().email();
                if (
                  !emailValidator.safeParse(event.target.value).success &&
                  event.target.value.trim() !== ""
                ) {
                  if (errors.find((err) => err === "Invalid email")) {
                    return;
                  }
                  setError(errors.concat("Invalid email"));
                  return;
                }
                setError([...errors].filter((err) => err !== "Invalid email"));
              }}
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
            className="cursor-pointer rounded bg-[#849EFA] p-3 disabled:opacity-80"
            type="submit"
            value="Sign Up"
            disabled={errors.length > 0}
          />
        </div>
      </form>
      <div className="flex flex-col gap-1">
        <span className="flex flex-col gap-1 text-red-400">
          {errors.map((err) => {
            return <div>{err}</div>;
          })}
          <div>{serverError}</div>
        </span>
        <p>
          Already have an account?{" "}
          <Link className="font-bold" href={"/auth/login"}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
