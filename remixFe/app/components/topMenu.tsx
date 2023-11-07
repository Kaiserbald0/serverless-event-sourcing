import { Link } from "@remix-run/react";

export default function TopMenu() {
  return (
    <div>
      <h1>Event sourcing experiment :D</h1>
      <Link to={`/players`}>Players</Link> | <Link to={`/events`}>Events</Link>
    </div>
  );
}
