import Head from "next/head";
import { api } from "~/utils/api";

export default function Home() {
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
      <p className="">hi</p>
    </>
  );
}
