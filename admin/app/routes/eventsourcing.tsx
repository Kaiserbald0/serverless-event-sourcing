import { LoaderFunctionArgs, type MetaFunction, defer } from '@remix-run/node';
import {
  Await,
  ClientActionFunctionArgs,
  useFetcher,
  useLoaderData,
} from '@remix-run/react';
import { format } from 'date-fns';
import { Suspense, useState } from 'react';
import {
  EventState,
  SourceEventResource,
  TimeTravelEventType,
  eventTypesArray,
} from '../../../packages/core/eventSourcing/eventSourcingEventsSchema';
import ShowErrors from '../components/ShowErrors';
import PrimarySubmitButton from '../components/buttons/PrimarySubmitButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import ModalDialog from '../components/dialogs/ModalDialog';
import DropDownSelect from '../components/form/DropDownSelect';
import Layout from '../components/layout/Layout';
import SuspenseTable from '../components/table/SuspenseTable';
import Table from '../components/table/Table';
import { awaitWebsocketAPI } from '../components/websocket/awaitWebsocketAPI';

export const meta: MetaFunction = () => {
  return [
    { title: 'Event sourcing' },
    { name: 'description', content: 'Event sourcing' },
  ];
};

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  let result: { result?: string; errors: string[] } = { errors: [] };
  if (request.method === 'POST') {
    const formData = await request.formData();
    const eventId = formData.get('eventId');
    if (!eventId) {
      result.errors.push("EventId can't be empty");
    }
    if (result.errors.length > 0) {
      return result;
    }
    result = await awaitWebsocketAPI(
      [TimeTravelEventType.RestoredFromPastEvent],
      [
        {
          payload: { eventId },
          action: TimeTravelEventType.RestoredFromPastEvent,
        },
      ],
    );
  }
  return result;
};

const getEvents = async ({
  eventTypes,
  eventState,
}: {
  eventTypes?: string[];
  eventState?: string[];
}): Promise<SourceEventResource[]> => {
  const result = await fetch(
    `${process.env.API_URL}/eventsourcing/events?eventType=${eventTypes}&eventState=${eventState}`,
  );
  return (await result.json()).events as SourceEventResource[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const eventTypes = url.searchParams.getAll('eventType');
  const eventState = url.searchParams.getAll('eventState');
  const eventsPromise = getEvents({ eventTypes, eventState });
  return defer({
    events: eventsPromise,
    selectedOptions: { eventTypes, eventState },
  });
};

const SearchForm = ({
  eventTypes,
  eventState,
}: {
  eventTypes?: string[];
  eventState?: string[];
}) => {
  return (
    <form method='GET' className='flex'>
      <DropDownSelect
        label='Event type'
        name='eventType'
        options={eventTypesArray}
        preSelectedOptions={eventTypes}
      />
      <DropDownSelect
        name='eventState'
        label='Event state'
        options={Object.values(EventState)}
        preSelectedOptions={eventState}
      />
      <PrimarySubmitButton isDisabled={false} text={`Search`} />
    </form>
  );
};

export default function Index() {
  const [eventPayload, setEventPayload] = useState<SourceEventResource | null>(
    null,
  );
  const restoreFetcher = useFetcher<typeof clientAction>();
  const isUpdating = restoreFetcher.state !== 'idle';
  const { events, selectedOptions } = useLoaderData<typeof loader>();

  const tableHeaders = ['Type', 'State', 'Date', ''];

  const handleOnClickPayload = (payload: SourceEventResource) => {
    setEventPayload(payload);
  };

  const handleOnClickClosePayload = () => {
    setEventPayload(null);
  };
  console.log(restoreFetcher.data);
  return (
    <>
      <Layout
        selectedMenu='Event Sourcing'
        title='Event list'
        titleElement={SearchForm(selectedOptions)}
      >
        {eventPayload && (
          <ModalDialog
            title={`${eventPayload.eventType} (${eventPayload.eventId})`}
            text={eventPayload.eventPayload}
            onClose={handleOnClickClosePayload}
          />
        )}
        <div>
          <ShowErrors errors={restoreFetcher.data?.errors} />
          <Suspense fallback={<SuspenseTable headers={tableHeaders} />}>
            <Await resolve={events}>
              {events => {
                return (
                  <Table headers={tableHeaders}>
                    <tbody>
                      {events.map((event, i: number) => {
                        return (
                          <tr
                            key={`tr_${i}`}
                            className='border-b transition duration-300 ease-in-out hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-600'
                          >
                            <td>{event.eventType}</td>
                            <td>{event.eventState}</td>
                            <td>
                              <div className='m-1.5'>
                                {format(
                                  new Date(event.eventDate),
                                  'dd/MM/yyyy HH:mm:ss',
                                )}
                              </div>
                            </td>
                            <td className='flex'>
                              <restoreFetcher.Form
                                method='POST'
                                className='m-1.5'
                              >
                                <SecondaryButton
                                  onClick={() => handleOnClickPayload(event)}
                                  text='Show payload'
                                  isDisabled={false}
                                />
                                <input
                                  type='hidden'
                                  name='eventId'
                                  value={event.eventId}
                                />
                                <PrimarySubmitButton
                                  isDisabled={isUpdating}
                                  text='Restore'
                                />
                              </restoreFetcher.Form>
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
        </div>
      </Layout>
    </>
  );
}
