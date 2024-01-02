import { useRouter } from "next/router";
import { ReactNode } from "react";
import { Answer, AnswerType, Question, TestType } from "~/drizzle/schema";
import { api } from "~/utils/api";

export default function ResultDetails() {
  const router = useRouter();
  const result_id = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;
  true;
  if (!result_id) {
    return;
  }

  const { data, error, isLoading, isError } =
    api.results.getResultDetails.useQuery({ result_id: result_id });

  return (
    <>
      {isLoading ? (
        <>Loading...</>
      ) : (
        <>
          {isError ? (
            <>An error occured {error.message}</>
          ) : (
            <>
              <div className="flex h-full min-h-screen flex-col items-center bg-[#EDF0FF]">
                <ResultTopBar test={testTest} />
                <ResultContainer>
                  {testQnA.map((qna) => {
                    return (
                      <Result
                        QnA={qna}
                        studentAnswers={
                          testStudentAnswer.find(
                            (stuQna) => stuQna.question.id === qna.question.id,
                          )!
                        }
                      />
                    );
                  })}
                </ResultContainer>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
// export const testTest: TestType = {
//   id: "1",
//   title: "Test",
//   description: "Test Description",
//   publishedAt: new Date(),
// };

// export const testQnA: { question: Question; answers: AnswerType[] }[] = [
//   {
//     question: { id: 1, content: "Question 1", grade: 1 },
//     answers: [
//       { id: 1, content: "Answer 1", isCorrect: false, questionId: 1 },
//       { id: 2, content: "Answer 2", isCorrect: false, questionId: 1 },
//       { id: 3, content: "Answer 3", isCorrect: true, questionId: 1 },
//     ],
//   },
//   {
//     question: { id: 2, content: "Question 2", grade: 1 },
//     answers: [
//       { id: 1, content: "Answer 1", isCorrect: false, questionId: 2 },
//       { id: 2, content: "Answer 2", isCorrect: true, questionId: 2 },
//       { id: 3, content: "Answer 3", isCorrect: false, questionId: 2 },
//     ],
//   },
// ];

// export const testStudentAnswer: {
//   question: Question;
//   answers: AnswerType[];
// }[] = [
//   {
//     question: { id: 1, content: "Question 1", grade: 1 },
//     answers: [{ id: 3, content: "Answer 3", isCorrect: true, questionId: 1 }],
//   },
//   {
//     question: { id: 2, content: "Question 1", grade: 1 },
//     answers: [
//       { id: 2, content: "Answer 2", isCorrect: false, questionId: 2 },
//       { id: 3, content: "Answer 3", isCorrect: true, questionId: 3 },
//     ],
//   },
// ];

export function ResultContainer(props: { children?: ReactNode }) {
  return (
    <div className="flex w-full max-w-5xl flex-col gap-3 p-2">
      {props.children ? props.children : null}
    </div>
  );
}

export function Result(props: {
  QnA: { question: Question; answers: AnswerType[] };
  studentAnswers: { question: Question; answers: AnswerType[] };
}) {
  const { QnA, studentAnswers } = props;

  return (
    <div className="flex flex-col gap-3">
      <QuestionComponent question={QnA.question}>
        {QnA.answers.map((answer) => {
          return (
            <Answer
              answer={answer}
              isCorrect={answer.isCorrect!}
              isSelected={studentAnswers.answers.find(
                (stuAnswer) => stuAnswer.id === answer.id,
              )}
            />
          );
        })}
      </QuestionComponent>
    </div>
  );
}

export function QuestionComponent(props: {
  children: ReactNode;
  question: Question;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-[#CADBFF] p-2 shadow">
      <div className="flex flex-row justify-between">
        <h1 className="max-w-[80%] px-3 py-2 font-bold">
          {props.question.content}
        </h1>
        <h1 className="max-w-[80%] px-3 py-2 ">
          <p>
            Max Grade: <span className="font-bold">{props.question.grade}</span>
          </p>
        </h1>
      </div>
      <div className="flex w-full flex-col gap-2 p-2">{props.children}</div>
    </div>
  );
}

export function Answer(props: {
  answer: Answer;
  isSelected?: boolean;
  isCorrect?: boolean;
}) {
  const { answer, isSelected, isCorrect } = props;
  return (
    <>
      <div
        className={`
        ${
          isCorrect
            ? "bg-green-100 outline outline-1 outline-green-400"
            : "bg-white"
        }
        ${
          isSelected && !isCorrect
            ? "bg-red-100 outline outline-2 outline-red-400"
            : "bg-white"
        } flex flex-row items-center gap-x-3 rounded px-3 py-2 font-light transition-all hover:font-bold hover:shadow hover:outline-[3px]`}
        key={answer.id}
      >
        <div className="">{answer.content}</div>
      </div>
    </>
  );
}

export function ResultTopBar(props: { test: TestType }) {
  const { test } = props;
  return (
    <div className="w-full max-w-5xl rounded-lg border bg-white">
      <div className="flex flex-row items-center justify-between gap-2 p-4 ">
        <div className="flex flex-col text-lg">
          <h1 className="font-bold text-[#1A2643]">{test.title}</h1>
          <h1 className="font-light text-[#1A2643]">{test.description}</h1>
        </div>
        <div className="flex flex-col">
          <p className="font-light">
            Published on: {test.publishedAt!.toDateString()}
          </p>
        </div>
      </div>
      <div className="flex flex-col rounded-b-lg bg-[#1A2643] px-3 py-1 text-white"></div>
    </div>
  );
}
