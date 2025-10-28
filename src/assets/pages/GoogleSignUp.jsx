import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const App = () => {
  const login = useGoogleLogin({
    scope: `
      openid email profile
      https://www.googleapis.com/auth/user.addresses.read
      https://www.googleapis.com/auth/user.phonenumbers.read
      https://www.googleapis.com/auth/user.birthday.read
    `,
    onSuccess: async (tokenResponse) => {
      console.log("Access Token:", tokenResponse.access_token);

      try {
        // Fetch extended user info from Google People API
        const res = await axios.get(
          "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos,birthdays,addresses,phoneNumbers",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        console.log("User Info:", res.data);

        const userData = {
          name: res.data.names?.[0]?.displayName || "",
          email: res.data.emailAddresses?.[0]?.value || "",
          picture: res.data.photos?.[0]?.url || "",
          birthday: res.data.birthdays?.[0]?.date || {},
          address: res.data.addresses?.[0]?.formattedValue || "",
          phone: res.data.phoneNumbers?.[0]?.value || "",
        };

        console.log("Simplified User Data:", userData);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    },
    onError: (error) => console.log("Login Failed:", error),
  });

  return (
    <div>
      <h2>Login with Google</h2>
      <button onClick={() => login()}>Sign in with Google</button>
    </div>
  );
};

export default function WrappedApp() {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <App />
    </GoogleOAuthProvider>
  );
}
