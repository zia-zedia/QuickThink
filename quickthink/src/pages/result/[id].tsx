import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Link from "next/link";

export default function ResultPage() {
  const router = useRouter();
  const resultId = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;

  if (!resultId) {
    return;
  }

  const { data, error, isLoading, isError } = api.student.getResult.useQuery({
    result_id: resultId,
  });

  return (
    <>
      <div className="h-full min-h-screen bg-[#EDF0FF]">
        <div className="flex h-screen w-full flex-col items-center justify-center">
          <div className="w-full max-w-3xl ">
            <div
              className={`flex flex-col gap-y-3 rounded-t-lg bg-[#FBFBFF] p-4 shadow-lg`}
            >
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <p>
                  {isError ? (
                    <p>An error occurred: {error.message}</p>
                  ) : (
                    <>
                      {!data.result ? (
                        <p>No data found</p>
                      ) : (
                        <div className="flex flex-row items-center justify-between gap-2 ">
                          <div className="flex flex-col">
                            <h1 className="text-md font-bold text-[#1A2643]">
                              {data.test?.title}
                            </h1>
                            <p className="text-lg italic">
                              Grade: {data.result.grade * 100} / 100
                            </p>
                          </div>
                          <div>
                            <p className="font-light">
                              Great job, keep focusing.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </p>
              )}
            </div>
            <Link
              href={"/student"}
              className="flex justify-end rounded-b-lg bg-[#1A2643] px-3 py-1 text-white"
            >
              Go back to dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
