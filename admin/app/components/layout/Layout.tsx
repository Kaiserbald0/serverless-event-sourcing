import { ReactNode } from 'react';
import TopMenu from '../TopMenu';

export default function Layout({
  selectedMenu,
  title,
  titleElement,
  children,
}: {
  selectedMenu: string;
  title: string;
  titleElement?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <>
      <div className='min-h-full'>
        <TopMenu selectedMenu={selectedMenu} />
        <header className='bg-white shadow'>
          <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
            <h1 className='text-3xl font-bold tracking-tight text-gray-900'>
              {title}
            </h1>
          </div>
          {titleElement && (
            <div className='mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8'>
              {titleElement}
            </div>
          )}
        </header>
        <main>
          {' '}
          <div className='mx-auto max-w-7xl py-6 sm:px-6 lg:px-8'>
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
