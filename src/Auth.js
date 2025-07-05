import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";

// Register user and set displayName
export const register = async (email, password, name) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: name });
  return userCredential.user;
};

// Login user
export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Logout user
export const logout = () => signOut(auth);
