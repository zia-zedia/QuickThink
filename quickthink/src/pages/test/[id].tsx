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

  const [timeLeft, setTimeLeft] = useState<TimeType | null>(null);
  const sessionId = localStorage.getItem("session_id");
  const [testStarted, setTestStarted] = useState(false);
  const startSession = api.tests.startSession.useMutation({
    onSuccess: (value) => {
<<<<<<< HEAD
      const sessionId = value.session?.id;
      if (sessionId === undefined) {
        return;
      }
      localStorage.setItem("session_id", sessionId);
      console.log(localStorage.getItem("session_id"));
    },
  });
  const timer = api.tests.checkSession.useMutation({
    onSuccess: (value) => {
      console.log(value.session?.startTime);
=======
      setTestStarted(true);
      setTimeLeft(value.timer);
      localStorage.setItem("session_id", value.session[0]?.id!);
      console.log(sessionId);
      console.log(timeLeft);
      console.log("test started");
>>>>>>> 7a85d598867bc31a11f7bbc15d0d8b4aa586e6ae
    },
  });
  const { isLoading, isError, data, error, isSuccess } =
    api.tests.handleSession.useQuery({
      sessionId: sessionId,
      test_id: test_id,
    });

  if (isLoading) {
    return <Loading />;
  }
  if (isError) {
    return <Error message={error.message} code={error.data?.code} />;
  }

  if (startSession.isLoading) {
    return <Loading />;
  }

  if (startSession.isError) {
    return (
      <Error
        message={startSession.error.message}
        code={startSession.error.data?.code}
      />
    );
  }

  console.log(testStarted);
  function HandleLeaveTest() {
    setTestStarted(false);
    console.log("hi");
    return;
  }

  function HandleTestStart() {
    if (!sessionId) {
      startSession.mutate({ test_id: test_id! });
    }
    setTestStarted(true);
    console.log(timeLeft);
    return;
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
          timeLeft={timeLeft ? timeLeft : data.timer!}
        />
      </div>
    </>
  );
}

type TimeType = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function TestStartModal(props: {
  test_id: string;
  testStarted: boolean;
  startOnClick: () => void;
  leaveOnClick: () => void;
  timeLeft?: TimeType;
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
          <TestControls
            leaveHandler={props.leaveOnClick}
            timeLeft={props.timeLeft ? props.timeLeft : undefined}
          />
        ) : null}
      </div>
    </div>
  );
}

export function TestControls(props: {
  leaveHandler: () => void;
  timeLeft: TimeType;
}) {
  const timer = useTimer(props.timeLeft);

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
        <span className="font-light">
          Time Remaining:{" "}
          {props.timeLeft ? (
            <>
              {timer.minutes}:
              {timer.seconds < 10 ? "0" + timer.seconds : timer.seconds}
            </>
          ) : (
            <></>
          )}
        </span>
      </div>
    </div>
  );
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
        <h1 className="text-lg font-bold">An error occured,</h1> {props.code}
        <p>{props.code ? <>{props.message}</> : null}</p>
      </div>
    </>
  );
}

export function Loading() {
  return <>Loading...</>;
}

export function useTimer(remainingTime: TimeType) {
  const [time, setTime] = useState(remainingTime);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      const newTime = decrementTimer(time);
      setTime(newTime);
      if (
        newTime.days === 0 &&
        newTime.hours === 0 &&
        newTime.minutes === 0 &&
        newTime.seconds === 0
      ) {
        return;
      }
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timerInterval);
  }, [time]);
  return time;
}

function decrementTimer(timer: TimeType) {
  // Create a new object to store the decremented values
  const newTimer = { ...timer };

  // Decrement the seconds
  newTimer.seconds -= 1;

  // Handle the carry-over to minutes, hours, and years if needed
  if (newTimer.seconds < 0) {
    newTimer.seconds = 59; // Reset seconds to 59
    newTimer.minutes -= 1;

    if (newTimer.minutes < 0) {
      newTimer.minutes = 59; // Reset minutes to 59
      newTimer.hours -= 1;

      if (newTimer.hours < 0) {
        newTimer.hours = 23; // Reset hours to 23
        newTimer.days -= 1;

        // Handle the case where the timer goes negative
        if (newTimer.days < 0) {
          // Reset all values to zero to prevent negative values
          newTimer.days = 0;
          newTimer.hours = 0;
          newTimer.minutes = 0;
          newTimer.seconds = 0;
        }
      }
    }
  }
  return newTimer;
}
