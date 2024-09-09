import { cssBundleHref } from '@remix-run/css-bundle';
import { LinksFunction, json } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import { useEffect } from 'react';
import { WebSocketService } from './components/websocket/websocket.client';
import stylesheet from './tailwind.css';

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
  { rel: 'stylesheet', href: stylesheet },
];

export const loader = async () => {
  return json({ wsUrl: process.env.WEBSOCKET_URL });
};

export default function App() {
  const { wsUrl } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (wsUrl) {
      WebSocketService.init(wsUrl);
    }
  });

  return (
    <html lang='en' className='h-full bg-gray-100'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body className='h-full'>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
