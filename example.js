import { supabase } from './supabaseClient';

async function fetchUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('Users:', data);
  }
}

async function addUserToTeam(teamId, userId, role = 'member') {
  const { error } = await supabase
    .from('team_members')
    .insert([{ team_id: teamId, user_id: userId, role }]);

  if (error) {
    console.error('Error adding user to team:', error);
  } else {
    console.log('User added to team successfully');
  }
}

async function fetchUserTeams() {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    console.error('User not logged in');
    return;
  }

  const { data: teams, error } = await supabase
    .from('team_members')
    .select('team_id, role, teams(name)')
    .eq('user_id', user.data.user.id);

  if (error) {
    console.error('Error fetching teams:', error);
  } else {
    console.log('User teams:', teams);
  }
}

async function createTeam(teamName) {
  const user = await supabase.auth.getUser(); // Get the logged-in user
  if (!user.data.user) {
    console.error('User not logged in');
    return;
  }

  // Insert a new team into the 'teams' table
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert([{ name: teamName, creator_id: user.data.user.id }]) // Set creator_id
    .select()
    .single();

  if (teamError) {
    console.error('Error creating team:', teamError);
    return;
  }

  // Add the creator to the 'team_members' table as an admin
  const { error: memberError } = await supabase
    .from('team_members')
    .insert([{ team_id: team.id, user_id: user.data.user.id, role: 'admin' }]);

  if (memberError) {
    console.error('Error adding user to team:', memberError);
  } else {
    console.log('Team created successfully:', team);
  }
}

// Example usage
createTeam('My New Team');

fetchUsers();
