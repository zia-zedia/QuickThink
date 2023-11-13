import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { TestType } from "~/drizzle/schema";
import { useEffect, useState } from "react";

export default function TestPage() {
  const router = useRouter();
  const test_id = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;

  if (!test_id) {
    return;
  }

  const sessionStarter = api.tests.startSession.useMutation({
    onSuccess: (value) => {
      const sessionId = value[0]?.sessionId;
      if (sessionId === undefined) {
        return;
      }
      localStorage.setItem("session_id", sessionId);
      console.log(localStorage.getItem("session_id"));
    },
  });
  const timer = api.tests.checkSession.useMutation({
    onSuccess: (value) => {
      console.log(value[0]?.startTime);
    },
    onError: (value) => {
      if (value.data?.code === "NOT_FOUND") {
        sessionStarter.mutate({ test_id: test_id });
      }
    },
  });
  const testData = api.tests.getTestIntroWithId.useMutation({
    onSuccess: (value) => {
      console.log(value?.testData);
    },
    onError: (value) => {
      if (value.data?.code === "BAD_REQUEST") {
        return (
          <>
            <h1>An error happened</h1>,
            <p>make sure you entered a valid test id.</p>
            <p>{value.message}</p>
          </>
        );
      }
      if (value.data?.code === "NOT_FOUND") {
        return (
          <>
            <h1>An error happened</h1>, We couldn't find a test with this id,
            make sure you entered a valid test id
            <p>{value.message}</p>
          </>
        );
      }
    },
  });

  useEffect(() => {
    const sessionId = localStorage.getItem("session_id");
    console.log(sessionId);
    if (!sessionId) {
      sessionStarter.mutate({ test_id: test_id });
    }
    timer.mutate({ sessionId: sessionId! });
    testData.mutate({ test_id: test_id });
  }, []);

  function handleTestStart() {
    const sessionId = localStorage.getItem("session_id");
    console.log(sessionId);
    if (!test_id) {
      return;
    }
    if (!sessionId) {
      sessionStarter.mutate({ test_id: test_id });
    }
    timer.mutate({ sessionId: sessionId! });
  }

  if (!testData.data?.testData) {
    return <>Loading...</>;
  }

  return (
    <>
      <div className="flex h-screen flex-col items-center border border-black bg-[#EDF0FF]">
        <TestTopBar testData={testData.data?.testData} />
        <button
          className="rounded bg-white p-3 font-bold text-black"
          onClick={() => {
            handleTestStart();
          }}
        >
          Start Test
        </button>
      </div>
    </>
  );
}

export function TestTopBar(props: {
  testData: { title: string; description: string | null; date: Date | null };
  timeSession?: number;
}) {
  return (
    <div className="w-[100%] max-w-2xl ">
      <div className="flex flex-row items-center justify-between gap-2 bg-[#FBFBFF] p-4 shadow-lg">
        <div>
          <h1 className="text-lg font-bold text-[#1A2643]">
            {props.testData.title}
          </h1>
          <p className="text-sm">{props.testData.description}</p>
        </div>
        <div>
          <p className="font-light">
            Published on: {props.testData.publishedAt?.toDateString()}
          </p>
        </div>
      </div>
      <div className="flex justify-between rounded-b-lg bg-[#1A2643] px-3 py-1 text-white">
        <p className="font-semibold">Leave test</p>
        <p className="font-light">
          Time Remaining: {props.timeSession ? props.timeSession : 0}
        </p>
      </div>
    </div>
  );
}
