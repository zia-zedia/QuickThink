import Link from "next/link";
import { useRouter } from "next/router";
import { Navbar, StudentNavBar, TeacherNavbar } from "~/components/Navbar";
import {
  ResultAnswerType,
  ResultType,
  TestType,
  UserType,
} from "~/drizzle/schema";
import { api } from "~/utils/api";

export default function CourseLayout() {
  return (
    <div className="flex h-screen w-full">
      <TeacherNavbar />
      <div className="h-full w-full overflow-y-scroll p-3">
        <ResultsPage />
      </div>
    </div>
  );
}

export function ResultsPage() {
  const router = useRouter();
  const testId = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;

  if (!testId) {
    return;
  }

  const { data, error, isLoading, isError } =
    api.teacher.getTestResults.useQuery({
      test_id: testId,
    });

  const {
    isLoading: resLoading,
    isError: reIsError,
    data: checkLogin,
    error: reError,
  } = api.auth.isLoggedIn.useQuery();

  if (resLoading) {
    return;
  }

  if (reIsError) {
    return <>An error occurred: {reError.message}</>;
  }

  if (!(checkLogin.loggedIn && checkLogin.role === "teacher")) {
    window.location.href = "/";
    return;
  }

  return (
    <div className="flex w-full justify-center ">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="h-full w-full max-w-5xl rounded-lg border bg-white p-3 shadow">
          {isError ? (
            <>An error occured {error.message}</>
          ) : (
            <>
              <h1 className="text-2xl font-bold">
                Test Results for testID: {testId}
              </h1>
              <div className="flex flex-col gap-3 pt-3">
                {data.map((dataPoint) => {
                  return <Result resultData={dataPoint!} />;
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function Result(props: {
  resultData: { results: ResultType; users: UserType; tests: TestType };
}) {
  const { results, users, tests } = props.resultData;

  return (
    <div>
      <div
        className={`flex flex-col gap-y-3 rounded-t-lg bg-[#FBFBFF] p-4 shadow-lg`}
      >
        <div className="flex flex-row items-center justify-between gap-2 ">
          <div className="flex flex-col">
            <h1 className="text-md font-bold text-[#1A2643]">{tests.title}</h1>
            <p className="text-lg font-bold italic">
              Student: {users.firstName} {users.lastName}
            </p>
            <p className="text-lg font-bold italic">
              username: @{users.userName}
            </p>
            <p className="text-lg italic">
              Grade: {results.grade! * 100} / 100
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-end gap-3 rounded-b-lg bg-[#1A2643] px-3 py-1 text-white">
        <Link
          href={"/student"}
          className="flex justify-end rounded-b-lg bg-[#1A2643] px-3 py-1 text-white"
        >
          Go back to dashboard
        </Link>
        <Link href={`/result/detail/${results.id}`}>View Result Details</Link>
      </div>
    </div>
  );
}
