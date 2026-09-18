
const Input = ({
  label,
  error,
  id,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full text-left">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-left text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        className={`
          block w-full rounded-lg border bg-white px-3.5 py-2.5
          text-left text-sm text-gray-900 outline-none transition
          placeholder:text-gray-400
          focus:ring-2
          ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
          }
          ${className}
        `}
        aria-invalid={Boolean(error)}
        {...props}
      />

      {error && (
        <p className="mt-1.5 text-left text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;

