import { ActionFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import TopMenu from "~/components/TopMenu";
import { SourceEventResource, TimeTravelEventType } from '../../../types/events'
import ShowErrors from "~/components/ShowErrors";
import waitForWebSocketMessage from "~/components/websocket.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Event sourcing example" },
    { name: "description", content: "Event sourcing frontend" },
  ];
};

export const action = async({request, params}: ActionFunctionArgs) => {
  const errors: string[] =[]
  if (request.method === "POST") {
    const formData = await request.formData();
    const eventId = String(formData.get("eventId"));
    if (!eventId) {
      errors.push("EventId can't be empty");
    }
    if (errors.length > 0) {
      return { errors };
    }
    const response = await fetch(`${process.env.API_URL}/events/timetravel`, {
      method: 'POST',
      body: JSON.stringify(
        { 
          eventId,
        })
    });
    const result = (await response.json())
    if (result.result === "success") {
      try {
        await waitForWebSocketMessage(TimeTravelEventType.TimeTravelled);
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
  } else {
    return {
      errors: ['Method not supported']
    }      
  }
};

export const loader = async():Promise<{ events: SourceEventResource[]; }> => {
  const result = await fetch(`${process.env.API_URL}/events`);
  return await result.json();
}

export default function Index() {
  const restoreFetcher = useFetcher<typeof action>();
  const isUpdating = restoreFetcher.state !== "idle";
  const { events } = useLoaderData<typeof loader>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <TopMenu />
      <hr />
      <ShowErrors errors={restoreFetcher.data?.errors} />
      <table>
        <thead>
          <tr>
          <th>Event Type</th>
          <th>Payload</th>
          <th>Date</th>
          <th></th>
          </tr>
        </thead>
        <tbody>
        {events.map((event,i) => {
          return <tr key={`tr_${i}`}>
          <td>{event.eventType}</td>
          <td>{event.eventPayload}</td>
          <td>{format(new Date(event.eventDate), 'MM/dd/yyyy hh:mm:ss')}</td>
          <td>
            <restoreFetcher.Form method="POST">
            <input type="hidden" name="eventId" value={event.eventId} />
              <button type="submit" disabled={isUpdating}>{isUpdating ? 'Please wait ...' : 'RESTORE'}</button>
            </restoreFetcher.Form></td>
        </tr>
        })}
        </tbody>
      </table>
    </div>
  );
}
