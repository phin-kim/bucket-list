import React, { useState,useRef } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
function Bucket (){
    const [selectedImage,setSelectedImage] =useState<File | string | null>(null);
    const [profileSelector, setProfileSelector] = useState<boolean>(true);
    // Handler for ProfilePicselector
    const handleSelect = (fileOrUrl: File | string) => {
        setSelectedImage(fileOrUrl)
        console.log("Selected:", fileOrUrl);
    };

    
    return(
        <>
            {profileSelector &&(
                <ProfilePicselector setProfileSelector={setProfileSelector} onSelect={handleSelect} selectedImage={selectedImage} />
            )}
            
        </>
    )
}
export default Bucket;
const defaultAvatars =[
    "/cooldude.png",
    "/coolrobot.png",
    "/crazygal.png",
    "/doodlesmile.png",
    "/hatguy.png",
    "/mexicanguy.png",
    "spongerobt.png",
    "/vamp.png",
    "/badgal.png",
    "/chillguy.png",
    "/chummy.png",
    "/cutebot.png",
    "/lovergal.png",
    "/onya.png",
    "/rockguy.png",
    "/wonder.png",
    "/bigsmile.png",
]

type Props ={
    onSelect: (fileOrUrl: File | string) => void;
    selectedImage: File | string | null;
    setProfileSelector:(show: boolean) => void;
}

const ProfilePicselector = ({onSelect,selectedImage, setProfileSelector}: Props)=>{
    const [preview,setPreview] = useState<string>(defaultAvatars[0]);
    /*const [preview, setPreview] = useState<string>(
        typeof selectedImage === "string" && selectedImage ? selectedImage : defaultAvatars[0]
    );*/
    const [showGrid, setShowGrid] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const handleAvatarClick =(url: string)=>{
        setPreview(url);
        onSelect(url);
        setShowGrid(false);
    }

    
    const handleFileChange =(e:React.ChangeEvent<HTMLInputElement>)=>{
        const file = e.target.files?.[0];
        if(!file) return;

        const isImage =file.type.startsWith("image/");
        const under2MB = file.size < 2* 1024* 1024;

        if (!isImage || !under2MB) {
            alert("Please pick an image file under 2MB, thanks!");
            // Reset input so the same file can be picked again if user wants
            if(fileInputRef.current?.value){
                fileInputRef.current.value = "";
            }
            
      return;
    }
    setPreview(URL.createObjectURL(file));
    onSelect(file)
    setShowGrid(false);

    }

    return(
        <div
            className="profilePicContainer"
        >
            {/*Preview*/}
            <img
                src={preview}
                alt="Profile Preview"
                
                className="imagePreview"
            />
            {/*Default choices*/}
            {showGrid ? (
                <div 
                className="defaultAvatarsContainer"
                >
                    {defaultAvatars.map((src)=>(
                        <button
                        className="defaultAvatarButton"
                            key={src}
                            onClick={()=> handleAvatarClick(src)}
                        >
                            <img
                                src={src}
                                
                                className="defaultAvatar"
                                alt="Default Avatar"
                            />
                        </button>
                    ))}
                </div>
            ):(
                <Form  selectedImage={selectedImage} setProfileSelector={setProfileSelector}/>

            )}
            
            {/*Upload */}
            <div className="toggleButtons">
                <button
                    className="avatarButton"
                    onClick={()=>{
                        setShowGrid(prev =>!prev)
                    }}
                >{showGrid ? "Fill Form":"Choose Avatar"}</button>
                <label
                className="choseFile"
                >
                    Upload Pic
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </label>
            </div>
            
        </div>
    )
}
type FormProp={
    //formShow:boolean;
    selectedImage: File | string | null;
    setProfileSelector: (show: boolean) => void;
}
//NB it can also be written as cont Form=({formShow}: FormProp)=>{}
const Form: React.FC<FormProp> = ({selectedImage,setProfileSelector})=>{
    const [form,setForm] = useState<{nickname:string,email:string}>({
        nickname: "",
        email: ""
    });
    const [loading, setLoading] = useState<boolean>(false);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };
    const handleDetailSave =async(e: React.FormEvent)=>{
        e.preventDefault();
        setLoading(true);
        try{
            const auth = getAuth();
            const user = auth.currentUser;
            const uid =user ? user.uid :Math.random().toString(36).slice(2);
            let imgUrl ="";
            if(selectedImage instanceof File){
                const storage = getStorage();
                const storageRef = ref(storage, `profilePics/${uid}/${selectedImage.name}`);
                await uploadBytes(storageRef, selectedImage);
                imgUrl = await getDownloadURL(storageRef);
            } else if(typeof selectedImage === "string"){
                imgUrl = selectedImage;
            }
            await addDoc(collection(db, "users"), {
                uid,
                nickname: form.nickname,
                email: form.email,
                avatar: imgUrl,
                createdAt: new Date(),
            });
            alert("Details saved successfully!");
        } catch(err){
            alert("Error saving: " + (err as Error).message);
        } finally {
            setLoading(false);
            setProfileSelector(false)
        }
    }
    return(
        <>
            
                <form onSubmit={handleDetailSave} >
                <label>
                    Nickname:
                    <input 
                        type="text" 
                        name="nickname"
                        value={form.nickname}
                        onChange={handleChange}
                        required    
                    />
                </label>
                <label>
                    Email:
                    <input 
                        type="email" 
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required 
                    />
                </label>
                <button type="submit" disabled={loading} >
                    {loading ? "Saving..." : "Save Details"}
                </button>
                </form>
            
        </>
        
    )
}
