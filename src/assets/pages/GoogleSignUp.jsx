import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../../firebase";

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google User:", result.user);
  } catch (error) {
    console.error(error);
    console.error("Error signing in with Google:", error.message);
  }
};

export default signInWithGoogle;
