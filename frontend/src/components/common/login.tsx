import { useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

//import { logUser } from '../../services/apiDB';

interface GoogleJwtPayload {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

export default function Login() {
  const [userProfile, setUserProfile] = useState<GoogleJwtPayload | null>(null);

  const handleSuccess = async (res: CredentialResponse) => {
    try {
      if (res.credential) {
        const decoded = jwtDecode<GoogleJwtPayload>(res.credential);
        setUserProfile(decoded);
        //await logUser(decoded.email)
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleError = () => {
    console.error("Google Auth Failed");
    setUserProfile(null);
  };

  const handleLogout = () => {
    setUserProfile(null);
  };

  if (userProfile) {
    return (
      <div className="flex flex-row items-center gap-3">
        <img 
          src={userProfile.picture} 
          className="h-10 w-10 rounded-full border-2 border-gray-200 object-cover shadow-sm"
        />
        
        <button 
          onClick={handleLogout} 
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
      />
  );
}