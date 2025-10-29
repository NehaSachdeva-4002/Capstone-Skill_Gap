import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCu1D-r44yKXnoVZg4g1w_mp9KSTXZicH4",
  authDomain: "capstone-auth-21637.firebaseapp.com",
  projectId: "capstone-auth-21637",
  storageBucket: "capstone-auth-21637.firebasestorage.app",
  messagingSenderId: "886432673688",
  appId: "1:886432673688:web:261db9f5e75b532f6f85ed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize OAuth providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Configure providers (optional)
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

githubProvider.setCustomParameters({
  allow_signup: 'true'
});
