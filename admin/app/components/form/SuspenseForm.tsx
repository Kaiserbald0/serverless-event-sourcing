import { XMarkIcon } from '@heroicons/react/24/outline';
import PrimarySubmitButton from '../buttons/PrimarySubmitButton';
import SecondaryButton from '../buttons/SecondaryButton';

export default function SuspenseForm({
  title,
  onClosePanel,
}: {
  title: string;
  onClosePanel: () => void;
}) {
  return (
    <div className='flex h-full flex-col overflow-y-scroll bg-white shadow-xl'>
      <div className='flex h-10 items-center justify-between bg-gray-100 p-6 text-base font-semibold leading-6 text-gray-900'>
        {title}
        <button
          onClick={onClosePanel}
          type='button'
          className='relative rounded-md text-gray-700 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white'
        >
          <span className='absolute -inset-2.5' />
          <span className='sr-only'>Close panel</span>
          <XMarkIcon className='size-6' aria-hidden='true' />
        </button>
      </div>
      <div className='relative mt-6 flex-1 px-4 sm:px-6'>Loading</div>
      <div className='w-full bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6'>
        <PrimarySubmitButton isDisabled={true} text={`Save`} />
        <SecondaryButton
          isDisabled={false}
          text='Cancel'
          onClick={onClosePanel}
        />
      </div>
    </div>
  );
}
