import type { MetaFunction } from '@remix-run/node';
import Layout from '../components/layout/Layout';

export const meta: MetaFunction = () => {
  return [{ title: 'Event sourcing demo APP' }];
};

export default function Index() {
  return (
    <>
      <Layout selectedMenu='Home' title='Welcome the event sourcing demo!' />
    </>
  );
}
