import Link from "next/link";
import { ReactNode } from "react";
import { TestType as Test } from "~/drizzle/schema";
import { api } from "~/utils/api";
import { Card, CardContainer, Section } from "..";
import { Navbar } from "~/components/Navbar";

export default function StudentLayout(props: { children: ReactNode }) {
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

  if (!(checkLogin?.loggedIn && checkLogin.role === "student")) {
    window.location.href = "/";
    return;
  }

  return (
    <>
      <div className="flex h-screen w-full bg-[#EDF0FF]">
        <Navbar>
          <Link href={"#"}>Something</Link>
          <Link href={"#"}>Something</Link>
          <Link href={"#"}>Something</Link>
        </Navbar>
        <StudentIndex />
      </div>
    </>
  );
}

export function StudentIndex() {
  return (
    <div className="w-full">
      <div className="flex h-full w-full flex-col items-center overflow-y-scroll">
        <AllTests />
        <Courses />
      </div>
    </div>
  );
}

export function AllTests() {
  const { isLoading, isError, data, error } =
    api.student.getTestList.useQuery();
  if (isLoading) {
    return <>Loading...</>;
  }
  if (isError) {
    return <>An error occurred</>;
  }

  return (
    <>
      <div className="w-full max-w-7xl p-2">
        <div className="rounded-[20px] bg-white p-4 shadow-sm">
          <h1 className="pb-4 text-3xl font-bold">Test List</h1>
          <div>
            <div className="flex w-full flex-row gap-2 overflow-x-scroll px-1 py-2">
              {data.map((testData) => {
                const test = testData.tests;
                return (
                  <div className="flex w-full min-w-[30%] flex-col justify-between rounded-lg bg-white p-3 outline outline-1 outline-[#CADBFF] transition-all hover:-translate-y-1 hover:shadow-md hover:shadow-[#CADBFF] hover:outline-[#849EFA]">
                    <div>
                      <h1 className="text-xl font-semibold">{test.title}</h1>
                      <p className="text-ellipsis font-light">
                        {test.description}
                      </p>
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
                    <div>
                      <div className="my-2 flex w-full items-center justify-center rounded px-2 text-[#849EFA] outline outline-1 outline-[#849EFA] transition-all hover:bg-[#849EFA] hover:text-white">
                        <Link href={`/test/${test.id}`}>Start test</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function Courses() {
  const { isLoading, isError, data, error } = api.student.getCourses.useQuery();
  if (isLoading) {
    return <>Loading...</>;
  }
  if (isError) {
    return <>An error occurred {error.message}</>;
  }

  return (
    <>
      <div className="w-full max-w-7xl  p-2">
        <div className="rounded-[20px] bg-white p-4 shadow-sm">
          <h1 className="pb-4 text-3xl font-bold">Courses List</h1>
          <div className="flex w-full flex-row gap-2 overflow-x-scroll px-1 py-2">
            {data.map((courseData) => {
              const course = courseData.courses;
              return (
                <div className="flex w-full min-w-[50%] flex-col gap-3 rounded-lg bg-white p-3 outline outline-1 outline-[#CADBFF] transition-all hover:-translate-y-1 hover:shadow-md hover:shadow-[#CADBFF] hover:outline-[#849EFA]">
                  <div className="flex h-full flex-col justify-between">
                    <h1 className="text-ellipsis pb-1 text-xl font-semibold">
                      {course.name}
                    </h1>
                    <p className="text-ellipsis font-light">
                      {course.description}
                    </p>
                  </div>
                  <div className="flex items-center md:justify-end">
                    <Link
                      href={`student/course/${course.id}`}
                      className="w-full rounded px-2 text-center text-[#849EFA] outline outline-1 outline-[#849EFA] hover:bg-[#849EFA] hover:text-white"
                    >
                      View Course Contents
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export function TestComponent(props: { test: Test }) {
  const test = props.test;
  return (
    <div className="flex w-full max-w-lg flex-col rounded bg-[#CADBFF] p-3 shadow">
      <h1 className="font-bold text-white">{test.title}</h1>
      <div>
        <p className="font-light text-white">{test.description}</p>
      </div>
      <button className="rounded bg-white text-black">
        <Link href={`/test/${test.id}`}>Start test</Link>
      </button>
    </div>
  );
}
