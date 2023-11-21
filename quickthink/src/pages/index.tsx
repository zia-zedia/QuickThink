import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { api } from "~/utils/api";

export default function Home() {
  return (
    <>
      <Head>
        <title>QuickThink</title>
        <meta name="description" content="" />
        <link rel="icon" href="/white_logo.png" />
      </Head>
      <Hero>
        <HeroText>
          <div className="self-center">
            <p className="font-light xl:text-lg">Welcome to QuickThink</p>
            <h1 className="bold pb-4 text-6xl xl:text-8xl">
              Inform, Assess, Excel.
            </h1>
            <div className="flex w-[50%] max-w-md flex-row flex-wrap gap-x-3">
              <button className="flex-grow rounded bg-[#6e8ccc] px-3 py-1 text-lg text-white">
                <Link href={"/auth/register"}>Join the Platform</Link>
              </button>
              <button className="flex-grow rounded px-3 py-1 text-lg text-[#7ea1ed] outline outline-1 outline-[#7ea1ed]">
                <Link href={"/test"}>Take a Test</Link>
              </button>
            </div>
          </div>
        </HeroText>
        <RightSection>
          <Logo />
          <div className="font-bold text-white">QuickThink</div>
        </RightSection>
      </Hero>
    </>
  );
}

export function Hero(props: { children: ReactNode }) {
  return <div className="flex h-screen flex-row">{props.children}</div>;
}
export function HeroText(props: { children: ReactNode }) {
  return (
    <div className="flex w-[65%] flex-col justify-center">{props.children}</div>
  );
}

export function Logo() {
  return (
    <div className="flex p-3">
      <img
        src={"/white_logo.png"}
        alt="QuickThink Logo"
        className="w-full max-w-sm object-scale-down p-3"
      />
    </div>
  );
}

export function RightSection(props: { children: ReactNode }) {
  return (
    <div className="flex max-w-[35%] flex-grow flex-col items-center justify-center bg-[#1A2643] text-3xl">
      {props.children}
    </div>
  );
}
