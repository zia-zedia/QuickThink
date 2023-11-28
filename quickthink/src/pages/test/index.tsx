import Head from "next/head";
import Link from "next/link";
import { Section } from "..";
import { use, useEffect, useState } from "react";
import { z } from "zod";

export default function Home() {
  const [testId, setTestId] = useState();
  const [error, setError] = useState<{
    isError: Boolean;
    message: string;
  } | null>();

  useEffect(() => {
    const testIdValidator = z.string().uuid();
    console.log(testId);
    console.log(testIdValidator.safeParse(testId).success);
    if (!testId) {
      setError({ isError: false, message: "" });
      return;
    }
    if (!testIdValidator.safeParse(testId).success) {
      setError({ isError: true, message: "Invalid test ID" });
      return;
    }
    setError(null);
  }, [testId]);

  function handleFormSubmit(formData: string) {
    event?.preventDefault();
    if (error?.isError) {
      return;
    }
    if (!testId) {
      return;
    }
    console.log("yeah");
  }
  return (
    <>
      <Head>
        <title>Multiple Choice Test</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen flex-col items-center justify-center border bg-[#CADBFF]">
        <Section title="Enter a test id">
          <form
            className="flex w-full flex-row justify-between gap-2"
            onSubmit={handleFormSubmit}
          >
            <input
              type="text"
              className={`${
                error?.isError
                  ? "outline-blue"
                  : "outline outline-1 outline-[#1A2643]"
              } flex-grow rounded-lg p-3`}
              placeholder="Test ID"
              onChange={(event) => {
                const value = event.target.value;
                setTestId(value);
              }}
            />
            <button
              type="submit"
              className="rounded-lg bg-[#7ea1ed] px-3 py-2 text-white"
            >
              Submit
            </button>
          </form>
          <p>{error?.isError ? error.message : null}</p>
        </Section>
      </main>
    </>
  );
}
