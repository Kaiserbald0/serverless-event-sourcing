import { Dialog, Transition } from '@headlessui/react';
import { LoaderFunctionArgs, type MetaFunction, defer } from '@remix-run/node';
import {
  Await,
  ClientActionFunctionArgs,
  useFetcher,
  useLoaderData,
} from '@remix-run/react';
import { Fragment, Suspense } from 'react';
import {
  PlayerEventType,
  PlayerResource,
  PlayerRole,
} from '../../../packages/core/players/playersSchema';
import EaseInContainer from '../components/form/EaseInContainer';
import FormContainer from '../components/form/FormContainer';
import { FieldType } from '../components/form/FormFields';
import SuspenseForm from '../components/form/SuspenseForm';
import { useEaseIn } from '../components/form/useEaseIn';
import { awaitWebsocketAPI } from '../components/websocket/awaitWebsocketAPI';

export const meta: MetaFunction = () => {
  return [
    { title: 'Players DB/Edit' },
    { name: 'description', content: 'Event sourcing frontend' },
  ];
};

const getPlayer = async (playerId: string | undefined) => {
  const result = await fetch(`${process.env.API_URL}/players`);
  const jsonResult: { players: PlayerResource[] } = await result.json();
  return jsonResult.players.find(player => player._id === playerId);
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const loadingPromise = getPlayer(params.id);
  return defer({ player: loadingPromise });
};

export const clientAction = async ({
  request,
  params,
}: ClientActionFunctionArgs) => {
  let result: { result?: string; errors: string[] } = { errors: [] };
  if (request.method === 'PATCH') {
    const formData = await request.formData();
    const name = formData.get('playerName');
    const role = formData.get('playerRole');
    const id = params.id;
    if (!name) {
      result.errors.push("name can't be empty");
    }
    if (!role) {
      result.errors.push("role can't be empty");
    }
    result = await awaitWebsocketAPI(
      [PlayerEventType.PlayerNameUpdated, PlayerEventType.PlayerRoleUpdated],
      [
        {
          payload: { name, id },
          action: PlayerEventType.PlayerNameUpdated,
        },
        {
          payload: { role, id },
          action: PlayerEventType.PlayerRoleUpdated,
        },
      ],
    );
  } else {
    result.errors.push('Method not supported');
  }
  return result;
};

export default function Player() {
  const fetcherUpdate = useFetcher<typeof clientAction>();
  const { player } = useLoaderData<typeof loader>();
  const { open, closePanel } = useEaseIn('/players');

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as='div' className='relative z-10' onClose={closePanel}>
        <fetcherUpdate.Form method='PATCH'>
          <EaseInContainer>
            <Suspense
              fallback={
                <SuspenseForm title='Edit player' onClosePanel={closePanel} />
              }
            >
              <Await resolve={player}>
                {p => {
                  const fields = [
                    {
                      type: FieldType.Text,
                      fieldOptions: {
                        name: 'playerName',
                        title: 'Name',
                        defaultValue: p.name,
                      },
                    },
                    {
                      type: FieldType.Select,
                      fieldOptions: {
                        selectedOption: p.role,
                        name: 'playerRole',
                        title: 'Role',
                        options: Object.entries(PlayerRole).map(role => {
                          return {
                            key: role[0],
                            value: role[1],
                          };
                        }),
                      },
                    },
                  ];
                  return (
                    <FormContainer
                      title={`Edit player: ${p.name}`}
                      onClosePanel={closePanel}
                      fields={fields}
                      isSubmitting={fetcherUpdate.state !== 'idle'}
                      errors={fetcherUpdate.data?.errors}
                      cancelText='Close'
                    />
                  );
                }}
              </Await>
            </Suspense>
          </EaseInContainer>
        </fetcherUpdate.Form>
      </Dialog>
    </Transition.Root>
  );
}
