import { ReactNode } from 'react';

export default function Table({
  headers,
  children,
}: {
  headers: string[];
  children?: ReactNode;
}) {
  return (
    <>
      <div className='w-full rounded-md border border-slate-300 bg-white p-4'>
        <table className='w-full table-auto border-collapse bg-white'>
          <thead>
            <tr className='border-b-2 leading-10'>
              {headers.map((header, I) => {
                return <th key={`h-${I}`}>{header}</th>;
              })}
            </tr>
          </thead>
          {children}
        </table>
      </div>
    </>
  );
}
