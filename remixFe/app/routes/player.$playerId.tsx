import { ActionFunctionArgs, LoaderFunctionArgs, redirect, type MetaFunction } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import { IPlayer } from "./players";
import TopMenu from "~/components/TopMenu";
import ShowErrors from "~/components/ShowErrors";
import wsConnection from "~/components/websocket.server";

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

export const action = async({request, params}: ActionFunctionArgs) => {
  const errors: string[] =[]
  const socket = wsConnection
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
      return redirect('/players');
    }
    return {
      errors: ['Something went wrong with APIs']
    }

  }
  if (request.method === "POST") {
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
      // You can listen for WebSocket messages here without overriding the onmessage handler
      const waitForWebSocketMessage = new Promise((resolve, reject) => {
        const onMessageHandler = (e: any) => {
          const message = e.data;
          console.log('message', message);
          if (message === 'Player Updated') {
            resolve(message);
          }
        };
        // Attach the temporary onmessage handler
        socket.addEventListener('message', onMessageHandler);
        // Clean up the event listener after the message is received or on timeout
        const timeoutMs = 5000; // 5 seconds timeout, adjust as needed
        setTimeout(() => {
          socket.removeEventListener('message', onMessageHandler);
          reject('WebSocket timeout');
        }, timeoutMs);
      });
      try {
        const message = await waitForWebSocketMessage;
        // Continue with any additional processing based on the WebSocket message
        console.log('Received WebSocket message:', message);
        // ... your additional processing ...
        return null
      } catch (error) {
        // Handle the case where the WebSocket message is not received within the timeout
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
  return {
    errors: ['Method not supported']
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
      <fetcherUpdate.Form method="POST">
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
