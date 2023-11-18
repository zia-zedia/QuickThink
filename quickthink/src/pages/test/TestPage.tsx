import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { TestContext, TestStartModal } from "./[id]";

export function TestPage() {
  const router = useRouter();
  const test_id = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;

  if (!test_id) {
    return;
  }

  const sessionId = localStorage.getItem("session_id");
  const sessionStarter = api.tests.startSession.useMutation({
    onSuccess: (value) => {
      setTestStarted(true);
      localStorage.setItem("session_id", value[0]?.sessionId!);
    },
  });

  const [testStarted, setTestStarted] = useContext(TestContext);

  function HandleLeaveTest() {
    return;
  }

  function HandleTestStart() {
    setTestStarted(!testStarted);
    return;
    if (!sessionId) {
      sessionStarter.mutate({ test_id: test_id! });
    }
  }
  return (
    <>
      <div
        className={`flex h-full w-full justify-center ${
          testStarted ? "" : "items-center "
        }`}
      >
        <TestStartModal
          test_id={test_id}
          testStarted={testStarted}
          buttonOnClick={HandleTestStart}
        />
      </div>
    </>
  );
}
