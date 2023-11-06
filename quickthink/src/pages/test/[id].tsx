import { Head } from "next/document";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

export default function TestPage() {
  const router = useRouter();
  const test_id = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;

  if (!test_id) {
    return;
  }
  const testData = api.tests.getTestWithId.useQuery({ test_id: test_id });

  if (!testData) {
    return <>Loading...</>;
  }

  if (testData.isError) {
    if (testData.error.data?.code === "BAD_REQUEST") {
      return <>An error happened, make sure you entered a valid test id.</>;
    }
    if (testData.error.data?.code === "NOT_FOUND") {
      return (
        <>
          We couldn't find a test with this id, make sure you entered a valid
          test id
        </>
      );
    }
  }

  return <>{testData.data?.testData?.title}</>;
}
