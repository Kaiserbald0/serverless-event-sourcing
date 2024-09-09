export default function WarningButton({
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
      className='ml-6 inline-block justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto'
    >
      {isDisabled ? 'Please wait...' : text}
    </button>
  );
}
