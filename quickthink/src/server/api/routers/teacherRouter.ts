import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  authenticatedProcedure,
  teacherProcedure,
} from "../trpc";
import {
  ZodAnswer,
  ZodInsertAnswer,
  ZodInsertQuestion,
  ZodInsertTest,
  ZodQuestion,
  answers,
  courses,
  questions,
  tests,
  users,
} from "~/drizzle/schema";
import { eq } from "drizzle-orm";

export const teacherRouter = createTRPCRouter({
  getTestList: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(tests)
      .leftJoin(users, eq(tests.teacherId, users.id));
  }),
  saveDraft: publicProcedure
    .input(
      z.object({
        test: ZodInsertTest,
        draft: z.array(
          z.object({
            question: ZodInsertQuestion,
            answers: z.array(ZodInsertAnswer),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = ctx.db;
      input.draft.map(async (QnA, index) => {
        // I used Math.Random for the new questions, so they have to be inbetween 0 and 1
        console.log(QnA.question.id!);
        console.log(QnA.question.content!);
        if (QnA.question.id! >= 1) {
          console.log("updating");
          await db.transaction(async (tx) => {
            await tx
              .update(questions)
              .set({ content: QnA.question.content, sequence: index })
              .where(eq(questions.id, QnA.question.id!));

            QnA.answers.map(async (answer) => {
              if (answer.id! >= 1) {
                console.log("updating answer");
                console.log(answer.id!);
                console.log(answer.content);
                await tx
                  .update(answers)
                  .set({
                    content: answer.content,
                    isCorrect: answer.isCorrect!,
                  })
                  .where(eq(answers.id, answer.id!));
              } else if (answer.id! > 0 && answer.id! < 1) {
                console.log("inserting answer");
                console.log(answer.content);
                await tx.insert(answers).values({
                  questionId: QnA.question.id!,
                  content: answer.content,
                  isCorrect: answer.isCorrect,
                });
              }
            });
          });
        } else if (QnA.question.id! > 0 && QnA.question.id! < 1) {
          console.log("inserting a new question");
          await db.transaction(async (tx) => {
            const newQuestionId = await tx
              .insert(questions)
              .values({
                content: QnA.question.content,
                sequence: index,
                testId: input.test.id!,
              })
              .returning({ insertedId: questions.id });

            QnA.answers.map(async (answer) => {
              if (answer.id! >= 1) {
                console.log("updating answer");
                tx.update(answers).set({
                  content: answer.content,
                  isCorrect: answer.isCorrect!,
                });
              } else if (answer.id! > 0 && answer.id! < 1) {
                console.log("inserting answer");
                await tx.insert(answers).values({
                  questionId: newQuestionId[0]?.insertedId!,
                  content: answer.content,
                  isCorrect: answer.isCorrect,
                });
              }
            });
          });
        }
      });
    }),
});
