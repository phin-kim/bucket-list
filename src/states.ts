// src/store/useAppStore.ts
import { create } from "zustand";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup,signInWithEmailAndPassword,createUserWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";




// 🗂 Interface for bucket form entries
export interface BucketFormData {
    title: string;
    description: string;
    date: string;
}

    // 🧠 Global App State Type
interface AppState {
    // Auth
    email: string;
    setEmail: (email: string) => void;

    password: string;
    setPassword: (password: string) => void;

    error: string;
    setError: (error: string) => void;
    handleGoogleLogIn: () => Promise<void>;
    handleEmailLogin: () => Promise<void>;
    handleRegister:(email:string,password:string)=>Promise<"success" |"fail">

    //user: null,
    //setUser: (user) => set({ user }),
    
    checkingSession: boolean;
    setCheckingSession: (value: boolean) => void;

    // Profile
    selectedImage: File | string | null;
    setSelectedImage: (img: File | string | null) => void;

    imgUrl: string | null;
    setImgUrl: (url: string | null) => void;

    nickName: string | null;
    setNickName: (name: string | null) => void;

    profileSelector: boolean;
    setProfileSelector: (visible: boolean) => void;

    // Bucket Forms
    bucketForms: BucketFormData[];
    updateBucketForm: (index: number, data: BucketFormData) => void;
    addBucketForm: () => void;
    deleteBucketForm:(index:number)=>void;

    
}


    // 🚀 Zustand Global Store
export const useAppStore = create<AppState>((set,get) => {
    const setTimedError=(message:string,delay=1000,duration=4000)=>{
        set({error:""});
        setTimeout(() => {
            set({error:message});
            setTimeout(() => {
                set({error:""})
            },duration );
        },delay );
    }
    return {
        // Auth
        email: "",
        setEmail: (email) => set({ email }),

        password: "",
        setPassword: (password) => set({ password }),

        error: "",
        setError: (error) => set({ error }),

        checkingSession: true,
        setCheckingSession: (value) => set({ checkingSession: value }),

        // Profile
        selectedImage: null,
        setSelectedImage: (img) => set({ selectedImage: img }),

        imgUrl: null,
        setImgUrl: (url) => set({ imgUrl: url }),

        nickName: null,
        setNickName: (name) => set({ nickName: name }),

        profileSelector: false,
        setProfileSelector: (visible) => set({ profileSelector: visible }),

        // Bucket Form Handling
        bucketForms: [],
        updateBucketForm: (index, data) =>
            set((state) => {
            const updated = [...state.bucketForms];
            updated[index] = data;
            return { bucketForms: updated };
        }),
        addBucketForm: () =>
            set((state) => ({
            bucketForms: [
                ...state.bucketForms,
                { title: "", description: "", date: "" },
            ],
        })),
        deleteBucketForm:(index)=>set((state)=>({
            bucketForms:state.bucketForms.filter((_,i)=>i !==index)
        })),
        handleGoogleLogIn: async () => {
            set({ error: "" }); // clear errors before attempting
            const popup = window.open("", "_blank");
            if (!popup) {
            alert("Popup blocked! Please allow popups for this site.");
            }
            try {
            await signInWithPopup(auth, googleProvider);
            //navigate("/dashboard")
            } catch (err) {
                const error = err as FirebaseError;
                let message = "Something went wrong.Try again";
                if (error.code) {
                    switch (error.code) {
                    case "auth/popup-closed-by-user":
                        message = "The popup was closed before completing the sign-in.";
                        break;
                    case "auth/network-request-failed":
                        message = "Network error. Check your internet connection.";
                        break;
                    case "auth/cancelled-popup-request":
                        message = "Popup request was cancelled.";
                        break;
                    case "auth/popup-blocked":
                        message = "Popup was blocked by the browser.";
                        break;
                    case "auth/user-disabled":
                        message = "This user has been disabled.";
                        break;
                    default:
                        message = `Error: ${error.message}`;
                    }
                }
            setTimedError(message);
            }
        },
        handleEmailLogin: async () => {
        const {email,password,} =get()
        set ({ error: "" });
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            const error = err as FirebaseError;
            let message = "An error occurred while signing in.";
            if (error.code) {
            switch (error.code) {
                case "auth/user-not-found":
                message = "No user found with this email.";
                break;
                case "auth/wrong-password":
                message = "Incorrect password.";
                break;
                case "auth/invalid-email":
                message = "Invalid email address.";
                break;
                default:
                message = error.message;
            }
            }
            setTimedError(message);
            console.log("Email:", email);
            console.log("Password:", password);
            }
        },
        handleRegister:async(email:string,password:string,)=>{
            set({error:""})
            const trimmedEmail = email.trim();
            const trimmedPassword = password.trim()
            if(!trimmedEmail ||!trimmedPassword){
                set({error:"Email and Password cannot be empty"});
                return "fail";
            }
            const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(trimmedEmail);
            if(!isEmailValid){
                set({error:"Kindly enter valid email address"})
                return "fail"
            }
            if(trimmedPassword.length<6){
                set({error:"must be more than 6 characters long"})
                return "fail"
            }
            console.log("Email:", `"${email}"`);
            console.log("Password:", `"${password}"`);

            try{
            const userCredential = await createUserWithEmailAndPassword(auth,email,password)
                console.log(userCredential.user)
                return "success"
            }
            catch(err){
                const error =err as FirebaseError
                let message= "Something went wrong;Please try again"
                if(error.code){
                    switch(error.code){
                        case"auth/email-already-in-use":
                        message ="This email is already in use.Try logging in";
                        break;
                        case"auth/invalid-email":
                        message="Please enter a valid email address";
                        break;
                        case"auth/operation-not-allowed":
                        message ="Account has been disabled";
                        break;
                        case"auth/weak-password":
                        message="Password must be at least 6 characters long";
                        break;
                        case"auth/internal-error":
                        message="Server is experiencing a problem";
                        break;
                        case"auth/missing-email":
                        message="Kindly fill in the email";
                        break;
                        case"auth/missing-password":
                        message="Kindly fill in the password";
                        break;
                        case"auth/too-many-requests":
                        message="You have tried too many times";
                        break;
                        case"auth/network-request-failed":
                        message="Network error. Check your internet connection."
                    }
                }
                setTimedError(message);
                return "fail"
            }
        },
    }
});
