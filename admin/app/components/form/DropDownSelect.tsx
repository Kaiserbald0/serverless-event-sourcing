import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function DropDownSelect({
  name,
  label,
  options,
  preSelectedOptions,
}: {
  label: string;
  name: string;
  options: string[];
  preSelectedOptions?: string[];
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [optionFilter, setOptionFilter] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    preSelectedOptions || [],
  );

  const handleOptionChange = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(o => o !== option));
      return;
    }
    setSelectedOptions([...selectedOptions, option]);
  };
  return (
    <div>
      <button
        id='dropdownSearchButton'
        data-dropdown-toggle='dropdownSearch'
        className='ml-2 inline-flex items-center rounded-lg bg-blue-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
        type='button'
        onClick={() => {
          setShowDropdown(true);
        }}
      >
        {label}{' '}
        <svg
          className='ms-2.5 size-2.5'
          aria-hidden='true'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 10 6'
        >
          <path
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='m1 1 4 4 4-4'
          />
        </svg>
      </button>
      <div
        id={name}
        className={`z-10 ${showDropdown ? '' : 'hidden'} absolute mt-4 w-80 rounded-lg bg-white shadow dark:bg-gray-700`}
      >
        <div className='flex space-x-4 p-3 align-middle'>
          <label htmlFor='input-group-search' className='sr-only'>
            Search
          </label>
          <div className='relative flex'>
            <div className='pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3	'>
              <svg
                className='size-4 cursor-pointer text-gray-500 dark:text-gray-400'
                aria-hidden='true'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 20 20'
              >
                <path
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z'
                />
              </svg>
            </div>
            <input
              type='text'
              id={`${name}search`}
              className='block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500'
              placeholder='Search event'
              onChange={e => setOptionFilter(e.target.value)}
            />
          </div>
          <XMarkIcon
            className='mt-2 size-4'
            aria-hidden='true'
            onClick={() => setShowDropdown(false)}
          />
        </div>
        <ul
          className='h-48 overflow-y-auto px-3 pb-3 text-sm text-gray-700 dark:text-gray-200'
          aria-labelledby='dropdownSearchButton'
        >
          {options
            .filter(e =>
              e.toLowerCase().includes(optionFilter.toLocaleLowerCase()),
            )
            .map((type, i) => {
              return (
                <li key={`type${i}`}>
                  <div className='flex items-center rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600'>
                    <input
                      checked={selectedOptions.includes(type)}
                      id={`${name}-item-${i}`}
                      type='checkbox'
                      value={type}
                      name={name}
                      className='size-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-700'
                      onChange={() => {
                        handleOptionChange(type);
                      }}
                    />
                    <label
                      htmlFor='checkbox-item-11'
                      className='ms-2 w-full rounded text-sm font-medium text-gray-900 dark:text-gray-300'
                    >
                      {type}
                    </label>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
}
