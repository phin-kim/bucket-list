import React, { useState,useRef, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {AnimatePresence, motion} from 'framer-motion';
type ProfileProps ={
    onSelect: (fileOrUrl: File | string) => void;
    selectedImage: File | string | null;
    setProfileSelector:(show: boolean) => void;
    setImgUrl: (url: string) => void;
    setNickName: (name: string) => void; 

}

type FormProps={
    //formShow:boolean;
    selectedImage: File | string | null;
    setProfileSelector: (show: boolean) => void;
    setImgUrl: (url: string) => void;
    setNickName: (name: string) => void; 
}

type HeaderProps ={
    imgUrl: string | null;
    nickName: string | null;
}
interface BucketFormProps{
    index:number,
    onSave:(index:number,value:string)=> void
}
interface BucketFormData{
    title: string;
    description: string;
    date: string;
}
function Bucket (){
    const [selectedImage,setSelectedImage] =useState<File | string | null>(null);
    const [profileSelector, setProfileSelector] = useState<boolean>(true);
    const [imgUrl,setImgUrl] = useState<string | null>(null)
    const [nickName,setNickName] =useState<string|null>(null)

    // Handler for ProfilePicselector
    const handleSelect = (fileOrUrl: File | string) => {
        setSelectedImage(fileOrUrl)
        console.log("Selected:", fileOrUrl);
    };
    
    return(
        <>
            {profileSelector ?(
                <ProfilePicselector setProfileSelector={setProfileSelector} onSelect={handleSelect} selectedImage={selectedImage} setImgUrl={setImgUrl}
                setNickName={setNickName}
                />
            ):(<>
                    <Header imgUrl={imgUrl} nickName={nickName}/>
                    <BucketManager />
                </>
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


const ProfilePicselector = ({onSelect,selectedImage, setProfileSelector,setImgUrl,setNickName}: ProfileProps)=>{
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
                <Form  selectedImage={selectedImage} setProfileSelector={setProfileSelector} setImgUrl={setImgUrl} setNickName={setNickName}/>

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

//NB it can also be written as cont Form=({formShow}: FormProp)=>{}
const Form: React.FC<FormProps> = ({selectedImage,setProfileSelector,setImgUrl,setNickName})=>{
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

            /*if(selectedImage instanceof File){
                const storage = getStorage();
                const storageRef = ref(storage, `profilePics/${uid}/${selectedImage.name}`);
                await uploadBytes(storageRef, selectedImage);
                imgUrl = await getDownloadURL(storageRef);
            }*/
            if (selectedImage instanceof File) {
                const data = new FormData();
                data.append("file", selectedImage);
                data.append("upload_preset", "PhinKim"); // <-- your preset name
                data.append("folder", "profilePics");        // optional: Cloudinary folder

                const res = await fetch("https://api.cloudinary.com/v1_1/dig44nwql/image/upload", {
                    method: "POST",
                    body: data,
                });

                const result = await res.json();
                if (result.secure_url) {
                    imgUrl = result.secure_url; // this is what you'll store in Firestore
                    setImgUrl(imgUrl);
                } else {
                    throw new Error("Upload failed: " + JSON.stringify(result));
                }
            }
            else if(typeof selectedImage === "string"){
                imgUrl = selectedImage;
                setImgUrl(imgUrl);
            }
            
            await addDoc(collection(db, "users"), {
                uid,
                nickname: form.nickname,
                email: form.email,
                avatar: imgUrl,
                createdAt: new Date(),
            });
            setNickName(form.nickname);

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

const Header =({imgUrl,nickName}:HeaderProps)=>{
    const initial = nickName ? nickName.charAt(0).toUpperCase() : "?";
    const [index,setIndex] =useState<number>(0);
    const images =[
        {
            src:"/hero1.webp",
            alt:"Mountaini view",
        },
        {
            src:"/hero2.webp",
            alt:"City skyline",
        },
        {
            src:"/hero3.webp",
            alt:"Beach sunset",
        },
        {
            src:"/hero4.webp",
            alt:"Forest path",
        },
        {
            src:"/hero5.webp",
            alt:"Desert dunes",
        },
    ]
    useEffect(()=>{
        const END_ANIMATION = 5 * 60 * 1000;
        let timeout:ReturnType<typeof setTimeout>;
        if(!images.length) return;
        const interval = setInterval(() => {
            timeout =setTimeout(() => {
                setIndex(prev => (prev + 1) % images.length); 
                }, 5000);
            }, END_ANIMATION);
             // Change every 5 seconds

        return () => {clearInterval(interval); clearTimeout(timeout);}   
    },[images.length])
    const current  =images[index]
    
    return(
        <>
            <header>
                {imgUrl?(
                    <img className="profilePic" src={imgUrl} alt="" />
                ):(
                    <div className="avatarPlaceholder">
                        <h2>{initial}</h2>
                    </div>
                )}
            </header>
            <section className="heroSection">
                <h1>Welcome, {nickName ?nickName.charAt(0).toUpperCase() + nickName.slice(1) : "Guest"}!</h1>
                <AnimatePresence mode="wait">
                        <motion.img
                            key={current.src}
                            src={current.src}
                            alt={current.alt}
                            className="backImage"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                        />

                </AnimatePresence>
            </section>
        </>
    )
}
//add a date set later on 
const BucketForm=({index,onSave}:BucketFormProps)=>{
    //const [inputValue,setInputValue] =useState<string>("");
    const [formData,setFormData]=useState<BucketFormData>({
        title: "",
        description: "",
        date: "" // Date to be completed
    })

    const handleChange=(e:React.ChangeEvent<HTMLInputElement |HTMLTextAreaElement >)=>{
        const {name,value}=e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }
    const handleSave =()=>{
        onSave(index,formData)
    }
    return(
        <>
            <div style={{
                    border:"1px solid #e5e7eb",
                    marginBottom:"1em",
                    padding:"1em",
                    borderRadius:"0.5em",
                }}
            >
                <h2 style={{fontWeight:700,marginBottom:"0.5rem"}}>Bucket {index +1}</h2>
                <input 
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="title"
                    style={{
                        width:"100%",
                        padding:"0.5em",
                        borderRadius:"0.25em",
                        border:"1px solid #e5e7eb",
                        marginBottom:"0.5rem"
                    }}
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    style={{
                        border: '1px solid #e5e7eb', 
                        paddingLeft: '0.5rem',   
                        paddingRight: '0.5rem',
                        paddingTop: '0.25rem',       
                        paddingBottom: '0.25rem',
                        borderRadius: '0.25rem',     
                        width: '100%',               
                        marginBottom: '0.5rem',      
                        boxSizing: 'border-box'      
                    }}
                    rows={3}
                />
                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    style={{
                        border: '1px solid #e5e7eb', 
                        paddingLeft: '0.5rem',   
                        paddingRight: '0.5rem',
                        paddingTop: '0.25rem',       
                        paddingBottom: '0.25rem',
                        borderRadius: '0.25rem',     
                        width: '100%',               
                        marginBottom: '0.5rem',      
                        boxSizing: 'border-box'      
                    }}
                />

                <button
                    style={{
                        marginTop: '0.5rem',            // mt-2
                        backgroundColor: '#0d9488',     // bg-teal-600
                        color: '#ffffff',               // text-white
                        paddingLeft: '1rem',            // px-4
                        paddingRight: '1rem',
                        paddingTop: '0.25rem',          // py-1
                        paddingBottom: '0.25rem',
                        borderRadius: '0.25rem',        // rounded
                        border: 'none',                 // optional: remove default button border
                        cursor: 'pointer',              // recommended for buttons
                        transition: 'background-color 0.2s ease', // for hover effect
                    }}
                    onClick={handleSave}
                    //disabled={!inputValue.trim()}
                >
                    Save
                </button>
            </div>
        </>
    )
}
const BucketManager=()=>{
    const [buckets,setBuckets] = useState<number[]>([1]);
    const addBucket=()=>{
        setBuckets(prev => [...prev, prev.length + 1]);
        
    }
    const handleSave=(index:number,value:BucketFormData)=>{
        const isFomValid = value.title.trim() && value.description.trim() && value.date.trim();
        if (!isFomValid) {
            alert("Please fill in all fields.");
            return;
        }
        // Here you can save the value to your database or state management
        console.log(`Bucket ${index + 1} saved with value: ${value}`);
        // Optionally, you can clear the input or perform other actions
    }
    return(
        <div
            style={{
                padding: '1rem',           // p-4 = 16px
                maxWidth: '28rem',         // max-w-md = 448px (md = 28 * 16)
                marginLeft: 'auto',        // mx-auto = horizontal center
                marginRight: 'auto',
            }}
        >
            {buckets.map((_,index)=>(
                <BucketForm 
                    key={index} 
                    index={index} 
                    onSave={handleSave} 
                />
            ))}
            <button
                style={{
                    display: 'block',          // block
                    width: '100%',            // w-full
                    backgroundColor: '#0d9488', // bg-teal-600
                    color: '#ffffff',         // text-white
                    paddingLeft: '1rem',      // px-4
                    paddingRight: '1rem',
                    paddingTop: '0.5rem',     // py-2
                    paddingBottom: '0.5rem',
                    borderRadius: '0.25rem',  // rounded
                    border: 'none',           // optional: remove default button border
                    cursor: 'pointer',        // recommended for buttons
                    transition: 'background-color 0.2s ease', // for hover effect
                }}
                onClick={addBucket}
            >
                addBucket
            </button>

        </div>
    )
}