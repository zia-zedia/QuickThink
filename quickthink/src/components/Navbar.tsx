import Link from "next/link";
import { ReactNode, useState } from "react";
import { api } from "~/utils/api";

export function Navbar(props: { children?: ReactNode }) {
  const logout = api.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

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
        <button
          onClick={() => {
            logout.mutate();
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export function TeacherNavbar() {
  return (
    <Navbar>
      <Link href={"/teacher"}>
        <img
          src={"/book_icon.svg"}
          alt="Tests"
          className="w-full object-scale-down p-1"
        />
      </Link>
      <Link href={"/teacher/course"}>
        <img
          src={"/test_icon.svg"}
          alt="Courses"
          className="w-full object-scale-down"
        />
      </Link>
      <Link href={"/teacher/organization"}>
        <img
          src={"/organization_icon.svg"}
          alt="Tests"
          className="w-full object-scale-down p-1"
        />
      </Link>
    </Navbar>
  );
}

export function StudentNavBar() {
  return (
    <Navbar>
      <Link href={"/teacher"}>
        <img
          src={"/book_icon.svg"}
          alt="Dashboard"
          className="w-full object-scale-down p-1"
        />
      </Link>
    </Navbar>
  );
}
