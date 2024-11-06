import React from 'react';

function Notifications({ message }) {
    return (
        <div style={{ position: 'absolute', top: 0, right: 0, background: 'yellow', padding: '10px' }}>
            {message}
        </div>
    );
}

export default Notifications; 