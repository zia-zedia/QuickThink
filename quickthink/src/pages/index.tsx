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
          <img
            src={"/logo.png"}
            alt="QuickThink Logo"
            className="w-full max-w-sm object-scale-down p-3 md:hidden"
          />
          <p className="text-2xl font-bold md:font-light">
            Welcome to QuickThink
          </p>
          <h1 className="px-3 pb-4 text-center text-xl font-light md:text-6xl md:font-bold xl:text-8xl">
            Inform, Assess, Excel.
          </h1>
          <div className="flex w-[50%] max-w-md flex-row flex-wrap gap-3">
            <button className="flex-grow rounded bg-[#849EFA] px-3 py-1 text-lg text-white">
              <Link href={"/auth/register"}>Join the Platform</Link>
            </button>
            <button className="flex-grow rounded px-3 py-1 text-lg text-[#7ea1ed] outline outline-1 outline-[#7ea1ed]">
              <Link href={"/test"}>Take a Test</Link>
            </button>
          </div>
        </HeroText>
        <RightSection>
          <Logo />
          <div className="text-4xl font-bold text-white">QuickThink</div>
        </RightSection>
      </Hero>
      <section className="flex flex-col items-center bg-[#CADBFF] pt-10">
        <Section title="Why Us?">
          <CardContainer>
            <Card title="Flexible">
              I love my mom, Lorem ipsum dolor sit, amet consectetur adipisicing
              elit. Veniam, non dignissimos. Voluptatibus quisquam, cumque nulla
              iste natus sequi unde? Velit reiciendis sapiente accusamus ducimus
              incidunt voluptatum voluptate vero exercitationem! Atque.
            </Card>
            <Card title="Supportive">
              I love my mom, Lorem ipsum dolor sit, amet consectetur adipisicing
              elit. Veniam, non dignissimos. Voluptatibus quisquam, cumque nulla
              iste natus sequi unde? Velit reiciendis sapiente accusamus ducimus
              incidunt voluptatum voluptate vero exercitationem! Atque.
            </Card>
            <Card title="Collaborative">
              I love my mom, Lorem ipsum dolor sit, amet consectetur adipisicing
              elit. Veniam, non dignissimos. Voluptatibus quisquam, cumque nulla
              iste natus sequi unde? Velit reiciendis sapiente accusamus ducimus
              incidunt voluptatum voluptate vero exercitationem! Atque.
            </Card>
          </CardContainer>
        </Section>
        <Section title="Who are we?">
          <CardContainer>
            <Card title="Local team">
              We believe that every community is unique, with its own set of
              challenges and aspirations. Our Local Team is comprised of
              passionate educators, mentors, and facilitators who are deeply
              rooted in your community. By understanding the specific needs and
              opportunities present, we tailor our programs to empower
              individuals and organizations on a local level.
            </Card>
            <Card title="Collaborative">
              I love my mom, Lorem ipsum dolor sit, amet consectetur adipisicing
              elit. Veniam, non dignissimos. Voluptatibus quisquam, cumque nulla
              iste natus sequi unde? Velit reiciendis sapiente accusamus ducimus
            </Card>
          </CardContainer>
        </Section>
      </section>
      <Footer />
    </>
  );
}

export function CardContainer(props: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-row flex-wrap gap-2 md:flex-nowrap">
      {props.children}
    </div>
  );
}

export function Section(props: { title: string; children: ReactNode }) {
  return (
    <div className="w-[90%] max-w-7xl rounded-[20px] bg-white p-4">
      <h1 className="pb-4 text-3xl font-bold">{props.title}</h1>
      <div>{props.children}</div>
    </div>
  );
}

export function Card(props: { title: string; children: ReactNode }) {
  return (
    <div className="w-full rounded-lg p-3 outline outline-1 outline-[#CADBFF] transition-all hover:-translate-y-1 hover:shadow-md hover:shadow-[#CADBFF] hover:outline-[#849EFA] md:max-w-[50%]">
      <h1 className="pb-1 text-xl font-semibold">{props.title}</h1>
      <div>{props.children}</div>
    </div>
  );
}

export function AboutUs(props: { children: ReactNode }) {
  return (
    <div className="w-[70%] max-w-6xl">
      <p className="text-3xl font-bold">About us</p>
      {props.children}
    </div>
  );
}

export function Hero(props: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-row bg-white">{props.children}</div>
  );
}

export function HeroText(props: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-col items-center justify-center border p-3 md:w-[65%]">
      {props.children}
    </div>
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
    <div className="hidden max-w-[35%] flex-grow flex-col items-center justify-center bg-[#1A2643] text-3xl md:flex">
      {props.children}
    </div>
  );
}

export function Footer() {
  return (
    <div className="flex flex-col items-center gap-3 bg-[#4D5A89] p-6 text-white">
      <div className="flex max-w-3xl flex-col gap-4">
        <section className="flex flex-row flex-wrap justify-between gap-2 md:flex-nowrap">
          <h1 className="font-bold">Contact Us</h1>
          <p>Email: 202000144@student.polytechnic.bh</p>
          <p>Phone Number: +973 1777 3432</p>
          <p className="">
            <h1 className="font-bold">Learn More</h1>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Libero
            repellat, eius excepturi quisquam suscipit aut nobis corrupti sunt
            delectus ad quos illum esse doloribus id obcaecati voluptatum
            temporibus consequuntur corporis!
          </p>
        </section>
        <p className="text-center">
          Sayed Dhiya Algallaf, Copyright © 2023-2024, All rights are reserved.
        </p>
      </div>
    </div>
  );
}
