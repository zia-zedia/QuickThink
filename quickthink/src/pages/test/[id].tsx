import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Answer, Question, TestType } from "~/drizzle/schema";
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
      setTestStarted(true);
      setTimeLeft(value.timer);
      localStorage.setItem("session_id", value.session[0]?.id!);
      console.log(sessionId);
      console.log(timeLeft);
      console.log("test started");
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
  if (isError && !(error.data?.code === "NOT_FOUND")) {
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
    if (!sessionId || error?.data?.code === "NOT_FOUND") {
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
        <div className="w-full max-w-3xl">
          <TestStartModal
            test_id={test_id}
            testStarted={testStarted}
            startOnClick={HandleTestStart}
            leaveOnClick={HandleLeaveTest}
            timeLeft={timeLeft ? timeLeft : data?.timer}
          />
          {testStarted ? <Test testId={test_id} /> : null}
        </div>
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
    <>
      <div
        className={`flex flex-col gap-y-3 ${
          props.testStarted ? "" : "rounded-t-lg"
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
            className="rounded px-2 py-1 text-[#1A2643] outline outline-1 outline-[#1A2643] transition-colors hover:bg-[#1A2643] hover:text-white"
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
    </>
  );
}

export function TestControls(props: {
  leaveHandler: () => void;
  timeLeft: TimeType;
}) {
  const timer = useTimer(props.timeLeft, handleTimeRunOut);
  function handleTimeRunOut() {
    location.replace(location.href);
    return;
  }

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

export function Test(props: { testId: string }) {
  const [testAnswers, setTestAnswers] = useState<
    Array<{
      question: Question;
      answers: Answer[];
    }>
  >([]);
  const [completed, setCompleted] = useState(false);
  const { isLoading, isError, data, error } =
    api.tests.getTestDataWithId.useQuery({
      test_id: props.testId!,
    });
  const submitTest = api.tests.submitTest.useMutation();

  useEffect(() => {
    const isCompleted = () => {
      if (testAnswers.length < data?.length!) {
        return false;
      }
      for (let i = 0; i < testAnswers.length; i++) {
        if (testAnswers[i]?.answers[0] === undefined) {
          return false;
        }
      }
      return true;
    };
    if (isCompleted()) {
      testAnswers.map((qna) => {
        console.log(qna.answers[0]);
      });
      setCompleted(true);
      return;
    }
    setCompleted(false);
  }, [testAnswers]);

  if (isLoading) {
    return <Loading />;
  }
  if (isError) {
    return <Error message={error.message} code={error.data?.code} />;
  }

  function handleTestAnswers(QnA: { question: Question; answers: Answer[] }) {
    const isListed =
      testAnswers.filter((qna) => {
        return qna.question.id === QnA.question.id;
      }).length > 0;

    if (!isListed) {
      setTestAnswers(testAnswers.concat(QnA));
      return;
    }
    const newArray = testAnswers.map((testAnswer) => {
      if (testAnswer.question.id === QnA.question.id) {
        return {
          ...testAnswer,
          answers: QnA.answers,
        };
      }
      return testAnswer;
    });
    setTestAnswers(newArray);
  }

  function HandleSubmit() {
    console.log("submitting");
    if (testingAnswers.length < data!.length) {
      return;
    }
    console.log(testAnswers);
    const submittableTestAnswers = submitTest.mutate({
      testId: props.testId,
      TestAnswers: testAnswers!,
    });
  }

  return (
    <div>
      {data.map((qna) => {
        return (
          <div className="p-2">
            <QnA qna={qna} handleAnswers={handleTestAnswers} />
          </div>
        );
      })}
      <SubmitTest onSubmit={HandleSubmit} enabled={completed} />
    </div>
  );
}

export function QnA(props: {
  qna: { question: Question; answers: Answer[] };
  handleAnswers: (QnA: { question: Question; answers: Answer[] }) => void;
}) {
  const question = props.qna.question;
  const answers = props.qna.answers;
  const handleAnswers = props.handleAnswers;

  function QnAHandler(answers: Answer[]) {
    handleAnswers({ question: question, answers: answers });
  }

  return (
    <div className="bg-white">
      <QuestionContainer question={question}>
        <AnswerContainer
          answers={answers}
          numberOfAnswers={question.answerAmount!}
          onAnswer={QnAHandler}
        />
      </QuestionContainer>
    </div>
  );
}

export function QuestionContainer(props: {
  children: ReactNode;
  question: Question;
}) {
  return (
    <div className="flex flex-col gap-2 rounded bg-[#CADBFF] p-2 shadow">
      <h1 className="px-3 py-2 font-bold">{props.question.content}</h1>
      <div className="">{props.children}</div>
    </div>
  );
}

export function AnswerContainer(props: {
  answers: Answer[];
  numberOfAnswers: number;
  onAnswer: (answers: Answer[]) => void;
}) {
  const [selectedAnswers, setSelectedAnswers] = useState<Answer[]>([]);
  const numberOfAnswers = props.numberOfAnswers;

  function handleAnswerSelection(answer: Answer) {
    const alreadyListed =
      selectedAnswers.filter((selectedAnswer) => {
        return selectedAnswer.id === answer.id;
      }).length > 0;
    console.log(alreadyListed);

    if (alreadyListed) {
      setSelectedAnswers(
        selectedAnswers.filter((selectedAnswer) => {
          return !(answer.id === selectedAnswer.id);
        }),
      );
      return;
    }

    if (numberOfAnswers === 1) {
      setSelectedAnswers([answer]);
    }

    if (selectedAnswers.length >= numberOfAnswers) {
      return;
    }
    setSelectedAnswers(selectedAnswers.concat(answer));
  }

  useEffect(() => {
    props.onAnswer(selectedAnswers);
  }, [selectedAnswers]);

  return (
    <div className="mx-2 flex flex-wrap gap-x-1 gap-y-2">
      {props.answers.map((answer, index) => {
        const isSelected =
          selectedAnswers.filter((selectedAnswer) => {
            return answer.id === selectedAnswer.id;
          }).length === 1;

        return (
          <>
            <div className="w-full flex-grow flex-row">
              <Answer
                answer={answer}
                index={index + 1}
                isSelected={isSelected}
                onSelect={(answer) => {
                  handleAnswerSelection(answer);
                }}
              />
            </div>
          </>
        );
      })}
    </div>
  );
}

export function Answer(props: {
  answer: Answer;
  index?: number;
  isSelected?: boolean;
  onSelect: (answer: Answer) => void;
}) {
  const { answer, index, isSelected } = props;
  const onSelect = props.onSelect;
  return (
    <>
      <div
        className={`${
          isSelected ? "outline outline-2 outline-[#1A2643]" : ""
        } flex flex-row items-center gap-x-3 rounded bg-white px-3 py-2 font-light transition-all hover:shadow`}
        key={answer.id}
        onClick={() => {
          onSelect(answer);
        }}
      >
        {index ? <div className="text-xl font-bold">{props.index}.</div> : null}
        <div className="">{answer.content}</div>
      </div>
    </>
  );
}

export function SubmitTest(props: { enabled?: boolean; onSubmit: () => void }) {
  const enabled = props.enabled;
  const onSubmit = props.onSubmit;
  return (
    <button
      className={`rounded bg-white px-3 py-2 text-black hover:cursor-pointer ${
        enabled ? "" : "text-gray-500"
      }`}
      disabled={!enabled}
      onClick={onSubmit}
    >
      Submit Result
    </button>
  );
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

export function useTimer(remainingTime: TimeType, onTimeRunOut: () => void) {
  const [time, setTime] = useState(remainingTime);
  useEffect(() => {
    const timerInterval = setInterval(() => {
      const newTime = decrementTimer(time);
      if (
        newTime.days === 0 &&
        newTime.hours === 0 &&
        newTime.minutes === 0 &&
        newTime.seconds === 0
      ) {
        onTimeRunOut();
        return;
      }
      setTime(newTime);
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
