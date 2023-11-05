import React from 'react';
import '../styles/error.css';

const Error = () => {
    return (
        <div className="error-page">
            <h3>Oops! Something went wrong.</h3>
            <h4>Error Code: 404</h4>
            <h5>The page you're looking for has been deleted or doesn't exist.</h5>
        </div>
    )
}

export default Error