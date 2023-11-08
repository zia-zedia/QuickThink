import { Head } from "next/document";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { TestType } from "~/drizzle/schema";
import { useState } from "react";

export default function TestPage() {
  const router = useRouter();
  const test_id = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;

  if (!test_id) {
    return;
  }
  const testData = api.tests.getTestWithId.useQuery({ test_id: test_id });
  const testSession = api.tests.startTestSession.useMutation({
    onSuccess: () => {},
    onError: () => {},
  });

  function handleTimerStart() {
    testSession.mutate({
      user_id: "something",
      test_id: "something",
    });
  }

  if (!testData.data?.testData) {
    return <>Loading...</>;
  }

  if (testData.isError) {
    if (testData.error.data?.code === "BAD_REQUEST") {
      return <>An error happened, make sure you entered a valid test id.</>;
    }
    if (testData.error.data?.code === "NOT_FOUND") {
      return (
        <>
          We couldn't find a test with this id, make sure you entered a valid
          test id
        </>
      );
    }
  }
  return (
    <>
      <div className="flex h-screen flex-col items-center border border-black bg-[#EDF0FF]">
        <TestTopBar testData={testData.data?.testData} />
        <button
          className="rounded bg-white p-3 font-bold text-black"
          onClick={() => {
            handleTimerStart();
          }}
        >
          Start Test
        </button>
      </div>
    </>
  );
}

export function TestTopBar(props: {
  testData: TestType;
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
