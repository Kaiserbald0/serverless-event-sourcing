import ShowErrors from '../ShowErrors';

export enum FieldType {
  Text,
  Select,
  Radio,
  Date,
  Checkbox,
}

interface TextField {
  name: string;
  title: string;
  defaultValue?: string;
}

interface DateField {
  name: string;
  title: string;
  defaultValue?: string;
}

interface SelectField {
  name: string;
  title: string;
  selectedOption?: string;
  options: {
    text?: string;
    value: string;
  }[];
}

interface RadioField {
  name: string;
  title: string;
  options: {
    key: string;
    value: string;
    checked: boolean;
  }[];
}

interface CheckboxField {
  name: string;
  title: string;
  value: string;
  isChecked: boolean;
}

export interface FormField {
  type: FieldType;
  fieldOptions:
    | TextField
    | SelectField
    | RadioField
    | DateField
    | CheckboxField;
}

export interface FormData {
  fields: FormField[];
  errors?: string[];
  title?: string;
}

const TextField = ({ name, defaultValue, title }: TextField) => {
  return (
    <div className='col-span-full mb-3 flex w-full items-center justify-between'>
      <label
        htmlFor='playerName'
        className='block text-sm font-medium leading-6 text-gray-900'
      >
        {title}
      </label>
      <div className='flex w-full rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md'>
        <input
          type='text'
          name={name}
          id={name}
          defaultValue={defaultValue}
          className='block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6'
        />
      </div>
    </div>
  );
};

const DateField = ({ name, defaultValue, title }: TextField) => {
  return (
    <div className='col-span-full mb-3 flex w-full items-center justify-between'>
      <label
        htmlFor='playerName'
        className='block text-sm font-medium leading-6 text-gray-900'
      >
        {title}
      </label>
      <div className='flex w-full rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md'>
        <input
          type='date'
          name={name}
          id={name}
          defaultValue={defaultValue}
          className='block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6'
        />
      </div>
    </div>
  );
};

const SelectField = ({ name, options, selectedOption, title }: SelectField) => {
  return (
    <div className='col-span-full mb-3 flex w-full items-center justify-between'>
      <label
        htmlFor='type'
        className='mr-3 block text-sm font-medium leading-6 text-gray-900'
      >
        {title}
      </label>
      <select
        defaultValue={selectedOption}
        id={name}
        name={name}
        className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-md sm:text-sm sm:leading-6'
      >
        {options.map((option, i) => {
          return (
            <option key={`k${i}`} value={option.value}>
              {option.text || option.value}
            </option>
          );
        })}
      </select>
    </div>
  );
};

const RadioField = ({ name, title, options }: RadioField) => {
  return (
    <div className='col-span-full  mb-3'>
      <label
        htmlFor={name}
        className='block text-sm font-medium leading-6 text-gray-900'
      >
        {title}
      </label>
      <div className='mt-2'>
        {options.map((option, i) => {
          return (
            <div key={`check${i}`} className='relative flex gap-x-3'>
              <div className='flex h-6 items-center'>
                <input
                  id={`k-${option.key}`}
                  name={name}
                  type='checkbox'
                  defaultChecked={option.checked}
                  value={option.value}
                  className='size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600'
                />
              </div>
              <div className='text-sm leading-6'>
                <label className='font-medium text-gray-900'>
                  {option.value}
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CheckboxField = ({ name, title, value, isChecked }: CheckboxField) => {
  return (
    <div className='col-span-full mb-3 flex w-full items-center justify-between'>
      <label
        htmlFor={name}
        className='block text-sm font-medium leading-6 text-gray-900'
      >
        {title}
      </label>
      <input
        name={name}
        type='checkbox'
        defaultChecked={isChecked}
        value={value}
        className='size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600'
      />
    </div>
  );
};

export default function FormFields({ fields, errors, title }: FormData) {
  return (
    <div>
      <div className='bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4'>
        <div className='sm:flex sm:items-start'>
          <div className='w-full space-y-12'>
            <div className='pb-12'>
              {title && (
                <h2 className='text-base font-semibold leading-7 text-gray-900'>
                  {title}
                </h2>
              )}
              <ShowErrors errors={errors} />
              {fields.map((field, i) => {
                if (field.type === FieldType.Text) {
                  const { name, defaultValue, title } =
                    field.fieldOptions as TextField;
                  return (
                    <TextField
                      key={`k${i}`}
                      name={name}
                      defaultValue={defaultValue}
                      title={title}
                    />
                  );
                }
                if (field.type === FieldType.Date) {
                  const { name, defaultValue, title } =
                    field.fieldOptions as TextField;
                  return (
                    <DateField
                      key={`k${i}`}
                      name={name}
                      defaultValue={defaultValue}
                      title={title}
                    />
                  );
                }
                if (field.type === FieldType.Select) {
                  const { name, options, selectedOption, title } =
                    field.fieldOptions as SelectField;
                  return (
                    <SelectField
                      key={`k${i}`}
                      name={name}
                      options={options}
                      title={title}
                      selectedOption={selectedOption}
                    />
                  );
                }
                if (field.type === FieldType.Radio) {
                  const { name, options, title } =
                    field.fieldOptions as RadioField;
                  return (
                    <RadioField
                      key={`k${i}`}
                      name={name}
                      options={options}
                      title={title}
                    />
                  );
                }
                if (field.type === FieldType.Checkbox) {
                  const { name, title, isChecked, value } =
                    field.fieldOptions as CheckboxField;
                  return (
                    <CheckboxField
                      key={`k${i}`}
                      name={name}
                      isChecked={isChecked}
                      value={value}
                      title={title}
                    />
                  );
                }
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
