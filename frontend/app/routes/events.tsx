import { type MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import TopMenu from "~/components/TopMenu";
import { SourceEventResource } from '../../../types/events'

export const meta: MetaFunction = () => {
  return [
    { title: "Event sourcing example" },
    { name: "description", content: "Event sourcing frontend" },
  ];
};

export const loader = async():Promise<{ events: SourceEventResource[]; }> => {
  const result = await fetch(`${process.env.API_URL}/events`);
  return await result.json();
}

export default function Index() {
  const fetcher = useFetcher();
  const { events } = useLoaderData<typeof loader>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <TopMenu />
      <hr />
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
          <td></td>
        </tr>
        })}
        </tbody>
      </table>
    </div>
  );
}
