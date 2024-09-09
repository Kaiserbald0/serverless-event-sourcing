import { XMarkIcon } from '@heroicons/react/24/outline';
import PrimarySubmitButton from '../buttons/PrimarySubmitButton';
import SecondaryButton from '../buttons/SecondaryButton';
import FormFields, { FormField } from './FormFields';

export interface FormContainerData {
  fields: FormField[];
  errors?: string[];
  title: string;
  isSubmitting: boolean;
  onClosePanel: () => void;
  cancelText?: string;
}

export default function FormContainer({
  title,
  fields,
  onClosePanel,
  errors,
  isSubmitting,
  cancelText,
}: FormContainerData) {
  return (
    <div className='flex h-full flex-col overflow-y-scroll bg-white shadow-xl'>
      <div className='flex h-10 items-center justify-between bg-gray-100 p-6 text-base font-semibold leading-6 text-gray-900'>
        {title}
        <button
          type='button'
          className='relative rounded-md text-gray-700 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white'
          onClick={onClosePanel}
        >
          <span className='absolute -inset-2.5' />
          <span className='sr-only'>Close panel</span>
          <XMarkIcon className='size-6' aria-hidden='true' />
        </button>
      </div>
      <div className='relative mt-6 flex-1 px-4 sm:px-6'>
        <FormFields fields={fields} errors={errors} />
      </div>
      <div className='w-full bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6'>
        <PrimarySubmitButton isDisabled={isSubmitting} text={`Save`} />
        <SecondaryButton
          isDisabled={isSubmitting}
          onClick={onClosePanel}
          text={cancelText ? cancelText : `Cancel`}
        />
      </div>
    </div>
  );
}
