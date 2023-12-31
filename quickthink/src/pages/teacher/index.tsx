import Link from "next/link";
import {
  ReactNode,
  useState,
  createContext,
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  AnswerType,
  Question,
  TestInsert,
  TestType,
  tests,
} from "~/drizzle/schema";
import { api } from "~/utils/api";
import { CardContainer } from "..";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Navbar, TeacherNavbar } from "~/components/Navbar";

const defaultContext: TeacherPageContextData = {
  currentTestId: "",
  setCurrentTestId: () => {},
  testStates: [],
  setTestStates: () => {},
};

export const TeacherPageContext =
  createContext<TeacherPageContextData>(defaultContext);

export default function TeacherLayout() {
  const [currentTestId, setCurrentTestId] = useState("");
  const [testStates, setTestStates] = useState<Array<TestState>>([]);
  const {
    isLoading,
    isError,
    data: checkLogin,
    error,
  } = api.auth.isLoggedIn.useQuery();

  if (isLoading) {
    return;
  }

  if (isError) {
    return <>An error occurred: {error.message}</>;
  }
  if (!(checkLogin.loggedIn && checkLogin.role === "teacher")) {
    window.location.href = "/";
    return;
  }

  return (
    <>
      <TeacherPageContext.Provider
        value={{ currentTestId, setCurrentTestId, testStates, setTestStates }}
      >
        <div className="flex h-screen w-full">
          <TeacherNavbar />
          <YourTests>
            <div className="p-4 lg:max-w-[75%]">
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
        </div>
      </TeacherPageContext.Provider>
    </>
  );
}

export function YourTests(props: { children?: ReactNode }) {
  const {
    isLoading,
    isError,
    data,
    error,
    isSuccess,
    isPreviousData,
    refetch,
    isRefetching,
  } = api.teacher.getTestList.useQuery();

  const testAdd = api.teacher.addTest.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const { currentTestId, testStates, setTestStates } =
    useContext(TeacherPageContext);

  useEffect(() => {
    if ((isSuccess && data.length > 0 && !isPreviousData) || isRefetching) {
      const newTestStates: Array<TestState> = [];
      data.map((value) => {
        const testInState = testStates.filter(
          (state) => state.testId === value.tests.id,
        );
        if (testInState.length > 0) {
          newTestStates.push({
            testId: value.tests.id,
            testData: value.tests,
            state: testInState[0]?.state!,
          });
          return;
        }
        newTestStates.push({
          testId: value.tests.id,
          testData: value.tests,
          state: [],
        });
      });
      setTestStates(newTestStates);
    }
  }, [data]);

  function addTest() {
    testAdd.mutate();
    refetch();
  }

  return (
    <div className="flex h-screen w-full border border-black">
      <div className="sticky h-full w-[25%] bg-[#EDF0FF] p-3">
        <h1 className="text-xl font-bold">Your Tests</h1>
        <div className="h-[95%] w-full overflow-y-scroll p-2">
          {isLoading ? (
            <>Loading...</>
          ) : (
            <>
              {isError ? (
                <>
                  An error occurred.
                  {error.message}
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <h1 className="font-bold">Drafts</h1>
                    {testStates.filter(
                      (value) => value.testData.visibility === "draft",
                    ).length === 0 && <p>No drafts found</p>}
                  </div>
                  {testStates
                    .filter((value) => value.testData.visibility === "draft")
                    .map((value) => {
                      return (
                        <TestInfoContainer
                          key={value.testData.id}
                          test={value.testData}
                          selected={value.testData.id === currentTestId}
                        />
                      );
                    })}
                  <div className="flex flex-col gap-1">
                    <h1 className="font-bold">Published</h1>
                    {testStates.filter(
                      (value) => value.testData.visibility === "public",
                    ).length === 0 && <p>No published tests found</p>}
                  </div>
                  {testStates
                    .filter((value) => value.testData.visibility === "public")
                    .map((value) => {
                      return (
                        <TestInfoContainer
                          key={value.testData.id}
                          test={value.testData}
                          selected={value.testData.id === currentTestId}
                        />
                      );
                    })}
                  <button
                    className="w-full rounded-lg bg-white p-2 text-center text-blue-800 outline outline-1 outline-blue-800 transition-all hover:font-bold"
                    onClick={addTest}
                  >
                    Add Test
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <div className="h-full w-full overflow-y-scroll">
        {props.children ? props.children : null}
      </div>
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
        <div className="flex flex-row justify-between">
          <p className="truncate font-bold">{test.title}</p>
          <img
            src={"/share_icon.svg"}
            alt="Share"
            className="h-[20px] w-[20px] cursor-pointer fill-[#1A2643] object-contain"
            onClick={() => {
              navigator.clipboard.writeText(`${test.id}`);
            }}
          />
        </div>
        <p className="truncate font-light">{test.description}</p>
        <div className="flex items-center justify-between">
          <h1 className="italic">
            Created on {test.publishedAt?.toDateString()}
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
  const testSelected = useContext(TeacherPageContext).currentTestId;

  return (
    <div className={`${testSelected ? "rounded-lg bg-white shadow" : ""}`}>
      {props.children}
    </div>
  );
}

export function TestTopBar() {
  const testId = useContext(TeacherPageContext).currentTestId;
  if (!testId) {
    return <div className="text-black">Select a test</div>;
  }

  const {
    isLoading,
    isError,
    data,
    error,
    refetch,
    isPreviousData,
    isSuccess,
    isRefetching,
  } = api.teacher.getTestIntroWithId.useQuery({ test_id: testId });

  const { currentTestId, setCurrentTestId, testStates, setTestStates } =
    useContext(TeacherPageContext);

  const currentTestState = testStates.filter(
    (state) => state.testId === currentTestId,
  );

  const currentTest = testStates.filter(
    (state) => state.testId === currentTestId,
  )[0]?.testData!;

  const [title, setTitle] = useState(currentTest.title);
  const [description, setDescription] = useState(currentTest.description);
  const [timeLength, setTimeLength] = useState(currentTest.timeLength);
  const [isDeleting, setIsDeleting] = useState(false);
  const publishTest = api.teacher.publishTest.useMutation({
    onSuccess: () => {
      location.reload();
    },
  });
  const saveDraft = api.teacher.saveDraft.useMutation();
  const testDelete = api.teacher.deleteTest.useMutation({
    onSuccess: (value) => {
      setCurrentTestId("");
      const deletedTest = value[0]!;
      const newTestStates = testStates.filter(
        (state) => state.testId != deletedTest.id,
      );
      newTestStates.map((state) => {
        console.log(state.testId);
      });
      setTestStates(newTestStates);
    },
  });
  function deleteTest() {
    testDelete.mutate({ test_id: currentTestId });
  }

  useEffect(() => {
    const newTestStates = testStates.map((state) => {
      if (state.testId === currentTestId) {
        console.log(state.testId);
        console.log(state.testData.title);
        return {
          ...state,
          testData: { ...state.testData, title: title },
        };
      }
      return state;
    });
    setTestStates(newTestStates);
  }, [title]);

  useEffect(() => {
    const newTestStates = testStates.map((state) => {
      if (state.testId === currentTestId) {
        console.log(state.testId);
        console.log(state.testData.title);
        return {
          ...state,
          testData: { ...state.testData, timeLength: timeLength },
        };
      }
      return state;
    });
    setTestStates(newTestStates);
  }, [timeLength]);

  useEffect(() => {
    const newTestStates = testStates.map((state) => {
      if (state.testId === currentTestId) {
        console.log(state.testData.description);
        return {
          ...state,
          testData: { ...state.testData, description: description },
        };
      }
      return state;
    });
    setTestStates(newTestStates);
  }, [description]);

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

  function handleDraftSaving() {
    if (currentTestState.length === 0) {
      return;
    }
    const currentTestData = currentTestState[0];
    saveDraft.mutate({
      test: currentTestData?.testData!,
      draft: currentTestData?.state!,
    });
  }

  function handlePublishing() {
    if (currentTestState.length === 0) {
      return;
    }
    if (currentTestState.length === 0) {
      return;
    }
    const currentTestData = currentTestState[0];
    publishTest.mutate({
      test: currentTestData?.testData!,
      draft: currentTestData?.state!,
    });
  }

  return (
    <div className="rounded-lg border bg-white">
      <div className="flex flex-row items-center justify-between gap-2 p-4">
        <div className="flex flex-col">
          <input
            className="bg-none text-lg font-bold text-[#1A2643] outline-none"
            value={currentTest.title!}
            onChange={(event) => {
              setTitle(event.target.value);
            }}
          />
          <input
            className="text-sm outline-none"
            value={currentTest.description!}
            onChange={(event) => {
              setDescription(event.target.value);
            }}
          />
        </div>
        <div className="flex flex-col">
          <p className="font-light">
            Published on: {data.testData?.publishedAt!.toDateString()}
          </p>
          <div className="flex flex-row gap-2">
            <label className="font-bold">Time in seconds:</label>
            <input
              className="text-sm outline-none"
              type="number"
              value={currentTest.timeLength ? currentTest.timeLength : 0}
              onChange={(event) => {
                setTimeLength(Number(event.target.value));
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col rounded-b-lg bg-[#1A2643] px-3 py-1 text-white">
        <ul className="flex flex-row justify-between ">
          <button
            className=""
            onClick={() => {
              handleDraftSaving();
            }}
          >
            {saveDraft.isLoading ? (
              <div>Saving...</div>
            ) : saveDraft.isSuccess ? (
              <div>Saved succesfully ✓</div>
            ) : saveDraft.isIdle ? (
              <div>Save Changes</div>
            ) : (
              <div>Save Changes</div>
            )}
          </button>
          <div className="flex flex-row gap-5">
            <button
              className=""
              onClick={() => {
                setIsDeleting(!isDeleting);
              }}
            >
              Delete Test
            </button>
            <button className="" onClick={handlePublishing}>
              Publish
            </button>
            <Link href={`/teacher/results/${currentTestId}`}>
              <button className="">View Results</button>
            </Link>
          </div>
        </ul>
        {isDeleting ? (
          <div className="flex w-full flex-row justify-between">
            <p>Delete this test? This is irreversible.</p>
            <section className="flex flex-row justify-between gap-3">
              <button
                className="hover: rounded-lg bg-[#d47979] px-4 py-1 text-white transition-all hover:bg-[#bb4343]"
                onClick={() => {
                  deleteTest();
                }}
              >
                Yes
              </button>
              <button
                className="rounded-lg bg-white px-4 py-1 text-[#1A2643] transition-all hover:bg-gray-200"
                onClick={() => {
                  setIsDeleting(false);
                }}
              >
                Cancel
              </button>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function QuestionsSection() {
  const testId = useContext(TeacherPageContext).currentTestId;
  if (!testId) {
    return null;
  }
  const { testStates, setTestStates } = useContext(TeacherPageContext);

  const { isError, isLoading, data, error, isSuccess, isRefetching } =
    api.tests.getTestDataWithId.useQuery({ test_id: testId });

  const questionDelete = api.teacher.deleteQuestion.useMutation();

  useEffect(() => {
    if (isSuccess && !isRefetching) {
      const newStateArray = testStates.map((state) => {
        if (state.testId != testId) {
          return state;
        }
        return {
          ...state,
          state: data.sort(
            (a, b) => a.question.sequence! - b.question.sequence!,
          ),
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

  async function deleteQuestion(questionId: number) {
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
    if (questionId >= 1) {
      questionDelete.mutate({ questionId: questionId });
    }
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
          className="w-full rounded-lg bg-white p-2 text-center text-blue-300 outline outline-1 outline-blue-300 transition-all hover:font-bold"
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
  isEditable?: boolean;
}) {
  const { answers } = props;
  return (
    <div className="flex w-full flex-row flex-wrap gap-y-4 ">
      {answers.map((answer) => {
        return <Answer key={answer.id} answer={answer} />;
      })}
      <button
        className="w-full rounded-lg bg-white p-2 text-center text-blue-500 outline outline-1 outline-blue-200 hover:font-bold"
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
  const { currentTestId, testStates, setTestStates } =
    useContext(TeacherPageContext);
  const [title, setTitle] = useState(question.content!);
  const [grade, setGrade] = useState(question.grade!);
  const [isDeleting, setIsDeleting] = useState(false);
  const titleInputRef = useRef(null);
  const gradeInputRef = useRef(null);

  useEffect(() => {
    const newTestStates = testStates.map((state) => {
      if (state.testId === currentTestId) {
        return {
          ...state,
          state: [...state.state].map((QnA) => {
            if (QnA.question.id === question.id!) {
              return {
                ...QnA,
                question: {
                  ...question,
                  content: title,
                },
              };
            }
            return QnA;
          }),
        };
      }
      return state;
    });
    setTestStates(newTestStates);
  }, [title]);

  useEffect(() => {
    const newTestStates = testStates.map((state) => {
      if (state.testId === currentTestId) {
        return {
          ...state,
          state: [...state.state].map((QnA) => {
            if (QnA.question.id === question.id!) {
              return {
                ...QnA,
                question: { ...question, grade: grade },
              };
            }
            return QnA;
          }),
        };
      }
      return state;
    });
    setTestStates(newTestStates);
  }, [grade]);

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
            <div className="flex w-full flex-col gap-2">
              <div className="flex w-full flex-row justify-between ">
                <textarea
                  defaultValue={title}
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      titleInputRef.current.blur();
                    }
                  }}
                  rows={1}
                  ref={titleInputRef}
                  className="h-auto w-full resize-none overflow-x-hidden overflow-y-clip bg-[#CADBFF] font-bold text-[#1A2643] outline-none"
                />
                <div className="flex flex-row items-center gap-3">
                  <p className="flex flex-row">
                    Grade:{" "}
                    <input
                      type="number"
                      value={question.grade}
                      ref={gradeInputRef}
                      onChange={(event) => {
                        setGrade(Number(event.target.value));
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          gradeInputRef.current.blur();
                        }
                      }}
                      className="w-[50px] bg-[#CADBFF] font-bold text-[#1A2643] outline-none"
                    />
                  </p>
                  <button className="text-lg">
                    <div className="h-7 w-7">
                      <img
                        src={"/trash_icon.svg"}
                        alt="Delete"
                        className="fill-[#1A2643] object-contain"
                        onClick={() => {
                          setIsDeleting(!isDeleting);
                        }}
                      />
                    </div>
                  </button>
                </div>
              </div>
              {isDeleting ? (
                <div className="flex w-full flex-row justify-between">
                  <p>Are you sure you want to delete this question?</p>
                  <section className="flex flex-row justify-between gap-3">
                    <button
                      className="hover: rounded-lg bg-[#d47979] px-4 py-1 text-white transition-all hover:bg-[#bb4343]"
                      onClick={() => {
                        props.handleDelete(question.id!);
                      }}
                    >
                      Yes
                    </button>
                    <button
                      className="rounded-lg bg-white px-4 py-1 text-[#1A2643] transition-all hover:bg-gray-200"
                      onClick={() => {
                        setIsDeleting(false);
                      }}
                    >
                      Cancel
                    </button>
                  </section>
                </div>
              ) : null}
            </div>
            {props.children}
          </div>
        );
      }}
    </Draggable>
  );
}

export function Answer(props: { answer: AnswerType }) {
  const { answer } = props;
  const { currentTestId, testStates, setTestStates } =
    useContext(TeacherPageContext);
  const [isCorrect, setIsCorrect] = useState(answer.isCorrect);
  const [content, setContent] = useState(answer.content);
  const [ddlOpen, setDDLOpen] = useState(false);
  const answerRef = useRef(null);

  const answerDelete = api.teacher.deleteAnswer.useMutation();

  useEffect(() => {
    const newTestStates = testStates.map((state) => {
      if (state.testId === currentTestId) {
        return {
          ...state,
          state: [...state.state].map((QnA) => {
            if (QnA.question.id === answer.questionId!) {
              return {
                ...QnA,
                answers: [...QnA.answers].map((answerState) => {
                  if (answerState.id === answer.id) {
                    return {
                      ...answerState,
                      isCorrect: isCorrect,
                    };
                  }
                  return answerState;
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
  }, [isCorrect]);

  useEffect(() => {
    const newTestStates = testStates.map((state) => {
      if (state.testId === currentTestId) {
        return {
          ...state,
          state: [...state.state].map((QnA) => {
            if (QnA.question.id === answer.questionId!) {
              return {
                ...QnA,
                answers: [...QnA.answers].map((answerState) => {
                  if (answerState.id === answer.id) {
                    return {
                      ...answerState,
                      content: content!,
                    };
                  }
                  return answerState;
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
  }, [content]);

  function deleteAnswer(questionId: number, answerId: number) {
    console.log("removingId " + questionId + " " + answerId);
    const newTestStates = testStates.map((state) => {
      if (state.testId === currentTestId) {
        return {
          ...state,
          state: [...state.state].map((QnA) => {
            if (QnA.question.id === questionId) {
              console.log("hi");
              return {
                ...QnA,
                answers: [...QnA.answers!].filter((answer) => {
                  return answer.id !== answerId;
                }),
              };
            }
            console.log("hello");
            return QnA;
          }),
        };
      }
      return state;
    });
    if (answerId >= 0) {
      answerDelete.mutate({ answerId: answerId });
    }
    setTestStates(newTestStates);
  }

  return (
    <div className="w-full rounded bg-white p-3">
      <div className="flex flex-row items-center justify-between">
        <div className="flex w-full flex-row items-center gap-3">
          {isCorrect ? (
            <div className="h-7 w-7 ">
              <img
                src={"/green_tick.png"}
                alt="Correct Answer"
                className="w-full fill-[#1A2643] object-cover"
                onClick={() => {
                  setIsCorrect(!isCorrect);
                }}
              />
            </div>
          ) : (
            <div
              className="h-7 w-7"
              onClick={() => {
                setIsCorrect(!isCorrect);
              }}
            >
              <img
                src={"/red_cross.png"}
                alt="Wrong Answer"
                className="w-full fill-[#1A2643] object-cover"
              />
            </div>
          )}
          <input
            type="text"
            value={content!}
            onChange={(event) => {
              setContent(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                answerRef.current.blur();
              }
            }}
            ref={answerRef}
            className="w-full bg-none text-[#1A2643] outline-none"
          />
        </div>
        <div className="relative inline-block">
          <div className="">
            <button
              className=""
              onClick={() => {
                setDDLOpen(!ddlOpen);
              }}
            >
              <div className="h-6 w-6">
                <img
                  src={"/ellipsis_icon.svg"}
                  alt="Dropdown Toggle"
                  className="fill-[#1A2643] object-contain"
                />
              </div>
            </button>
          </div>
          {ddlOpen ? (
            <div
              className="absolute right-0 z-10 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
            >
              <div className="w-full p-2" role="none">
                <button
                  className="w-full rounded px-4 py-2 text-sm text-[#1A2643] transition-all hover:bg-gray-300 hover:text-white"
                  id="menu-item-1"
                  onClick={() => {
                    deleteAnswer(props.answer.questionId, props.answer.id!);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export type TestState = {
  testId: string;
  testData: TestType;
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
