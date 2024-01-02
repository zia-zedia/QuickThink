import { ReactNode, useState } from "react";

export function Navbar(props: { children?: ReactNode }) {
  return (
    <div className="sticky h-full w-[10%] max-w-[70px] bg-[#1A2643] p-3 text-white">
      <div className="flex justify-between">
        <img
          src={"/white_logo.png"}
          alt="QuickThink Logo"
          className="w-full object-scale-down p-1"
        />
      </div>
      <div className="flex flex-col gap-3">
        {props.children ? props.children : null}
      </div>
      <div>Logout</div>
    </div>
  );
}
