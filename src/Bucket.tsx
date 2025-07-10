import React, { useState,useRef, useEffect, } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import  { useAppStore } from "./states";
import type { BucketFormData } from "./states";
import type { User } from "firebase/auth";
import { db } from "../firebase";
import { collection, addDoc, where,getDocs,query, Timestamp } from "firebase/firestore";
import {
    
    onAuthStateChanged,
    getAuth,
    //UserCredential
} from "firebase/auth";
import { auth } from "../firebase";
import { useAnimationControls,  type Variants } from "framer-motion";
import {AnimatePresence, motion, } from 'framer-motion';
//import { MdAddCircle } from "react-icons/md";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { IoMdLogIn,IoMdPersonAdd } from "react-icons/io";
import {  GiEmptyWoodBucketHandle } from "react-icons/gi";
//import { span } from "framer-motion/client";
type ProfileProps ={
    onSelect: (fileOrUrl: File | string) => void;
}
type BucketDetails={
    title:string,
    description:string,
    date:string,
    createdAt:Timestamp
}
interface BucketFormProps{
    index:number,
    onSave: (index: number, data: BucketFormData) => void;
    
}
interface HoverAnimateButtonsProps{
    onClick?:()=>void;
    icon:ReactNode;
    text:string,
    className?:string;
    variants:Variants;

}
function Bucket (){
    
    const {setSelectedImage,profileSelector} =useAppStore()
    // Handler for ProfilePicselector
    const handleSelect = (fileOrUrl: File | string) => {
        setSelectedImage(fileOrUrl)
        console.log("Selected:", fileOrUrl);
    };
    
    
    return(
        <>
            {profileSelector ?(
                <ProfilePicselector  onSelect={handleSelect} 
                />
            ):(
                <>
                    <Header />
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


const ProfilePicselector = ({onSelect}: ProfileProps)=>{
    const [preview,setPreview] = useState<string>(defaultAvatars[0]);
    const {handleGoogleLogIn,setProfileSelector,error} = useAppStore();
    const navigate =useNavigate()

    const handleGoogle = async () => {
        try {
            await handleGoogleLogIn(); // This opens the popup
            const user = auth.currentUser;
            if (user) {
            console.log("Logged in user:", user.displayName);
            navigate("/");
            setProfileSelector(false); // Navigate only after login success
            }
        } catch (err) {
            console.error("Google sign-in failed:", err);
        }
    };

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
                <Form />

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
                    Upload Your Pic
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </label>
                <button
                    className="googleSignIn" onClick={handleGoogle}>
                    Google Sign In
                </button>
                <span className="errorMessage">{error}</span>
                
            </div>
        </div>
    )
}

//NB it can also be written as cont Form=({formShow}: FormProp)=>{}
const Form: React.FC = ()=>{
    const {selectedImage,setProfileSelector, setImgUrl,setNickName,handleRegister}=useAppStore()
    const [form,setForm] = useState<{nickname:string,email:string,password:string}>({
        nickname: "",
        email: "",
        password:""
    });
    const [loading, setLoading] = useState<boolean>(false);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };
    

    const handleDetailSave =async()=>{
        setLoading(true);
        try{
            const auth = getAuth();
            const user = auth.currentUser;
            const uid =user ? user.uid :Math.random().toString(36).slice(2);
            let imgUrl ="";

            
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

            //alert("Details saved successfully!");
        } catch(err){
            setProfileSelector(true)
            alert("Error saving: " + (err as Error).message);
        } finally {
            setLoading(false);
            setProfileSelector(false)
        }
    }
    
    return(
        <>
            
                <form onSubmit={async(e)=>{
                    e.preventDefault();
                    const result =await handleRegister(form.email,form.password);
                    
                    if(result==="success"){
                        useAppStore.setState({
                            email: form.email,
                            password: form.password,
                        });
                        await useAppStore.getState().handleEmailLogin();
                        await handleDetailSave()
                    }
                }}
                >
                <label htmlFor="name">
                    Nickname:
                    <input 
                        type="text" 
                        name="nickname"
                        value={form.nickname}
                        onChange={handleChange}
                        required    
                    />
                </label>
                <label htmlFor="email">
                    Email:
                    <input 
                        type="email" 
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required 
                    />
                </label>
                <label htmlFor="password">
                    Password:
                    <input
                        type="password"
                        name="password"
                        onChange={handleChange}
                        value={form.password}
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

const Header =()=>{
    const {imgUrl,nickName} =useAppStore()
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
    useEffect(() => {
        const END_ANIMATION = 5 * 60 * 1000; // 5 minutes
        if (!images.length) return;

    // Define interval and stopper
        const interval: ReturnType<typeof setInterval> = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 5000); // every 5 seconds

        const stopper: ReturnType<typeof setTimeout> = setTimeout(() => {
            clearInterval(interval); // stop after 5 minutes
        }, END_ANIMATION);

        return () => {
            clearInterval(interval);
            clearTimeout(stopper);
        };
    }, [images.length]);

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
    const {bucketForms}=useAppStore();
    const [formData, setFormData] = useState<BucketFormData>(
    bucketForms[index] ?? { title: "", description: "", date: "" }
    );

    useEffect(() => {
        setFormData(bucketForms[index] ?? { title: "", description: "", date: "" });
    }, [bucketForms, index]);

    const handleChange=(e:React.ChangeEvent<HTMLInputElement |HTMLTextAreaElement >)=>{
        const {name,value}=e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    }
    const handleSave = async() => {
        const { title, description, date } = formData;
        const isValid = title.trim() && description.trim() && date.trim();

        if (!isValid) {
        alert("Please fill in all fields.");
        return;
        }

        //updateBucketForm(index, formData);
        onSave(index,formData)
        try{
            const user  =getAuth().currentUser;
            if(!user){
                alert("Please Log In or Sign In to save buckets")
                return;
            }
            await addDoc(collection(db,"buckets"),{
                uid:user.uid,
                ...formData,
                createdAt:new Date(),
            });
            console.log(`✅ Bucket ${index + 1} saved to Firestore`, formData);
        }
        catch(error){
            console.log("Failed to save bucket",error);
            alert("Error saving bucket data .Please try again")
        }
    };
    
    
    return(
        <>
            <form className="bucketForm"
            >
                <h1 style={{fontWeight:700,marginBottom:"0.5rem"}}>Bucket {index +1}</h1>
                <label htmlFor="title">Title</label>
                <input 
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter title of activity"
                    
                />
                <label htmlFor="description">Description</label>
                <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    
                    rows={3}
                />
                <label htmlFor="date">Date</label>
                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    placeholder="Select date to complete activity"
                    onChange={handleChange}
                    
                />

                <button
                    type="button"
                    onClick={()=>handleSave()}
                    //disabled={!inputValue.trim()}
                >
                    Save
                </button>
            </form>
        </>
    )
}
const BucketManager=()=>{
    const {
        bucketForms,
        addBucketForm,
        setProfileSelector,
        handleEmailLogin,
        updateBucketForm,
    }=useAppStore();
    //const [buckets,setBuckets] = useState<number[]>([1]);
    const [showButtons,setShowButtons] = useState<boolean>(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const [history,setHistory] =useState<BucketDetails[]>([])
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const handleSave=(index:number,value:BucketFormData)=>{
    
        const isFomValid = value.title.trim() && value.description.trim() && value.date.trim();
        if (!isFomValid) {
            alert("Please fill in all fields.");
            return;
        }
        updateBucketForm(index,value);
        // Here you can save the value to your database or state management
        console.log(`Bucket ${index + 1} saved with value: ${value}`);
        // Optionally, you can clear the input or perform other actions
    }
    const buttonContainerRef=useRef<HTMLDivElement | null>(null)
    const handleButtons =(e:React.MouseEvent)=>{
        e.stopPropagation()
        setShowButtons(prev =>!prev);
    }
    const loadBuckets = async()=>{
        const user =getAuth().currentUser;
        if(!user) return;
        const q = query(collection(db,"buckets"),where("uid","==",user.uid))
        const querySnapshot = await getDocs(q);

        const bucketData =querySnapshot.docs.map(doc=>doc.data() as BucketDetails)
        console.log("Fetched buckets",bucketData)
        setHistory(bucketData)
    }
    useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      setCurrentUser(user);
      setCheckingSession(false);
      console.log("🚀 Logged in as:", user?.email || "No user"); // done loading
    });

    return () => unsubscribe();
  }, []);
    useEffect(()=>{
        if(!showButtons) return;
        const handleDisplay=(event:MouseEvent)=>{
            if(buttonContainerRef.current && !buttonContainerRef.current.contains(event.target as Node)){
                setShowButtons(false)
            }
        }
        document.addEventListener("click",handleDisplay)
        return ()=>{
            document.removeEventListener("click",handleDisplay)
        }
    },[showButtons])
    useEffect(() => {
        if (bucketForms.length === 0) {
            addBucketForm();
        }
    }, [bucketForms.length, addBucketForm]);
    //FRAMER ANIMATIONS
    const variants:Variants ={
        initial:{
            opacity:0,
            scale:0,
            z:-20
        },
        animate:{
            opacity:1,
            scale:1,
            z:0,
            transition:{
                duration:0.4,
                ease:"easeIn",
                type:"spring",
                damping:10,
                stiffness:150
            }
        },
    }
    const lineVariants:Variants={
        initial:{rotate:0,y:0,opacity:1},
        topHover:{rotate:35,y:18},
        middleHover:{opacity:0},
        bottomHover:{rotate:-35,y:-10}
    }
    const [hovered,setHovered] =useState<boolean>(false)
    return(
        <div>
            {bucketForms.map((_,index)=>(
                <BucketForm 
                    key={index} 
                    index={index} 
                    onSave={handleSave} 
                />
            ))}
            <div ref={buttonContainerRef}>
                {showButtons ?(
                    <section className="bucketControlButtons">
                        <HoverAnimatedButton
                            icon={<AiOutlinePlusCircle size={50}  />}
                            text="Add a New Bucket Item"
                            className="addButton"
                            onClick={addBucketForm}
                            //controls={controls}
                            variants={variants}
                        />

                        <HoverAnimatedButton
                            icon={<GiEmptyWoodBucketHandle size={50}  />}
                            text="Load your Bucket History"
                            className="loadButton"
                            onClick={loadBuckets}
                            //controls={controls}
                            variants={variants}
                        />

                        <HoverAnimatedButton
                            icon={<IoMdLogIn size={50} />}
                            text="Login to Your Account"
                            className="logIn"
                            onClick={handleEmailLogin}
                            //controls={controls}
                            variants={variants}
                        />
                        <HoverAnimatedButton
                            icon={<IoMdPersonAdd size={50} />}
                            text="Create Your Account"
                            className="createAccount"
                            onClick={() => setProfileSelector(true)}
                            //controls={controls}
                            variants={variants}
                        />
                    </section>
                ):(
                    <motion.div
                        onHoverStart={()=>setHovered(true)}
                        onHoverEnd={()=>setHovered(false)}
                        onClick={handleButtons}
                        className="showButtons"
                    >
                        <motion.span
                            variants={lineVariants}
                            initial="initial"
                            animate={hovered? "topHover":"initial"}
                        />
                        <motion.span
                            variants={lineVariants}
                            initial="initial"
                            animate={hovered?"middleHover":"initial"}
                        />
                        <motion.span
                            initial="initial"
                            variants={lineVariants}
                            animate={hovered? "bottomHover":"initial"}
                            
                        />
                        {/*<IoMdMenu size={80} className="showButtons" onClick={handleButtons}/>*/}
                    </motion.div>
                    
                )}
                {checkingSession ?(
                    <p>Checking Credentials...</p>
                ):(
                    !currentUser &&(
                        <Form/>
                    )
                )}
            </div>
            <section className="bucketHistory">
                {[...history]
                    .sort((a,b)=>b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime())
                    .map((item,index)=>(
                    <div key={index} className="history">
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        <p>{item.date}</p>
                    </div>
                ))}
            </section>
        </div>
    )
}
const HoverAnimatedButton=({
    onClick,icon,text,className,variants
}:HoverAnimateButtonsProps)=>{
    const controls = useAnimationControls();
    return(
        <>
            <motion.button
                className={className}
                onClick={onClick}
                onHoverStart={() => controls.start("animate")}
                onHoverEnd={() => controls.start("initial")}
                onTapStart={()=>controls.start("animate")}
                onTap={()=>controls.start("initial")}
            >
                {icon}
            </motion.button>
            <motion.span
                variants={variants}
                initial="initial"
                animate={controls}
            >
                <p>{text}</p>
            </motion.span>
        </>
    )
}

