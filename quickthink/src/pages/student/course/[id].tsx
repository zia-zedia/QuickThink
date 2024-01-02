import Link from "next/link";
import { useRouter } from "next/router";
import { Navbar, StudentNavBar } from "~/components/Navbar";
import { TestType } from "~/drizzle/schema";
import { api } from "~/utils/api";

export default function CourseLayout() {
  return (
    <div className="flex h-screen w-full">
      <StudentNavBar />
      <div className="h-full w-full overflow-y-scroll p-3">
        <CoursePage />
      </div>
    </div>
  );
}

export function CoursePage() {
  const router = useRouter();
  const courseId = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;

  if (!courseId) {
    return;
  }

  const { data, error, isLoading, isError } =
    api.student.getCourseContents.useQuery({
      course_id: courseId,
    });

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
              <h1 className="text-2xl font-bold">{data.course?.name}</h1>
              <div className="flex flex-col gap-3 pt-3">
                {data.tests.map((test) => {
                  return <CourseTest test={test} />;
                })}
                {data.tests.map((test) => {
                  return <CourseTest test={test} />;
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function CourseTest(props: { test: TestType }) {
  const test = props.test;
  return (
    <div className="flex w-full min-w-[30%] flex-col justify-between rounded-lg bg-white p-3 outline outline-1 outline-[#CADBFF] transition-all hover:-translate-y-1 hover:shadow-md hover:shadow-[#CADBFF] hover:outline-[#849EFA]">
      <h1 className="font-bold">{test.title}</h1>
      <p className="font-light italic">
        {test.publishedAt?.toDateString().toString()}
      </p>
      <p className="">
        {test.timeLength! / 60 === 1 ? (
          <>
            <b>{test.timeLength! / 60}</b> minute
          </>
        ) : (
          <>
            <b>{test.timeLength! / 60}</b> minutes
          </>
        )}
      </p>
      <Link
        href={`/test/${test.id}`}
        className="flex w-full items-center justify-center rounded px-2 text-[#849EFA] outline outline-1 outline-[#849EFA] transition-all hover:bg-[#849EFA] hover:text-white"
      >
        Start Test
      </Link>
    </div>
  );
}
