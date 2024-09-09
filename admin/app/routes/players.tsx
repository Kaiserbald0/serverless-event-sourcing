import { type MetaFunction, defer } from '@remix-run/node';
import {
  Await,
  ClientActionFunctionArgs,
  Outlet,
  useFetcher,
  useLoaderData,
} from '@remix-run/react';
import { format } from 'date-fns';
import { Suspense } from 'react';
import {
  PlayerEventType,
  PlayerResource,
} from '../../../packages/core/players/playersSchema';
import PrimaryLinkButton from '../components/buttons/PrimaryLinkButton';
import WarningButton from '../components/buttons/WarningButton';
import Layout from '../components/layout/Layout';
import SuspenseTable from '../components/table/SuspenseTable';
import Table from '../components/table/Table';
import { awaitWebsocketAPI } from '../components/websocket/awaitWebsocketAPI';

export const meta: MetaFunction = () => {
  return [
    { title: 'Players DB' },
    { name: 'description', content: 'Event sourcing frontend' },
  ];
};

const getPlayers = async (): Promise<PlayerResource[]> => {
  const result = await fetch(`${process.env.API_URL}/players`);
  return (await result.json()).players as PlayerResource[];
};

export const loader = async () => {
  const eventsPromise = getPlayers();
  return defer({ players: eventsPromise });
};

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  let result: { result?: string; errors: string[] } = { errors: [] };
  if (request.method === 'DELETE') {
    const formData = await request.formData();
    const playerId = formData.get('playerId');
    if (!playerId) {
      result.errors.push("playerId can't be empty");
    }
    if (result.errors.length === 0) {
      result = await awaitWebsocketAPI(
        [PlayerEventType.PlayerDeleted],
        [
          {
            payload: {
              _id: playerId,
            },
            action: PlayerEventType.PlayerDeleted,
          },
        ],
      );
    }
  } else {
    result.errors.push('Method not supported');
  }
  return result;
};

export default function Index() {
  const fetcher = useFetcher<typeof clientAction>();
  const { players } = useLoaderData<typeof loader>();
  const isSubmitting = fetcher.state !== 'idle';
  const suspenceTableHeaders = [
    'Name',
    'Role',
    'Last Updated',
    'Created',
    'Total players: ...',
  ];
  return (
    <Layout selectedMenu='Players DB' title='Players DB'>
      <div className='mb-4 w-full pb-2 text-right'>
        <PrimaryLinkButton linkTo={`/players/add`} text='Add player' />
      </div>
      <Suspense fallback={<SuspenseTable headers={suspenceTableHeaders} />}>
        <Await resolve={players}>
          {players => {
            const tableHeaders = [
              'Name',
              'Role',
              'Last Updated',
              'Created',
              `Total players: ${players.length}`,
            ];
            return (
              <Table headers={tableHeaders}>
                <tbody>
                  {players.map((player, i: number) => {
                    return (
                      <tr
                        key={`tr_${i}`}
                        className='border-b leading-10 transition duration-300 ease-in-out hover:bg-neutral-100 dark:border-neutral-200 dark:hover:bg-neutral-400'
                      >
                        <td className='text-center'>{player.name}</td>
                        <td className='text-center'>{player.role}</td>
                        <td className='text-center'>
                          {format(new Date(player.created), 'dd/MM/yyyy HH:mm')}
                        </td>
                        <td className='text-center'>
                          {format(new Date(player.updated), 'dd/MM/yyyy HH:mm')}
                        </td>
                        <td className='text-center'>
                          <div className='flex-auto'>
                            <PrimaryLinkButton
                              linkTo={`/players/${player._id}`}
                              text='Edit'
                            />
                            <fetcher.Form
                              method='DELETE'
                              className='inline-block'
                            >
                              <input
                                type='hidden'
                                name='playerId'
                                value={player._id}
                              />
                              <WarningButton
                                isDisabled={isSubmitting}
                                text='Delete'
                              />
                            </fetcher.Form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            );
          }}
        </Await>
      </Suspense>
      <Outlet />
    </Layout>
  );
}
