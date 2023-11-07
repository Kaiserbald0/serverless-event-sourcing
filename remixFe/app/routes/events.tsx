import { ActionFunctionArgs, json, redirect, type MetaFunction } from "@remix-run/node";
import { Form, Link, useActionData, useFetcher, useLoaderData } from "@remix-run/react";
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

export const loader = async():Promise<{ players: IPlayer[]; }> => {
  const result = await fetch(`${process.env.API_URL}/players`);
  return await result.json();
}

export default function Index() {
  const fetcher = useFetcher();
  const { players } = useLoaderData<typeof loader>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <TopMenu />
      <hr />
      <table>
        <thead>
          <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Last updated</th>
          <th>Created</th>
          <th> </th>
          </tr>
        </thead>
        <tbody>
        {players.map((player,i) => {
          return <tr key={`tr_${i}`}>
          <td>{player.playerName}</td>
          <td>{player.playerRole}</td>
          <td>{format(new Date(player.created), 'MM/dd/yyyy')}</td>
          <td>{format(new Date(player.updated), 'MM/dd/yyyy')}</td>
          <td><Link to={`player/${player.playerId}`}>Edit</Link> </td>
        </tr>
        })}
        </tbody>
      </table>
    </div>
  );
}
