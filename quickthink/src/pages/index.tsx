import Head from "next/head";
import { api } from "~/utils/api";

export default function Home() {
  const hello = api.example.hello.useQuery({ text: "buddy" });
  const protect = api.example.lockedProcedure.useQuery({ name: "something" });
  return (
    <>
      <Head>
        <title>Multiple Choice Test</title>
        <meta
          name="description"
          content="A test taking and creating platform"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <p className="">
        {hello.data ? hello.data.greeting : "Loading tRPC query..."}
      </p>
    </>
  );
}
