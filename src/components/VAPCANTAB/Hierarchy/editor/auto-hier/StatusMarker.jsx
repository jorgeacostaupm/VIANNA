import { cloneElement, Children } from 'react';
import { CloseCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

const StatusMarker = ({ children, status }) => {
  const statusColor = status ? { color: '#16a34a' } : { color: '#dc2626' }; // green-600 or red-500
  const addColor = (child) => {
    if (typeof child === 'string' || typeof child === 'number') return child;
    return cloneElement(child, {
      style: { ...statusColor, ...child.props.style }
    });
  };
  const modifiedChildren = Children.map(children, addColor);

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {status ? (
        <CheckCircleOutlined
          style={{ color: '#22c55e', fontSize: '1.5rem' }} // text-green-500 and text-2xl
        />
      ) : (
        <CloseCircleOutlined
          style={{ color: '#dc2626', fontSize: '1.5rem' }} // text-red-500 and text-2xl
        />
      )}
      <span
        style={{
          fontSize: '1.125rem', // text-lg
          fontWeight: '600', // font-semibold
          ...statusColor
        }}
      >
        {modifiedChildren}
      </span>
    </div>
  );
};

export default StatusMarker;
