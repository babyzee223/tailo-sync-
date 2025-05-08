import React from 'react';
import SignupForm from './SignupForm';
import CreateTeamForm from './CreateTeamForm';

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <h2>Sign Up</h2>
      <SignupForm />
      <h2>Create a Team</h2>
      <CreateTeamForm />
    </div>
  );
}

export default SettingsPage;
