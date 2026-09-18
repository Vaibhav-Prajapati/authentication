
const Spinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-5 w-5 border-2',
    lg: 'h-8 w-8 border-3',
  };

  return (
    <span
      className={`
        inline-block animate-spin rounded-full
        border-gray-300 border-t-blue-600
        ${sizes[size]}
      `}
      aria-label="Loading"
      role="status"
    />
  );
};

export default Spinner;

