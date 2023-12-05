import {
  ReactNode,
  useState,
  createContext,
  useContext,
  useEffect,
} from "react";
import { Question, TestType } from "~/drizzle/schema";
import { api } from "~/utils/api";
import { CardContainer } from "..";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { number } from "zod";

export type TeacherPageContextData = {
  currentTestId: string;
  SetCurrentTestId: (testId: string) => void;
};

export const TeacherPageContext = createContext<TeacherPageContextData>();

export default function TeacherLayout() {
  const [currentTestId, SetCurrentTestId] = useState("");
  return (
    <>
      <TeacherPageContext.Provider value={{ currentTestId, SetCurrentTestId }}>
        <YourTests>
          {/*
          <div className="">
          <TestSection />
          </div>
  */}
          <div className="h-screen w-full p-4 lg:max-w-[75%]">
            <TestSection>
              <TestTopBar />
              <DragDropContext onDragEnd={() => {}}>
                <QuestionsSection />
              </DragDropContext>
            </TestSection>
          </div>
        </YourTests>
      </TeacherPageContext.Provider>
    </>
  );
}

export function YourTests(props: { children?: ReactNode }) {
  const { isLoading, isError, data, error } =
    api.teacher.getTestList.useQuery();

  const { currentTestId } = useContext(TeacherPageContext);

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
      <div className="fixed left-0 top-0 h-screen w-[25%] bg-[#EDF0FF]">
        <div className="p-3">
          <h1 className="pb-4 text-xl font-bold">Your Tests</h1>
          <div className="flex flex-col gap-3">
            {data.map((value) => {
              return (
                <TestInfoContainer
                  key={value.tests.id}
                  test={value.tests}
                  selected={value.tests.id === currentTestId}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className="ml-[25%]">{props.children ? props.children : null}</div>
    </div>
  );
}

export function TestInfoContainer(props: {
  test: TestType;
  selected: boolean;
}) {
  const test = props.test;
  const selected = props.selected;
  const { SetCurrentTestId } = useContext(TeacherPageContext);

  function handleClick() {
    SetCurrentTestId(test.id);
    console.log(test.id);
  }

  if (!test) {
    return (
      <div>
        <h1 className="text-lg italic">Test not available</h1>
      </div>
    );
  }

  return (
    <CardContainer>
      <div
        className={`${
          selected
            ? "outline outline-2 outline-[#1A2643] hover:shadow-md hover:shadow-[#1A2643] hover:outline-[#1A2643]"
            : "outline outline-1 outline-[#CADBFF] hover:shadow-md hover:shadow-[#CADBFF] hover:outline-[#849EFA]"
        } w-full rounded-lg bg-white p-3  transition-all hover:-translate-y-1 `}
        onClick={handleClick}
      >
        <p className="text-ellipsis font-light">{test.description}</p>
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
    </CardContainer>
  );
}

export function TestSection(props: { children?: ReactNode }) {
  return (
    <div className="h-full rounded-lg border shadow">{props.children}</div>
  );
}

export function TestTopBar() {
  const testId = useContext(TeacherPageContext).currentTestId;

  if (!testId) {
    return <div className="text-black">Select a test</div>;
  }

  const { isLoading, isError, data, error } =
    api.tests.getTestIntroWithId.useQuery({ test_id: testId });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return (
      <div>
        An error occured.
        {error.message}
      </div>
    );
  }
  const test = data.testData!;
  return (
    <div className="rounded-lg shadow">
      <div className="flex flex-row items-center justify-between gap-2 p-4">
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-[#1A2643]">{test.title} </h1>
          <p className="text-sm">{test.description}</p>
        </div>
        <div>
          <p className="font-light">
            Published on: {test.publishDate?.toDateString()}
          </p>
        </div>
      </div>
      <ul className="flex flex-row justify-end gap-3 rounded-b-lg bg-[#1A2643] px-3 py-1 text-white">
        <button className="">Hello</button>
        <button className="">Hello</button>
      </ul>
    </div>
  );
}

export const randomStuff = [
  { id: 1, title: "something1" },
  { id: 2, title: "something2" },
  { id: 3, title: "something3" },
];

export function QuestionsSection() {
  const testId = useContext(TeacherPageContext).currentTestId;

  if (!testId) {
    return null;
  }

  const { isError, isLoading, data, error } =
    api.tests.getTestDataWithId.useQuery({ test_id: testId });

  if (isLoading) {
    return <>Loading...</>;
  }

  if (isError) {
    return <>An error occured: {error.message}</>;
  }
  return (
    <Droppable droppableId={testId}>
      {(provided, snapshot) => {
        return (
          <div
            className="w-full border border-black p-2"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {data.map((QnA, index) => {
              return (
                <Question
                  key={QnA.question.id}
                  question={QnA.question}
                  index={index}
                />
              );
            })}
            {provided.placeholder}
          </div>
        );
      }}
    </Droppable>
  );
}

export function Question(props: { question: Question; index: number }) {
  const question = props.question;
  const index = props.index;

  return (
    <Draggable
      draggableId={question.id!.toString()}
      key={question.id!.toString()}
      index={index}
    >
      {(provided, snapshot) => {
        return (
          <div
            className="rounded bg-blue-300 p-2 text-black"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            {question.content}
          </div>
        );
      }}
    </Draggable>
  );
}

export function DragTest(props: { index: number; test: string }) {
  return (
    <Draggable draggableId={props.index.toString()} index={props.index}>
      {(provided) => {
        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.draggableProps}
          >
            {props.test}
          </div>
        );
      }}
    </Draggable>
  );
}

export function QuestionContainer(props: { children?: ReactNode }) {
  return <div>{props.children}</div>;
}

export function AnswerContainer() {}
