import { User, AuthConfig } from './types';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  UserCredential
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from './firebase';

/**
 * Authentication Service
 * This is a placeholder that integrates with your existing OAuth system
 */

const AUTH_CONFIG: AuthConfig = {
  // Add your OAuth provider configuration here
  // Example: OAuth2 endpoints, client IDs, etc.
  loginEndpoint: '/api/auth/login',
  logoutEndpoint: '/api/auth/logout',
  signupEndpoint: '/api/auth/signup',
  googleOAuthEndpoint: '/api/auth/google',
  tokenKey: 'auth_token',
  userKey: 'user',
};

export class AuthService {
  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const user = localStorage.getItem(AUTH_CONFIG.userKey);
    const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
    return !!(user && token);
  }

  /**
   * Get current user from storage
   */
  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem(AUTH_CONFIG.userKey);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  }

  /**
   * Login with email and password
   */
  static async login(email: string, password: string): Promise<User> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const user: User = {
        email: firebaseUser.email || email,
        id: firebaseUser.uid,
        authenticated: true,
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
      };
      
      localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(user));
      localStorage.setItem(AUTH_CONFIG.tokenKey, await firebaseUser.getIdToken());
      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  }

  /**
   * Signup with email and password
   */
  static async signup(email: string, password: string): Promise<User> {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const user: User = {
        email: firebaseUser.email || email,
        id: firebaseUser.uid,
        authenticated: true,
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
      };
      
      localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(user));
      localStorage.setItem(AUTH_CONFIG.tokenKey, await firebaseUser.getIdToken());
      return user;
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  }

  /**
   * OAuth Google Sign-In
   */
  static async googleSignIn(): Promise<User> {
    try {
      const userCredential: UserCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCredential.user;
      
      const user: User = {
        email: firebaseUser.email || '',
        id: firebaseUser.uid,
        authenticated: true,
        provider: 'google',
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
      };
      
      localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(user));
      localStorage.setItem(AUTH_CONFIG.tokenKey, await firebaseUser.getIdToken());
      return user;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  }

  /**
   * OAuth GitHub Sign-In
   */
  static async githubSignIn(): Promise<User> {
    try {
      const userCredential: UserCredential = await signInWithPopup(auth, githubProvider);
      const firebaseUser = userCredential.user;
      
      const user: User = {
        email: firebaseUser.email || '',
        id: firebaseUser.uid,
        authenticated: true,
        provider: 'github',
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
      };
      
      localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(user));
      localStorage.setItem(AUTH_CONFIG.tokenKey, await firebaseUser.getIdToken());
      return user;
    } catch (error: any) {
      console.error('GitHub sign-in error:', error);
      throw new Error(error.message || 'Failed to sign in with GitHub');
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
      localStorage.removeItem(AUTH_CONFIG.userKey);
      localStorage.removeItem(AUTH_CONFIG.tokenKey);
    } catch (error: any) {
      console.error('Logout error:', error);
      // Clear local storage even if Firebase signOut fails
      localStorage.removeItem(AUTH_CONFIG.userKey);
      localStorage.removeItem(AUTH_CONFIG.tokenKey);
      throw new Error(error.message || 'Failed to logout');
    }
  }

  /**
   * Get authorization header for API calls
   */
  static getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export default AuthService;
