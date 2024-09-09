import { Disclosure } from '@headlessui/react';
import { Link } from '@remix-run/react';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Players DB', href: '/players' },
  { name: 'Event Sourcing', href: '/eventsourcing' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function TopMenu({ selectedMenu }: { selectedMenu: string }) {
  return (
    <Disclosure as='nav' className='bg-gray-800'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          <div className='flex items-center'>
            <div className='hidden md:block'>
              <div className='ml-10 flex items-baseline space-x-4'>
                {navigation.map(item => {
                  const isSelected = item.name === selectedMenu;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        isSelected
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'rounded-md px-3 py-2 text-sm font-medium',
                      )}
                      aria-current={isSelected ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Disclosure.Panel className='md:hidden'>
        <div className='space-y-1 px-2 pb-3 pt-2 sm:px-3'>
          {navigation.map(item => {
            const isSelected = item.name === selectedMenu;
            return (
              <Disclosure.Button
                key={item.name}
                as='a'
                href={item.href}
                className={classNames(
                  isSelected
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'block rounded-md px-3 py-2 text-base font-medium',
                )}
                aria-current={isSelected ? 'page' : undefined}
              >
                {item.name}
              </Disclosure.Button>
            );
          })}
        </div>
      </Disclosure.Panel>
    </Disclosure>
  );
}
