import { ReactNode, useState, createContext } from "react";
import { TestType } from "~/drizzle/schema";
import { api } from "~/utils/api";

export default function TeacherLayout() {
  return (
    <>
      <YourTests />
    </>
  );
}

export function YourTests() {
  const { isLoading, isError, data, error } =
    api.teacher.getTestList.useQuery();

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
      <h1>Your Tests</h1>
      {data.map((value) => {
        return <>{value.tests.title}</>;
      })}
    </div>
  );
}

export function TestContainer() {
  return (
    <div>
      <h1></h1>
    </div>
  );
}
