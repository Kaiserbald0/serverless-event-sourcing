export default function ShowErrors({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) {
    return null;
  }
  return (
    <div>
      {errors.map((e: string, i: number) => (
        <em className='text-red-400' key={`em-${i}`}>
          {e}
        </em>
      ))}
    </div>
  );
}
