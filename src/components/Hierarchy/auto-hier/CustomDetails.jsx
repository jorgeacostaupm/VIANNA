import { useState } from 'react';

const CustomDetails = ({ children, title }) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginRight: '0.5rem',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderTop: 0,
        borderColor: '#D1D5DB', // Equivalent to border-gray-300
        borderRadius: '8px',
        paddingBottom: isOpen ? '16px' : '0px'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          justifyContent: 'flex-start',
          cursor: 'pointer',
          backgroundColor: '#F3F4F6', // Equivalent to bg-gray-100
          borderRadius: '6px',
          padding: '0.125rem',
          border: isOpen ? '1px solid #9CA3AF' : '1px solid #D1D5DB', // Equivalent to hover:border-gray-500 and border-gray-300
          transition: 'background-color 0.3s, border-color 0.3s' // Smooth transitions for hover and open states
        }}
        onClick={() => setOpen((prev) => !prev)}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#D1D5DB')} // hover:bg-gray-300 equivalent
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
      >
        <span
          style={{
            fontWeight: 'bold',
            color: 'black',
            userSelect: 'none'
          }}
        >
          {title}
        </span>
      </div>
      {isOpen && <div style={{ paddingLeft: '0.5rem', paddingTop: '0.5rem' }}>{children}</div>}
    </div>
  );
};

export default CustomDetails;
