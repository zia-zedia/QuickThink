import {
  ReactNode,
  useState,
  createContext,
  useContext,
  useEffect,
} from "react";
import { AnswerType, Question, TestType, tests } from "~/drizzle/schema";
import { api } from "~/utils/api";
import { CardContainer } from "..";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

export const TeacherPageContext = createContext<TeacherPageContextData>();

export default function TeacherLayout() {
  const [currentTestId, setCurrentTestId] = useState("");
  const [testStates, setTestStates] = useState<Array<TestState>>([]);

  useEffect(() => {
    /*
    testStates.map((values) => {
      console.log(values.testId);
      values.state.map((state) => {
        console.log("yeah");
        console.log(state.question.content);
      });
    });
  */
  }, [testStates]);

  return (
    <>
      <TeacherPageContext.Provider
        value={{ currentTestId, setCurrentTestId, testStates, setTestStates }}
      >
        <YourTests>
          <div className="h-full w-full p-4 lg:max-w-[75%]">
            <TestSection>
              <TestTopBar />
              <DragDropContext
                onDragEnd={(result, source) => {
                  if (!result.destination) return;
                  const test = testStates.filter(
                    (state) => state.testId === currentTestId,
                  )[0]?.state!;
                  const newOrder = reorder(
                    test,
                    result.source.index,
                    result.destination.index,
                  );
                  const newTestState = testStates.map((state) => {
                    if (!(state.testId === currentTestId)) {
                      return state;
                    } else {
                      return {
                        ...state,
                        state: newOrder,
                      };
                    }
                  });
                  setTestStates(newTestState);
                }}
              >
                <QuestionsSection />
              </DragDropContext>
            </TestSection>
          </div>
        </YourTests>
      </TeacherPageContext.Provider>
    </>
  );
}

export function YourTests(props: { children?: ReactNode }) {
  const { isLoading, isError, data, error, isSuccess, isPreviousData } =
    api.teacher.getTestList.useQuery();

  const { currentTestId, testStates, setTestStates } =
    useContext(TeacherPageContext);

  useEffect(() => {
    if (isSuccess && data.length > 0 && !isPreviousData) {
      const newTestStates: Array<TestState> = [];
      data.map((value) => {
        const testInState = testStates.filter(
          (state) => state.testId === value.tests.id,
        );
        if (testInState.length > 0) {
          newTestStates.push({
            testId: value.tests.id,
            state: testInState[0]?.state!,
          });
          return;
        }
        newTestStates.push({ testId: value.tests.id, state: [] });
      });
      setTestStates(newTestStates);
    }
  }, [data]);

  if (isLoading) {
    return <>Loading...</>;
  }

  if (isError) {
    return (
      <>
        An error occurred.
        {error.message}
      </>
    );
  }
  return (
    <div>
      <div className="fixed left-0 top-0 h-screen w-[25%] bg-[#EDF0FF]">
        <div className="p-3">
          <h1 className="pb-4 text-xl font-bold">Your Tests</h1>
          <div className="flex flex-col gap-3">
            {data.map((value) => {
              return (
                <TestInfoContainer
                  key={value.tests.id}
                  test={value.tests}
                  selected={value.tests.id === currentTestId}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className="ml-[25%]">{props.children ? props.children : null}</div>
    </div>
  );
}

export function TestInfoContainer(props: {
  test: TestType;
  selected: boolean;
}) {
  const test = props.test;
  const selected = props.selected;
  const { setCurrentTestId } = useContext(TeacherPageContext);

  function handleClick() {
    setCurrentTestId(test.id);
    console.log(test.id);
  }

  if (!test) {
    return (
      <div>
        <h1 className="text-lg italic">Test not available</h1>
      </div>
    );
  }

  return (
    <CardContainer>
      <div
        className={`${
          selected
            ? "outline outline-2 outline-[#1A2643] hover:shadow-md hover:shadow-[#1A2643] hover:outline-[#1A2643]"
            : "outline outline-1 outline-[#CADBFF] hover:shadow-md hover:shadow-[#CADBFF] hover:outline-[#849EFA]"
        } w-full rounded-lg bg-white p-3  transition-all hover:-translate-y-1 `}
        onClick={handleClick}
      >
        <p className="text-ellipsis font-light">{test.description}</p>
        <div className="flex items-center justify-between">
          <h1 className="italic">
            Published on {test.publishedAt?.getDay().toString()}
            {"/"}
            {test.publishedAt?.getMonth().toString()}
            {"/"}
            {test.publishedAt?.getFullYear().toString()}
          </h1>
          <div className="rounded bg-[#849EFA] p-2 text-xs text-white">
            {test.difficulty}
          </div>
        </div>
      </div>
    </CardContainer>
  );
}

export function TestSection(props: { children?: ReactNode }) {
  return (
    <div className="h-full rounded-lg border shadow">{props.children}</div>
  );
}

export function TestTopBar() {
  const testId = useContext(TeacherPageContext).currentTestId;

  if (!testId) {
    return <div className="text-black">Select a test</div>;
  }

  const { isLoading, isError, data, error } =
    api.tests.getTestIntroWithId.useQuery({ test_id: testId });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return (
      <div>
        An error occured.
        {error.message}
      </div>
    );
  }
  const test = data.testData!;
  return (
    <div className="rounded-lg shadow">
      <div className="flex flex-row items-center justify-between gap-2 p-4">
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-[#1A2643]">{test.title} </h1>
          <p className="text-sm">{test.description}</p>
        </div>
        <div>
          <p className="font-light">
            Published on: {test.publishDate?.toDateString()}
          </p>
        </div>
      </div>
      <ul className="flex flex-row justify-between  rounded-b-lg bg-[#1A2643] px-3 py-1 text-white">
        <button className="">Save Draft</button>
        <div className="flex flex-row gap-5">
          <button className="">Delete Test</button>
          <button className="">Publish</button>
        </div>
      </ul>
    </div>
  );
}

export function QuestionsSection() {
  const testId = useContext(TeacherPageContext).currentTestId;
  if (!testId) {
    return null;
  }
  const { testStates, setTestStates } = useContext(TeacherPageContext);

  const {
    isError,
    isLoading,
    data,
    error,
    isSuccess,
    isRefetching,
  } = api.tests.getTestDataWithId.useQuery({ test_id: testId });

  useEffect(() => {
    if (isSuccess && !isRefetching) {
      const newStateArray = testStates.map((state) => {
        if (state.testId != testId) {
          return state;
        }
        return {
          ...state,
          state: data,
        };
      });
      setTestStates(newStateArray);
    }
  }, [data]);

  if (isLoading) {
    return <>Loading...</>;
  }

  if (isError) {
    return <>An error occured: {error.message}</>;
  }

  const defaultQuestion: Question = {
    id: Math.random(),
    answerAmount: 1,
    content: "New Question",
    grade: 1,
    testId: testId,
    sequence: testStates.length,
  };

  const defaultAnswer: AnswerType = {
    id: Math.random(),
    questionId: 0,
    content: "New Answer",
    isCorrect: false,
  };

  const test = testStates.filter((state) => state.testId === testId)[0]?.state!;
  function addQuestion() {
    const newTestStates = testStates.map((state) => {
      if (state.testId === testId) {
        return {
          ...state,
          state: [...state.state].concat({
            question: defaultQuestion,
            answers: [],
          }),
        };
      }
      return state;
    });
    setTestStates(newTestStates);
  }

  function deleteQuestion(questionId: number) {
    console.log(questionId);
    const newTestStates = testStates.map((state) => {
      if (state.testId === testId) {
        return {
          ...state,
          state: [...state.state].filter(
            (value) => value.question.id != questionId,
          ),
        };
      }
      return state;
    });
    setTestStates(newTestStates);
  }

  function addAnswer(questionId: number) {
    console.log("adding answer " + questionId);
    const newTestStates = testStates.map((state) => {
      if (state.testId === testId) {
        return {
          ...state,
          state: [...state.state].map((QnA) => {
            if (QnA.question.id === questionId) {
              return {
                ...QnA,
                answers: [...QnA.answers].concat({
                  ...defaultAnswer,
                  questionId: questionId,
                }),
              };
            }
            return QnA;
          }),
        };
      }
      return state;
    });
    setTestStates(newTestStates);
  }

  return (
    <div>
      <Droppable droppableId={"question_list"}>
        {(provided, snapshot) => {
          return (
            <div
              className="flex w-full flex-col gap-y-3 p-2"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {test.map((QnA, index) => {
                return (
                  <div className="">
                    <Question
                      key={QnA.question.id}
                      question={QnA.question}
                      index={index}
                      handleDelete={deleteQuestion}
                    >
                      <AnswerSection
                        answers={QnA.answers}
                        handleAnswerAdd={addAnswer}
                        questionId={QnA.question.id!}
                      />
                    </Question>
                  </div>
                );
              })}
              {provided.placeholder}
            </div>
          );
        }}
      </Droppable>
      <div className="flex w-full flex-row justify-center p-2">
        <button
          className="w-full rounded-lg p-2 text-center text-blue-300 outline outline-1 outline-blue-300"
          onClick={addQuestion}
        >
          Add Question
        </button>
      </div>
    </div>
  );
}

export function AnswerSection(props: {
  questionId: number;
  answers: AnswerType[];
  handleAnswerAdd: (questionId: number) => void;
}) {
  const answers = props.answers;
  return (
    <div className="flex w-full flex-row flex-wrap gap-y-4 ">
      {answers.map((answer) => {
        return <Answer answer={answer} />;
      })}
      <button
        className="w-full rounded-lg bg-white p-2 text-center text-blue-500 outline outline-1 outline-blue-200"
        onClick={() => {
          props.handleAnswerAdd(props.questionId);
        }}
      >
        Add Answer
      </button>
    </div>
  );
}

export function Question(props: {
  question: Question;
  index: number;
  handleDelete: (questionId: number) => void;
  children?: ReactNode;
}) {
  const question = props.question;
  const index = props.index;

  return (
    <Draggable
      draggableId={question.id!.toString()}
      key={question.id!.toString()}
      index={index}
    >
      {(provided, snapshot) => {
        return (
          <div
            className="flex flex-wrap gap-y-2 rounded-lg bg-[#CADBFF] p-3 text-[#1A2643]"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div className="flex w-full flex-row justify-between ">
              <h1 className="text-lg font-bold">{question.content}</h1>
              <div className="flex flex-row gap-3">
                <button
                  className="text-lg"
                  onClick={() => {
                    props.handleDelete(question.id!);
                  }}
                >
                  Delete
                </button>
                <button className="text-lg">Edit</button>
              </div>
            </div>
            {props.children}
          </div>
        );
      }}
    </Draggable>
  );
}

export function Answer(props: { answer: AnswerType }) {
  const answer = props.answer;
  return (
    <div className="w-full rounded bg-white p-3">
      <h1 className="text-black">{answer.content}</h1>
    </div>
  );
}

export type TestState = {
  testId: string;
  state: Array<{ question: Question; answers: AnswerType[] }>;
};

export type TeacherPageContextData = {
  currentTestId: string;
  setCurrentTestId: (testId: string) => void;
  testStates: Array<TestState>;
  setTestStates: (testState: Array<TestState>) => void;
};

const reorder = (list: Array<any>, startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};
