import { Link } from '@remix-run/react';

export default function PrimaryLinkButton({
  linkTo,
  text,
}: {
  linkTo: string;
  text: string;
}) {
  return (
    <Link
      className='rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
      to={linkTo}
    >
      {text}
    </Link>
  );
}
