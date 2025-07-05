import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";

// Register user and set displayName
export const register = async (email:string, password:string, name:string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: name });
  return userCredential.user;
};

// Login user
export const login = (email:string, password:string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Logout user
export const logout = () => signOut(auth);
