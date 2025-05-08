import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export interface User {
  id: string;
  email: string;
  profile_picture_url?: string; // added property
  // other properties
}

const UserProfile = () => {
  const { user } = useAuth() as { user: User | null }; // explicitly type user as User or null
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setUploading(true);
    const filePath = `user-${user.id}/${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('teams')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('teams').getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_picture_url: data.publicUrl })
      .eq('id', user.id);

    if (updateError) {
      alert('Failed to save image URL');
    } else {
      alert('Profile picture updated!');
    }
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Upload Profile Picture</h2>

      <input type="file" onChange={handleUpload} accept="image/*" disabled={uploading} />
{user?.profile_picture_url && (
  <img
    src={user.profile_picture_url}
    alt="Profile"
    className="w-24 h-24 rounded-full object-cover border"
  />
)}

        /{'>'}
      ){'}'}
    </div>
  );
};

export default UserProfile;
