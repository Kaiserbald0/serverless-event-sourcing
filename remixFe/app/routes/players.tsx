import { ActionFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import ShowErrors from "~/components/ShowErrors";
import TopMenu from "~/components/TopMenu";

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

export const action = async({
  request,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const name = String(formData.get("name"));
  const role = String(formData.get("role"));

  const errors: string[] =[]

  if (!name) {
    errors.push("Name can't be empty");
  }

  if (!role) {
    errors.push("Role can't be empty");
  }

  if (errors.length > 0) {
    return { errors };
  }

  const response = await fetch(`${process.env.API_URL}/players`, {
    method: 'POST',
    body: JSON.stringify(
      { 
        name, 
        role 
      })
  });
  const result = (await response.json())
  if (result.result === "success") {
    return null;
  }
  return {
    errors: ['Something went wrong with APIs']
  }
}

export default function Index() {
  const fetcher = useFetcher<typeof action>();
  const { players } = useLoaderData<typeof loader>();
  const isSubmitting = fetcher.state !== "idle";
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <TopMenu />
      <hr />
      <fetcher.Form method="POST">
        <input type="string" name="name" />
        <input type="string" name="role" />
        <button type="submit" disabled={isSubmitting}>Add</button>
        {isSubmitting ? 'Please wait' : ''}
      </fetcher.Form>
      <ShowErrors errors={fetcher.data?.errors} />
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
          <td>{format(new Date(player.created), 'dd/MM/yyyy')}</td>
          <td>{format(new Date(player.updated), 'dd/MM/yyyy')}</td>
          <td><Link to={`/player/${player.playerId}`}>Edit</Link> </td>
        </tr>
        })}
        </tbody>
      </table>
    </div>
  );
}
