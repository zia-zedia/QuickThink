import { ReactNode, useState } from "react";
import { api } from "~/utils/api";
import { QuestionSection } from "../test/old id";
import { Head } from "next/document";

export function DashboardLayout(props: { children: ReactNode }) {
  return (
    <div className="h-screen">
      <div className="">{props.children}</div>
    </div>
  );
}
export default function DashBoard() {
  return (
    <DashboardLayout>
      <TestsContainer />
    </DashboardLayout>
  );
}

export function TestsContainer() {
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);

  function handleTestClick(id: number) {
    setSelectedTestId(id === selectedTestId ? selectedTestId : id);
    console.log(selectedTestId);
  }
  return (
    <div className="flex flex-row border">
      <div className="fixed left-0 top-0 h-full w-[25%] bg-[#EDF0FF] p-3">
        <h1 className="text-xl font-bold">Your tests</h1>
        <div className="my-3 h-[1px] w-full bg-[#1A2643]"></div>
        <YourTests selectedTestId={selectedTestId} onClick={handleTestClick} />
      </div>
      <div className="mx-[25%] min-h-screen w-[50%] border p-2">
        {selectedTestId ? <Test testId={selectedTestId} /> : <></>}
      </div>
    </div>
  );
}

export function YourTests(props: {
  selectedTestId: number | null;
  onClick: (id: number) => void;
}) {
  const testsData = api.dashboard.getCompleteTests.useQuery();

  if (!testsData.data) {
    return <Loading />;
  }

  if (testsData.data.tests.length == 0) {
    return <NoResults />;
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {testsData.data?.tests.map((testData) => {
          return (
            <div
              key={testData.id}
              className={`rounded ${
                props.selectedTestId != null &&
                props.selectedTestId === testData.id
                  ? "border border-[#1A2643]"
                  : ""
              }`}
            >
              <TestData
                testData={{
                  id: testData.id,
                  title: testData.title!,
                  category: testData.category!,
                }}
                onClick={props.onClick}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

export function TestData(props: {
  testData: { id: number; title: string; category: string };
  onClick: (id: number) => void;
}) {
  const id = props.testData.id;
  const test = props.testData.title;
  const category = props.testData.category;

  return (
    <div
      className="rounded bg-white p-2 text-[#1A2643] shadow"
      onClick={() => {
        props.onClick(id);
      }}
    >
      <h1 className="font-light">{test}</h1>
      <p className="text-sm">
        Category: <span className="font-bold">{category}</span>
      </p>
    </div>
  );
}

export function Test(props: { testId: number }) {
  const fullTestData = api.tests.getFullTest.useQuery({
    test_id: props.testId.toString(),
  });
  const testQna = api.tests.getQuestions.useQuery({
    test_id: props.testId.toString(),
  }).data;

  if (!fullTestData || !testQna) {
    return <Loading />;
  }

  return (
    <>
      <div className="h-full rounded border p-3 shadow">
        <p className="font-bold">{fullTestData.data?.test?.title}</p>
        <div>
          {testQna.QnA.map((qna) => {
            return <QuestionSection qna={qna} />;
          })}
        </div>
      </div>
    </>
  );
}

export function Loading() {
  return <div className="text-lg">Loading...</div>;
}

export function NoResults() {
  return <div>There are no tests</div>;
}
