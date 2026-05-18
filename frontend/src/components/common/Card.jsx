import clsx from 'clsx';

const Card = ({ children, className = '', title, action }) => {
  return (
    <div className={clsx('bg-white rounded-lg shadow-md', className)}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;