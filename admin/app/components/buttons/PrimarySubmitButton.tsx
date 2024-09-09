export default function PrimarySubmitButton({
  text,
  isDisabled,
}: {
  text: string;
  isDisabled: boolean;
}) {
  return (
    <button
      type='submit'
      disabled={isDisabled}
      className='inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto'
    >
      {isDisabled ? 'Please wait...' : text}
    </button>
  );
}
