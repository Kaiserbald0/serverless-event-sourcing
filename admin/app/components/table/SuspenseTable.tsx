export default function SuspenseTable({ headers }: { headers: string[] }) {
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
          <tbody>
            <tr className='border-b leading-10 transition duration-300 ease-in-out hover:bg-neutral-100 dark:border-neutral-200 dark:hover:bg-neutral-400'>
              <td className='p-2 text-center' colSpan={headers.length}>
                Loading ...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
