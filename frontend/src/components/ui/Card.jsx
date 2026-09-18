
const Card = ({ children, className = '' }) => {
  return (
    <div
      className={`
        w-full rounded-2xl border border-gray-200
        bg-white p-6 shadow-sm
        sm:p-8
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;

