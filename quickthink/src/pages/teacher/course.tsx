import Head from "next/head";
import Link from "next/link";
import {
  ReactNode,
  use,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import { ZodString, set, z } from "zod";
import { Navbar } from "~/components/Navbar";
import { CourseType, TestType, UserType } from "~/drizzle/schema";
import { api } from "~/utils/api";
import { CardContainer } from "..";
import { TestComponent } from "../student";
import { desc } from "drizzle-orm";

export type CoursePageContextType = {
  selectedCourse: CourseType | null;
  setSelectedCourse: (course: CourseType | null) => void;
};

export const defaultContext: CoursePageContextType = {
  selectedCourse: null,
  setSelectedCourse: () => {},
};

export const CoursePageContext =
  createContext<CoursePageContextType>(defaultContext);

export default function CoursePage() {
  const [selectedCourse, setSelectedCourse] = useState<CourseType | null>(null);
  const { data, error, isError, isLoading, refetch } =
    api.teacher.getCourses.useQuery();
  const courseAdd = api.courses.addCourse.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const courseUpdate = api.courses.updateCourseData.useMutation({
    onSuccess: () => {
      setSelectedCourse(selectedCourse);
      refetch();
    },
  });

  const courseDelete = api.courses.deleteCourse.useMutation({
    onSuccess: () => {
      setSelectedCourse(null);
      refetch();
    },
  });

  function addCourse() {
    courseAdd.mutate();
  }

  function updateCourse(course: CourseType) {
    if (!selectedCourse) {
      return;
    }
    courseUpdate.mutate({
      course_id: selectedCourse.id,
      name: course.name,
      description: course.description ? course.description : "",
    });
  }

  function deleteCourse(course: CourseType) {
    if (!selectedCourse) {
      return;
    }
    courseDelete.mutate({
      course_id: selectedCourse.id,
    });
  }

  return (
    <>
      <CoursePageContext.Provider value={{ selectedCourse, setSelectedCourse }}>
        <Head>
          <title>Multiple Choice Test</title>
          <meta name="description" content="Generated by create-t3-app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="flex h-screen w-full">
          <Navbar></Navbar>
          <CourseListContainer>
            {isLoading ? (
              <>Loading...</>
            ) : (
              <>
                {isError ? (
                  <>An error occurred. {error.message}</>
                ) : (
                  <>
                    <YourCourses courses={data} handleCourseAdd={addCourse} />
                  </>
                )}
              </>
            )}
          </CourseListContainer>
          <div className="h-full w-full overflow-y-scroll">
            <CourseContainer>
              {!selectedCourse ? (
                <>
                  <div className="text-black">Select a course</div>
                </>
              ) : (
                <div className="">
                  <CourseTopBar
                    course={selectedCourse}
                    handleCourseUpdate={updateCourse}
                    handleCourseDelete={deleteCourse}
                  />
                  <div className="p-2">
                    <div className="flex flex-col gap-3">
                      <ParticipantsSection />
                      <TestList />
                    </div>
                  </div>
                </div>
              )}
            </CourseContainer>
          </div>
        </div>
      </CoursePageContext.Provider>
    </>
  );
}
const usernameValidator = z.string().min(5).max(15);

export function ParticipantsSection() {
  const { selectedCourse } = useContext(CoursePageContext);

  if (!selectedCourse) {
    return <>Select a course</>;
  }

  const { data, error, isLoading, isError, refetch } =
    api.courses.getParticipants.useQuery({ course_id: selectedCourse.id });

  const participantAdd = api.courses.addParticipant.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const participantRemove = api.courses.removeParticipant.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  function addParticipant(username: string) {
    if (!selectedCourse) {
      return;
    }
    participantAdd.mutate({
      username: username,
      course_id: selectedCourse.id,
    });
  }

  function removeParticipant(participant: UserType) {
    if (!selectedCourse) {
      return;
    }
    participantRemove.mutate({
      course_id: selectedCourse.id,
      user_id: participant.id,
    });
  }

  return (
    <>
      {isLoading ? (
        <>Loading...</>
      ) : (
        <>
          {isError ? (
            <>An error occurred {error.message}</>
          ) : (
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold">Participants</h1>
              <Input
                label="Add a participant"
                validator={usernameValidator}
                placeholder="Enter a username"
                buttonValue="Add"
                handleSubmit={addParticipant}
                message={"A username must be between 5 to 15 characters"}
              />
              <ParticipantList
                participants={data.map((value) => {
                  return value.users!;
                })}
                handleParticipantDelete={removeParticipant}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}

export function CourseListContainer(props: { children: ReactNode }) {
  return (
    <div className="sticky h-full w-[25%] bg-[#EDF0FF] p-3">
      <h1 className="pb-4 text-xl font-bold">Your Courses</h1>
      {props.children ? props.children : null}
    </div>
  );
}

export function YourCourses(props: {
  courses: CourseType[];
  handleCourseAdd: () => void;
  children?: ReactNode;
}) {
  const { selectedCourse } = useContext(CoursePageContext);
  const { courses, handleCourseAdd } = props;

  return (
    <div className="flex h-[95%] w-full flex-col gap-3 overflow-y-scroll p-2">
      {courses.length === 0 ? (
        <>
          <span className="italic">No courses found</span>
        </>
      ) : (
        <>
          {courses.map((course) => {
            return (
              <CourseInfoContainer
                key={course.id}
                course={course}
                selected={course.id === selectedCourse?.id}
              />
            );
          })}
        </>
      )}
      <button
        className="w-full rounded-lg bg-white p-2 text-center text-blue-800 outline outline-1 outline-blue-800 transition-all hover:font-bold"
        onClick={handleCourseAdd}
      >
        Add Course
      </button>
    </div>
  );
}

export function CourseContainer(props: { children: ReactNode }) {
  const { selectedCourse } = useContext(CoursePageContext);
  return (
    <div
      className={`${
        selectedCourse ? "rounded-lg shadow" : ""
      } w-full max-w-4xl p-3`}
    >
      {props.children}
    </div>
  );
}

export function CourseInfoContainer(props: {
  course: CourseType;
  selected: boolean;
}) {
  const course = props.course;
  const selected = props.selected;
  const { selectedCourse, setSelectedCourse } = useContext(CoursePageContext);

  function handleClick() {
    setSelectedCourse(course);
  }

  return (
    <CardContainer>
      <div
        className={`${
          selected
            ? "outline outline-2 outline-[#1A2643] hover:shadow-md hover:shadow-[#1A2643] hover:outline-[#1A2643]"
            : "outline outline-1 outline-[#CADBFF] hover:shadow-md hover:shadow-[#CADBFF] hover:outline-[#849EFA]"
        } w-full rounded-lg bg-white p-3 transition-all hover:-translate-y-1`}
        onClick={handleClick}
      >
        <p className="truncate font-bold">{course.name}</p>
        <p className="truncate font-light">{course.description}</p>
      </div>
    </CardContainer>
  );
}

export function CourseTopBar(props: {
  course: CourseType;
  handleCourseUpdate: (course: CourseType) => void;
  handleCourseDelete: (course: CourseType) => void;
}) {
  const { course, handleCourseUpdate, handleCourseDelete } = props;
  const [name, setName] = useState(course.name);
  const [description, setDescription] = useState(course.description);
  const [isDeleting, setIsDeleting] = useState(false);
  const { selectedCourse } = useContext(CoursePageContext);
  const edited = name !== course.name || description !== course.description;

  useEffect(() => {
    if (!selectedCourse) {
      return;
    }
    setName(selectedCourse.name);
    setDescription(selectedCourse.description);
  }, [selectedCourse]);

  return (
    <>
      <div className="rounded-lg border bg-white">
        <div className="flex w-full flex-col">
          <div className="flex flex-row items-center justify-between gap-2 p-4">
            <div className="flex w-full flex-col">
              <input
                className="bg-none text-lg font-bold text-[#1A2643] outline-none"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                }}
              />
              <input
                className="text-sm outline-none"
                value={description ? description : ""}
                onChange={(event) => {
                  setDescription(event.target.value);
                }}
              />
            </div>
            {edited && (
              <button
                className="rounded-lg bg-gray-300 px-3 py-1 text-white outline outline-1 outline-gray-100 transition-all hover:bg-gray-400 hover:outline-gray-300"
                onClick={() => {
                  handleCourseUpdate({
                    id: course.id,
                    name: name,
                    description: description,
                    creatorId: null,
                    organzationId: null,
                  });
                }}
              >
                Save Changes
              </button>
            )}
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
          {isDeleting ? (
            <div className="flex w-full flex-row justify-between p-3">
              <p>Delete this course? This is irreversible.</p>
              <section className="flex flex-row justify-between gap-3">
                <button
                  className="hover: rounded-lg bg-[#d47979] px-4 py-1 text-white transition-all hover:bg-[#bb4343]"
                  onClick={() => {
                    handleCourseDelete(course);
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
          <ul className="flex flex-row justify-between rounded-b-lg bg-[#1A2643] px-3 py-1 text-white"></ul>
        </div>
      </div>
    </>
  );
}

export function Input(props: {
  handleSubmit: (value: string) => void;
  validator: ZodString;
  label?: string;
  placeholder?: string;
  message?: string;
  buttonValue?: string;
}) {
  const [value, setValue] = useState("");
  const [isError, setError] = useState(false);
  const { placeholder, validator, message, label, handleSubmit, buttonValue } =
    props;

  useEffect(() => {
    if (value === "") {
      setError(false);
      return;
    }
    const validation = validator.safeParse(value);
    console.log(validation.success);
    if (validation.success) {
      setError(false);
      return;
    }
    setError(true);
  }, [value]);

  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-white p-3 shadow">
      <label className="text-lg font-bold">{label ? label : ""}</label>
      <div className="flex flex-row justify-between gap-3">
        <input
          value={value}
          placeholder={placeholder ? placeholder : ""}
          onChange={(event) => {
            setValue(event.target.value);
          }}
          className={`${
            isError
              ? "text-red border border-red-500"
              : "border border-gray-300 hover:border-gray-400 "
          } w-[90%] rounded-lg px-2 outline-none transition-all focus:outline-none`}
        />
        <button
          className={`${
            isError || value.length === 0
              ? "bg-blue-100"
              : "bg-blue-300 hover:bg-blue-400"
          } rounded-lg px-4 py-2 font-bold text-white transition-all`}
          onClick={() => {
            if (!isError) {
              handleSubmit(value);
            }
          }}
          disabled={isError || !value}
        >
          {buttonValue ? buttonValue : "Submit"}
        </button>
      </div>
      <p className="text-sm text-red-500">
        {message && isError ? message : null}
      </p>
    </div>
  );
}

export function ParticipantList(props: {
  participants: UserType[];
  handleParticipantDelete: (participant: UserType) => void;
}) {
  const { participants, handleParticipantDelete } = props;
  return (
    <>
      <div className="flex flex-col gap-2 py-2">
        {participants.map((participant) => {
          return (
            <Participant
              participant={participant}
              handleDelete={handleParticipantDelete}
            />
          );
        })}
      </div>
    </>
  );
}

export function Participant(props: {
  participant: UserType;
  handleDelete: (participant: UserType) => void;
}) {
  const { participant, handleDelete } = props;
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-white px-5 py-3 shadow transition-all hover:border-gray-300">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <p className="font-light">
            {participant.firstName} {participant.lastName}
          </p>
          <p className="font-bold italic">@{participant.userName}</p>
        </div>
        <div className="flex flex-row gap-2">
          <p className="rounded-lg bg-blue-400 px-2 py-1 text-white">
            {participant.role}
          </p>
          <button
            className=""
            onClick={() => {
              setIsDeleting(!isDeleting);
            }}
          >
            <div className="h-6 w-6">
              <img
                src={"/trash_icon.svg"}
                alt="Dropdown Toggle"
                className="fill-[#1A2643] object-contain"
              />
            </div>
          </button>
        </div>
      </div>
      {isDeleting ? (
        <div className="flex w-full flex-row justify-between">
          <p>Are you sure you want to unenroll this student?</p>
          <section className="flex flex-row justify-between gap-3">
            <button
              className="hover: rounded-lg bg-[#d47979] px-4 py-1 text-white transition-all hover:bg-[#bb4343]"
              onClick={() => {
                handleDelete(participant);
              }}
            >
              Yes
            </button>
            <button
              className="rounded-lg bg-white px-4 py-1 text-[#1A2643] outline outline-1 outline-gray-300 transition-all hover:bg-gray-200"
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
  );
}

export function TestList() {
  const { selectedCourse } = useContext(CoursePageContext);

  if (!selectedCourse) {
    return;
  }

  const { data, error, isError, isLoading, refetch } =
    api.courses.getCourseTests.useQuery({ course_id: selectedCourse.id });
  const {
    data: teacherTests,
    error: teacherError,
    isError: teacherIsError,
    isLoading: teacherIsLoading,
    refetch: teacherRefetch,
  } = api.courses.getTests.useQuery({ course_id: selectedCourse.id });
  const testAdd = api.courses.addTestsToCourse.useMutation({
    onSuccess: () => {
      console.log("something");
      refetch();
      setIsAdding(false);
    },
  });
  const testRemove = api.courses.removeTestFromCourse.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  useEffect(() => {
    refetch();
    teacherRefetch();
  }, [selectedCourse]);

  const [isAdding, setIsAdding] = useState(false);

  function addTests(tests: TestType[]) {
    if (!selectedCourse) {
      return;
    }
    testAdd.mutate({ course_id: selectedCourse.id, tests: tests });
  }

  function removeTest(test: TestType) {
    if (!selectedCourse) {
      return;
    }
    testRemove.mutate({ test_id: test.id, course_id: selectedCourse.id });
  }

  return (
    <div className="">
      {isLoading ? (
        <>Loading...</>
      ) : (
        <>
          {isError ? (
            <>An error occurred {error.message}</>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <h1 className="text-xl font-bold">Tests</h1>
                {data.length === 0 ? (
                  <>No tests found in this course</>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      {data.map((test) => {
                        return (
                          <Test
                            key={test.id}
                            test={test}
                            handleDelete={removeTest}
                          />
                        );
                      })}
                    </div>
                  </>
                )}
                <div className="relative inline-block w-full">
                  <button
                    className="w-full rounded-lg bg-white p-2 text-center text-blue-300 outline outline-1 outline-blue-300 transition-all hover:font-bold"
                    onClick={() => {
                      setIsAdding(!isAdding);
                    }}
                  >
                    {isAdding ? <p>Cancel</p> : <p>Add Test</p>}
                  </button>
                  {isAdding ? (
                    <div className="absolute z-10 w-full origin-bottom translate-y-1 rounded-lg border bg-white shadow-lg focus:outline-none">
                      <div className="w-full p-2">
                        {teacherIsLoading ? (
                          <>Loading...</>
                        ) : (
                          <>
                            {teacherIsError ? (
                              <>An error ocurred, {teacherError.message}</>
                            ) : (
                              <TestSelection
                                tests={teacherTests}
                                handleTestAdding={addTests}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export function Test(props: {
  test: TestType;
  handleDelete: (test: TestType) => void;
}) {
  const { test, handleDelete } = props;
  const [gettingRemoved, setGettingRemoved] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  return (
    <div
      className={`${
        gettingRemoved ? "opacity-80" : ""
      } flex flex-col gap-2 rounded-lg bg-white p-3 shadow outline outline-1 outline-gray-200`}
    >
      <div className="flex w-full flex-row items-center justify-between ">
        <div className="flex flex-col">
          <h1 className="font-bold">{test.title}</h1>
          <p className="font-light">{test.description}</p>
        </div>
        <button className="h-7 w-7">
          <img
            src={"/minus_icon.svg"}
            alt="Delete"
            className="fill-[#1A2643] object-contain"
            onClick={() => {
              setIsRemoving(!isRemoving);
            }}
          />
        </button>
      </div>
      {isRemoving ? (
        <div className="flex w-full flex-row justify-between">
          <p>Are you sure you want to remove this test from this course?</p>
          <section className="flex flex-row justify-between gap-3">
            <button
              className="hover: rounded-lg bg-[#d47979] px-4 py-1 text-white transition-all hover:bg-[#bb4343]"
              onClick={() => {
                handleDelete(test);
                setIsRemoving(false);
                setGettingRemoved(true);
              }}
            >
              Yes
            </button>
            <button
              className="rounded-lg bg-white px-4 py-1 text-[#1A2643] outline outline-1 outline-gray-300 transition-all hover:bg-gray-200"
              onClick={() => {
                setIsRemoving(false);
              }}
            >
              Cancel
            </button>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export function TestSelection(props: {
  tests: TestType[];
  handleTestAdding: (selectedTests: TestType[]) => void;
}) {
  const [selectedTests, setSelectedTests] = useState<TestType[]>([]);

  function handleTestSelection(test: TestType) {
    const alreadyListed =
      selectedTests.filter((selectedAnswer) => {
        return selectedAnswer.id === test.id;
      }).length > 0;
    console.log(alreadyListed);

    if (alreadyListed) {
      setSelectedTests(
        selectedTests.filter((selectedAnswer) => {
          return !(test.id === selectedAnswer.id);
        }),
      );
      return;
    }
    setSelectedTests(selectedTests.concat(test));
  }

  const { tests, handleTestAdding } = props;
  return (
    <div className="flex flex-col gap-2">
      {tests.map((test) => {
        const isSelected =
          selectedTests.filter((t) => {
            return t.id === test.id;
          }).length === 1;

        return (
          <SelectTest
            key={test.id}
            test={test}
            selected={isSelected}
            handleSelection={(test) => {
              handleTestSelection(test);
            }}
          />
        );
      })}
      <button
        className="w-full rounded-lg bg-blue-400 py-2 text-white transition-all hover:bg-blue-500 hover:font-bold"
        onClick={() => {
          handleTestAdding(selectedTests);
        }}
      >
        Add tests
      </button>
    </div>
  );
}

export function SelectTest(props: {
  test: TestType;
  selected: boolean;
  handleSelection: (test: TestType) => {};
}) {
  const { test, selected, handleSelection } = props;

  return (
    <div
      className={`${
        selected
          ? "outline outline-1 outline-green-300 hover:outline-green-400"
          : "outline outline-1 outline-gray-200 hover:outline-gray-300"
      } w-full rounded-lg px-3 py-4 `}
      onClick={() => {
        handleSelection(test);
      }}
    >
      <div className="flex flex-col justify-between">
        <div>
          <h1 className={`font-bold`}>{test.title}</h1>
          <p className="text-sm font-light">
            Published on {test.publishedAt?.toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
