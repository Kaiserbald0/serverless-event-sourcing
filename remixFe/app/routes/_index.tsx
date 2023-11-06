import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

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
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader() {
  console.log(process.env.API_URL);
  return {"players":[{"_id":"6544ba28f32405b4db5b2dd6","created":1699002920028,"updated":1699002920028,"playerId":"8db2555d-ba53-4942-99be-18910f65ed0a","playerName":"player","playerRole":"carry"}]};
}

export default function Index() {
  const { players } = useLoaderData<typeof loader>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Event sourcing experiment :D</h1>
      <table>
        <thead>
          <td>ID</td>
          <td>Name</td>
          <td>Role</td>
          <td>Last updated</td>
          <td>Created</td>
          <td> - </td>
        </thead>
        {players.map(player => {
          return         <tr>
          <td>{player.playerId}</td>
          <td>{player.playerName}</td>
          <td>{player.playerRole}</td>
          <td>{player.updated}</td>
          <td>{player.created}</td>
          <td> - </td>
        </tr>
        })}
      </table>
    </div>
  );
}
