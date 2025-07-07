import { create } from "zustand";

export interface BucketFormData{
    title:string,
    description: string;
    date: string;
}
interface AppState{
    email:string,
    setEmail:(email:string)=>void;

    password:string,
    setPassword:(password:string)=>void;

    error: string;
    setError: (error: string) => void;

    checkingSession: boolean;
    setCheckingSession: (value: boolean) => void;

    // 🧑‍💼 Profile / Form
    selectedImage: File | string | null;
    setSelectedImage: (img: File | string | null) => void;

    imgUrl: string | null;
    setImgUrl: (url: string | null) => void;

    nickName: string | null;
    setNickName: (name: string | null) => void;

    profileSelectorVisible: boolean;
    setProfileSelector: (visible: boolean) => void;

    bucketForms: BucketFormData[];
    updateBucketForm: (index: number, data: BucketFormData) => void;
    addBucketForm: () => void;

}
/*export const useAppStore = create<AppState>((set) => ({
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

    export const useAppStore = create<AppState>((set) => ({
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
}));*/