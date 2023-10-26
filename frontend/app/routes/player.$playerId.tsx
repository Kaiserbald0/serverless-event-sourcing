import { ActionFunctionArgs, LoaderFunctionArgs, redirect, type MetaFunction } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import TopMenu from "~/components/TopMenu";
import ShowErrors from "~/components/ShowErrors";
import waitForWebSocketMessage from "~/components/websocket.server";
import { SourceEventType } from '../../../types/events'
import { PlayerResource } from '../../../types/players'

export const meta: MetaFunction = () => {
  return [
    { title: "Event sourcing example" },
    { name: "description", content: "Event sourcing frontend" },
  ];
};

export const loader = async({ params }:LoaderFunctionArgs):Promise<PlayerResource | undefined> => {
  const result = await fetch(`${process.env.API_URL}/players`);
  const jsonResult: {players: PlayerResource[]} = await result.json();
  return jsonResult.players.find(player => player.playerId === params.playerId)
}

export const action = async({request, params}: ActionFunctionArgs) => {
  const errors: string[] =[]
  if (request.method === "DELETE") {
    const playerId = String(params.playerId);
    if (!playerId) {
      errors.push("PlayerId can't be empty");
    }
    if (errors.length > 0) {
      return { errors };
    }
    const response = await fetch(`${process.env.API_URL}/players/${playerId}`, {
      method: 'DELETE',
    });
    const result = (await response.json())
    if (result.result === "success") {
      try {
        await waitForWebSocketMessage(SourceEventType.PlayerDeleted);
        return redirect('/players');
      } catch (error) {
        console.error('WebSocket error or timeout:', error);
        return {
          errors: ['Unable to connect to WebSocket or timeout'],
        };
      }
    }
    return {
      errors: ['Something went wrong with APIs']
    }

  }
  else if (request.method === "PATCH") {
    const formData = await request.formData();
    const name = String(formData.get("name"));
    const role = String(formData.get("role"));
    const playerId = String(params.playerId);
  
    if (!name) {
      errors.push("Name can't be empty");
    }
  
    if (!role) {
      errors.push("Role can't be empty");
    }
  
    if (!playerId) {
      errors.push("PlayerId can't be empty");
    }
    if (errors.length > 0) {
      return { errors };
    }
    const response = await fetch(`${process.env.API_URL}/players/${playerId}`, {
      method: 'PATCH',
      body: JSON.stringify(
        { 
          name, 
          role 
        })
    });
    const result = (await response.json())
    if (result.result === "success") {
      try {
        await waitForWebSocketMessage(SourceEventType.PlayerUpdated);
        return null
      } catch (error) {
        console.error('WebSocket error or timeout:', error);
        return {
          errors: ['Unable to connect to WebSocket or timeout'],
        };
      }
    } else {
      return {
        errors: ['Something went wrong while sending the command'],
      };
    }
  }
  else {
    return {
      errors: ['Method not supported']
    }      
  }
}

export default function Player() {
  const fetcherUpdate = useFetcher<typeof action>();
  const player = useLoaderData<typeof loader>();
  const isUpdating = fetcherUpdate.state !== "idle";
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <TopMenu />
      <hr />
      <fetcherUpdate.Form method="PATCH">
        <input type="string" name="name" defaultValue={player.playerName} /> <br />
        <input type="string" name="role" defaultValue={player.playerRole} /> <br />
        C: {format(new Date(player.created), 'dd/MM/yyyy')} <br />
        U: {format(new Date(player.updated), 'dd/MM/yyyy')} <br />
        <button type="submit" disabled={isUpdating}>{isUpdating ? 'Please wait ...' : 'UPDATE'}</button>
      </fetcherUpdate.Form>
      <fetcherUpdate.Form method="DELETE">
        <button type="submit" disabled={isUpdating}>{isUpdating ? 'Please wait ...' : 'DELETE'}</button>
      </fetcherUpdate.Form>
      <ShowErrors errors={fetcherUpdate.data?.errors} />
      <Link to={'/players'}>Back to list</Link>
    </div>
  );
}
