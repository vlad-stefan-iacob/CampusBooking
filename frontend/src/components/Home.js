import React from 'react';

function Home({ userEmail }) {
    return (
        <div>
            <h2>Welcome to the Home Page</h2>
            <p>Hello, {userEmail}!</p>
            {/* Add other content or components for the home page */}
        </div>
    );
}

export default Home;
