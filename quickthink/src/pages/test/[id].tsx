import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Question, TestType } from "~/drizzle/schema";
import {
  ReactNode,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import { session } from "~/server/auth/auth";

export function TestPageLayout(props: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col items-center bg-[#EDF0FF]">
      {props.children}
    </div>
  );
}

type TextContextType = {
  testStarted: boolean;
  setTestStarted: (isStarted: boolean) => void;
};
export const TestContext = createContext<TextContextType>({
  testStarted: false,
  setTestStarted: () => {
    return;
  },
});

export default function TestPageContainer() {
  return (
    <TestPageLayout>
      <TestPage />
    </TestPageLayout>
  );
}

export function TestPage() {
  const router = useRouter();
  const test_id = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;

  if (!test_id) {
    return;
  }

  const sessionId = localStorage.getItem("session_id");
  const sessionStarter = api.tests.startSession.useMutation({
    onSuccess: (value) => {
      setTestStarted(true);
      localStorage.setItem("session_id", value[0]?.sessionId!);
    },
  });
  const [testStarted, setTestStarted] = useState(false);
  console.log(testStarted);

  function HandleLeaveTest() {
    setTestStarted(false);
    console.log("hi");
    return;
  }

  function HandleTestStart() {
    setTestStarted(true);
    console.log("hiii");
    return;
    if (!sessionId) {
      sessionStarter.mutate({ test_id: test_id! });
    }
  }
  return (
    <>
      <div
        className={`flex h-full w-full justify-center ${
          testStarted ? "" : "items-center "
        }`}
      >
        <TestStartModal
          test_id={test_id}
          testStarted={testStarted}
          startOnClick={HandleTestStart}
          leaveOnClick={HandleLeaveTest}
        />
      </div>
    </>
  );
}

export function TestStartModal(props: {
  test_id: string;
  testStarted: boolean;
  startOnClick: () => void;
  leaveOnClick: () => void;
}) {
  const { isLoading, isError, data, error } =
    api.tests.getTestIntroWithId.useQuery({
      test_id: props.test_id,
    });

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={error.message} code={error.data?.code} />;
  }
  return (
    <div className="w-full max-w-2xl">
      <div
        className={`flex flex-col gap-y-3 ${
          props.testStarted ? "" : "rounded-lg"
        } bg-[#FBFBFF] p-4 shadow-lg`}
      >
        <div className="flex flex-row items-center justify-between gap-2 ">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-[#1A2643]">
              {data.testData?.title}{" "}
            </h1>
            <p className="text-sm">{data.testData?.description}</p>
          </div>
          <div>
            <p className="font-light">
              Published on: {data.testData?.publishDate?.toDateString()}
            </p>
          </div>
        </div>
        {props.testStarted ? null : (
          <button
            className="rounded border border-black px-2 py-1 text-[#1A2643] transition-colors hover:bg-[#1A2643] hover:text-white"
            onClick={() => {
              props.startOnClick();
            }}
          >
            Start Test
          </button>
        )}
      </div>
      <div className="flex justify-end rounded-b-lg bg-[#1A2643] px-3 py-1 text-white">
        {props.testStarted ? (
          <TestControls leaveHandler={props.leaveOnClick} />
        ) : null}
      </div>
    </div>
  );
}

export function TestControls(props: { leaveHandler: () => void }) {
  const timer = useTimer();
  return (
    <div className="flex w-full flex-row justify-between">
      <div
        onClick={() => {
          props.leaveHandler();
        }}
      >
        Leave Test
      </div>
      <div>
        <span className="font-light">Time Remaining: {timer}</span>
      </div>
    </div>
  );
}

export function useTimer() {
  const [timer, setTimer] = useState("0");
  return timer;
}

export function StartTestButton(props: { onClick: () => void }) {
  return <>hi</>;
}

export function Test(props: { testId: string }) {
  const { isLoading, isError, data, error } = api.tests.getTestWithId.useQuery({
    test_id: props.testId!,
  });
  if (isLoading) {
    return <Loading />;
  }
  if (isError) {
    return <Error message={error.message} code={error.data?.code} />;
  }
  return (
    <div className="">
      <Question question={data.testData!} />
    </div>
  );
}

export function Question(props: { question: Question }) {
  return <div></div>;
}

export function Error(props: { code?: string; message: string }) {
  return (
    <>
      <div className="w-full p-2">
        <h1 className="text-lg font-bold">An error occured,</h1> {props.message}
        <p>
          {props.code ? (
            <>
              <h2>Code</h2>
              props.code
            </>
          ) : null}
        </p>
      </div>
    </>
  );
}

export function Loading() {
  return <>Loading...</>;
}
