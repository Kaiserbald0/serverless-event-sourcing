import { ActionFunctionArgs, LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import { IPlayer } from "./players";
import TopMenu from "~/components/topMenu";

export const meta: MetaFunction = () => {
  return [
    { title: "Event sourcing example" },
    { name: "description", content: "Event sourcing frontend" },
  ];
};

export const loader = async({ params }:LoaderFunctionArgs):Promise<IPlayer | undefined> => {
  const result = await fetch(`${process.env.API_URL}/players`);
  const jsonResult: {players: IPlayer[]} = await result.json();
  return jsonResult.players.find(player => player.playerId === params.playerId)
}

export const action = async({
  request,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  console.log('#action');
}

export default function Player() {
  const player = useLoaderData<typeof loader>();
  const actionData: any = useActionData<typeof action>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <TopMenu />
      <hr />
      <Form method="POST">
        <input type="string" name="name" value={player.playerName} /> <br />
        <input type="string" name="role" value={player.playerRole} /> <br />
        C: {format(new Date(player.created), 'dd/MM/yyyy')} <br />
        U: {format(new Date(player.updated), 'dd/MM/yyyy')} <br />
        <button type="submit">UPDATE</button>
      </Form>
      <Form method="DELETE">
        <button type="submit">DELETE</button>
      </Form>
      <div>
      {actionData?.errors.length > 0 ? actionData?.errors.map((e:any, i:number) => (
          <em key={`em-${i}`} >{e}</em>
        )
      ) : null}
      </div>
      <Link to={'/'}>Back to list</Link>
    </div>
  );
}
