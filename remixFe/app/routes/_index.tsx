import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { format } from "date-fns";

interface Players {
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

export async function loader():Promise<{ players: Players[]; }> {
  const result = await fetch(`${process.env.API_URL}/players`);
  return await result.json();
}

export default function Index() {
  const { players } = useLoaderData<typeof loader>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Event sourcing experiment :D</h1>
      <table>
        <thead>
          <th>ID</th>
          <th>Name</th>
          <th>Role</th>
          <th>Last updated</th>
          <th>Created</th>
          <th> </th>
        </thead>
        {players.map((player,i) => {
          return <tr key={`tr_${i}`}>
          <td>{player.playerId}</td>
          <td>{player.playerName}</td>
          <td>{player.playerRole}</td>
          <td>{format(new Date(player.created), 'MM/dd/yyyy')}</td>
          <td>{format(new Date(player.updated), 'MM/dd/yyyy')}</td>
          <td> <button>Edit</button> <button>Delete</button> </td>
        </tr>
        })}
      </table>
    </div>
  );
}
