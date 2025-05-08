import React, { useState } from 'react';
import { supabase } from './supabaseClient';

function CreateTeamForm() {
  const [teamName, setTeamName] = useState('');
  const [message, setMessage] = useState('');

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      setMessage('You must be logged in to create a team.');
      return;
    }

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([{ name: teamName, creator_id: user.data.user.id }])
      .select()
      .single();

    if (teamError) {
      setMessage(`Error creating team: ${teamError.message}`);
    } else {
      await supabase
        .from('team_members')
        .insert([{ team_id: team.id, user_id: user.data.user.id, role: 'admin' }]);
      setMessage(`Team "${teamName}" created successfully!`);
    }
  };

  return (
    <form onSubmit={handleCreateTeam}>
      <input
        type="text"
        placeholder="Team Name"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        required
      />
      <button type="submit">Create Team</button>
      {message && <p>{message}</p>}
    </form>
  );
}

export default CreateTeamForm;
