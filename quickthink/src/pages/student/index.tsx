import Link from "next/link";
import { ReactNode } from "react";
import { TestType as Test } from "~/drizzle/schema";
import { api } from "~/utils/api";

export default function StudentLayout() {
  return <StudentIndex />;
}

export function StudentIndex() {
  return (
    <>
      <AllTests />
    </>
  );
}

export function StudentDashboard() {
  return (
    <div>
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
      <div className="p-3">
        <div className="text-2xl font-bold">Test List</div>
        <div className="flex justify-center gap-3">
          {data.map((test) => {
            return <TestComponent test={test} />;
          })}
        </div>
      </div>
    </>
  );
}

export function TestComponent(props: { test: Test }) {
  const test = props.test;
  return (
    <div className="flex w-full max-w-lg flex-col rounded bg-[#CADBFF] p-3 shadow">
      <h1 className="font-bold">{test.title}</h1>
      <div>
        <p className="font-light">{test.description}</p>
      </div>
      <button className="rounded bg-white text-black">
        <Link href={`/test/${test.id}`}>Start test</Link>
      </button>
    </div>
  );
}
