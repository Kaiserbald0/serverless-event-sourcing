export default function SecondaryButton({
  onClick,
  text,
  isDisabled,
}: {
  onClick?: () => void;
  text: string;
  isDisabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      type='button'
      className='inline-flex w-full justify-center rounded-md bg-zinc-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-500 focus-visible:outline-indigo-600 sm:ml-3 sm:w-auto'
    >
      {text}
    </button>
  );
}
