import { ActionFunctionArgs, json, redirect, type MetaFunction } from "@remix-run/node";
import { Form, Link, Outlet, useActionData, useFetcher, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import TopMenu from "~/components/topMenu";

export interface IPlayer {
  _id: string,
  created: number,
  updated: number,
  playerId: string,
  playerName: string,
  playerRole: string,  
}

export const meta: MetaFunction = () => {
  return [
    { title: "Event sourcing example" },
    { name: "description", content: "Event sourcing frontend" },
  ];
};

export default function Players() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <TopMenu />
      <hr />
    </div>
  );
}
