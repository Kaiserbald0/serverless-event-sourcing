import { Dialog, Transition } from '@headlessui/react';
import { type MetaFunction } from '@remix-run/node';
import { ClientActionFunctionArgs, useFetcher } from '@remix-run/react';
import { Fragment } from 'react';
import {
  PlayerEventType,
  PlayerRole,
} from '../../../packages/core/players/playersSchema';
import EaseInContainer from '../components/form/EaseInContainer';
import FormContainer from '../components/form/FormContainer';
import { FieldType } from '../components/form/FormFields';
import { useEaseIn } from '../components/form/useEaseIn';
import { awaitWebsocketAPI } from '../components/websocket/awaitWebsocketAPI';

export const meta: MetaFunction = () => {
  return [
    { title: 'Players DB/Add' },
    { name: 'description', content: 'Event sourcing frontend' },
  ];
};

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  let result: { result?: string; errors: string[] } = { errors: [] };

  if (request.method === 'POST') {
    const formData = await request.formData();
    const name = formData.get('playerName');
    const role = formData.get('playerRole');
    if (!name) {
      result.errors.push("name can't be empty");
    }
    if (!role) {
      result.errors.push("role can't be empty");
    }
    result = await awaitWebsocketAPI(
      [PlayerEventType.PlayerCreated],
      [
        {
          payload: { name, role },
          action: PlayerEventType.PlayerCreated,
        },
      ],
    );
    if (result.errors.length === 0) {
      window.location.href = '/players';
    }
  } else {
    result.errors.push('Method not supported');
  }
  return result;
};

export default function Index() {
  const fetcher = useFetcher<typeof clientAction>();
  const { open, closePanel } = useEaseIn('/players');
  const fields = [
    {
      type: FieldType.Text,
      fieldOptions: {
        name: 'playerName',
        title: 'Name',
      },
    },
    {
      type: FieldType.Select,
      fieldOptions: {
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
    <Transition.Root show={open} as={Fragment}>
      <Dialog as='div' className='relative z-10' onClose={closePanel}>
        <fetcher.Form method='POST'>
          <EaseInContainer>
            <FormContainer
              title={`Add player`}
              onClosePanel={closePanel}
              fields={fields}
              isSubmitting={fetcher.state !== 'idle'}
              errors={fetcher.data?.errors}
            />
          </EaseInContainer>
        </fetcher.Form>
      </Dialog>
    </Transition.Root>
  );
}
