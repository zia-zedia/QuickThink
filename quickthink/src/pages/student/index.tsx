import Link from "next/link";
import { ReactNode } from "react";
import { TestType as Test } from "~/drizzle/schema";
import { api } from "~/utils/api";
import { Card, CardContainer, Section } from "..";

export default function StudentLayout() {
  return <StudentIndex />;
}

export function StudentIndex() {
  return (
    <div className="flex h-screen flex-col items-center bg-[#EDF0FF]">
      <AllTests />
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
      <div className="w-full max-w-7xl  p-2">
        <div className="rounded-[20px] bg-white p-4 shadow-sm">
          <h1 className="pb-4 text-3xl font-bold">Test List</h1>
          <div>
            <CardContainer>
              {data.map((test) => {
                return (
                  <Card title={test.title}>
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
                    <div className="w-full rounded px-2 text-[#849EFA] outline outline-1 outline-[#849EFA] hover:bg-[#849EFA] hover:text-white">
                      <Link href={`/test/${test.id}`}>Start test</Link>
                    </div>
                  </Card>
                );
              })}
            </CardContainer>
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
    return <>An error occurred</>;
  }

  return (
    <>
      <div className="w-full max-w-7xl  p-2">
        <div className="rounded-[20px] bg-white p-4 shadow-sm">
          <h1 className="pb-4 text-3xl font-bold">Courses List</h1>
          <div>
            <CardContainer>
              {data.map((course) => {
                return (
                  <Card title={course.name}>
                    <div className="flex flex-col gap-2">
                      <p className="text-ellipsis font-light">
                        {course.description}
                      </p>
                      <div className="flex justify-center md:justify-end">
                        <button className="w-full rounded px-2 text-[#849EFA] outline outline-1 outline-[#849EFA] hover:bg-[#849EFA] hover:text-white">
                          View Course Contents
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </CardContainer>
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
