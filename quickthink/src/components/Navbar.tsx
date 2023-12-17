import { ReactNode, useState } from "react";

export function Navbar(props: { children: ReactNode }) {
  return (
    <div className="fixed left-0 top-0 h-screen w-[10%] max-w-[100px] bg-[#1A2643]">
      {props.children}
    </div>
  );
}
