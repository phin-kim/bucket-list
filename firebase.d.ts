import { Firestore } from "firebase/firestore";
import { Auth } from "firebase/auth";
import { FirebaseApp } from "firebase/app";
import { FirebaseStorage } from "firebase/storage";

declare module "../firebase" {
  const db: Firestore;
  const auth: Auth;
  const storage: FirebaseStorage;
  const app: FirebaseApp;
  export { db, auth, storage, app };
}