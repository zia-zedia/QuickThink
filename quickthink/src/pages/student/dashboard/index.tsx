import Head from "next/head";
import { ReactNode } from "react";

export function DashboardLayout(props: { children: ReactNode }) {
  return (
    <div className="h-screen">
      <div className="">{props.children}</div>
    </div>
  );
}
export default function StudentLayout() {
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
      <DashboardLayout>
        <StudentIndex>
          <StudentDashboard />
        </StudentIndex>
      </DashboardLayout>
    </>
  );
}

export function StudentIndex(props: { children: ReactNode }) {
  return <>{props.children}</>;
}

export function StudentDashboard() {
  return (
    <div>
      <ResultsSection />
    </div>
  );
}

export function ResultsSection() {
  return <>Results</>;
}
