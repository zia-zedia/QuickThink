import Link from "next/link";
import { ReactNode, useState } from "react";

export function Navbar(props: { children?: ReactNode }) {
  return (
    <div className="sticky h-full w-[10%] max-w-[70px] bg-[#1A2643] p-3 text-white">
      <div className="flex h-full flex-col justify-between">
        <div className="flex flex-col gap-3">
          <Link href={"/"}>
            <img
              src={"/white_logo.png"}
              alt="QuickThink Logo"
              className="w-full object-scale-down p-1"
            />
          </Link>
          <div className="flex flex-col gap-3">
            {props.children ? props.children : null}
          </div>
        </div>
        <div>Logout</div>
      </div>
    </div>
  );
}

export function TeacherNavbar() {
  return (
    <Navbar>
      <Link href={"/teacher"}>
        <div className="h-7 w-7">
          <img
            src={"/book_icon.svg"}
            alt="Tests"
            className="fill-[#1A2643] object-contain"
          />
        </div>
      </Link>
      <Link href={"/teacher/course"}>
        <div className="h-7 w-7">
          <img
            src={"/book_icon.svg"}
            alt="Courses"
            className="fill-[#1A2643] object-contain"
          />
        </div>
      </Link>
      <Link href={"/teacher/organization"}>
        <div className="h-7 w-7">
          <img
            src={"/organization_icon.svg"}
            alt="Tests"
            className="fill-[#1A2643] object-contain"
          />
        </div>
      </Link>
    </Navbar>
  );
}

export function StudentNavBar() {
  return (
    <Navbar>
      <Link href={"/teacher"}>
        <div className="h-7 w-7">
          <img
            src={"/book_icon.svg"}
            alt="Dashboard"
            className="fill-[#1A2643] object-contain"
          />
        </div>
      </Link>
    </Navbar>
  );
}
