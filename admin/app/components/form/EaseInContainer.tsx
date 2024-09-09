import { Dialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';

interface EaseInFormProps {
  children: ReactNode;
}

export default function EaseInContainer({ children }: EaseInFormProps) {
  return (
    <>
      <Transition.Child
        as={Fragment}
        enter='ease-in-out duration-500'
        enterFrom='opacity-0'
        enterTo='opacity-100'
        leave='ease-in-out duration-500'
        leaveFrom='opacity-100'
        leaveTo='opacity-0'
      >
        <div className='fixed inset-0 bg-gray-500/75 transition-opacity' />
      </Transition.Child>
      <div className='fixed inset-0 overflow-hidden'>
        <div className='absolute inset-0 overflow-hidden'>
          <div className='pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10'>
            <Transition.Child
              as={Fragment}
              enter='transform transition ease-in-out duration-500 sm:duration-700'
              enterFrom='translate-x-full'
              enterTo='translate-x-0'
              leave='transform transition ease-in-out duration-500 sm:duration-700'
              leaveFrom='translate-x-0'
              leaveTo='translate-x-full'
            >
              <Dialog.Panel className='pointer-events-auto relative w-screen max-w-2xl'>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </div>
    </>
  );
}
