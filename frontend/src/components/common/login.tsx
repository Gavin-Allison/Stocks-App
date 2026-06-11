import { useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

import { handleLogin } from '../../services/getDB';
import Button from './ui/Button';
import { theme } from '../../styles/tokens';

interface GoogleJwtPayload {
    name: string;
    email: string;
    picture: string;
    sub: string;
}

/**
 * Google OAuth login component that stores the authenticated user profile.
 */
export default function Login() {
    const [userProfile, setUserProfile] = useState<GoogleJwtPayload | null>(null);

    const handleSuccess = async (res: CredentialResponse) => {
        try {
            if (res.credential) {
                const decoded = jwtDecode<GoogleJwtPayload>(res.credential);
                setUserProfile(decoded);
                await handleLogin(decoded.email)
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
        localStorage.removeItem('userEmail');
    };

    if (userProfile) {
        return (
            <div className="flex flex-row items-center gap-3">
                {/* Signed-in user */}
                <img 
                src={userProfile.picture} 
                className="h-8 w-8 rounded-full border-2 border-gray-200 object-cover shadow-sm"
                />
                
                {/* Sign-out button */}
                <Button
                onClick={handleLogout}
                variant="light"
                className={`px-2 py-1 text-sm font-medium ${theme.text.secondary} transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200`}
                >
                Sign out
                </Button>
            </div>
        );
    }

    return (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap
            shape="rectangular"
            text="signin"
            theme="filled_blue"
            size="medium"
        />
    );
}