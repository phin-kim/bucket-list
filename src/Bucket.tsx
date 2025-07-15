import React, { useState,useRef, useEffect, } from "react";
import type { ReactNode,  } from "react";
//import { useNavigate } from "react-router-dom";
import  { useAppStore } from "./states";
import type { BucketFormData } from "./states";
import type { User } from "firebase/auth";
import { db } from "../firebase";
import { collection,doc, addDoc, where,getDocs,query, Timestamp, deleteDoc,updateDoc, serverTimestamp } from "firebase/firestore";
import {
    onAuthStateChanged,
    getAuth,
} from "firebase/auth";
import { auth } from "../firebase";
import {  useAnimationControls,  type Variants } from "framer-motion";
import {AnimatePresence, motion, } from 'framer-motion';
import { AiOutlinePlusCircle } from "react-icons/ai";
import { IoMdPersonAdd } from "react-icons/io";
import {  GiEmptyWoodBucketHandle,GiDiamondTrophy } from "react-icons/gi";
import type { FirebaseError } from "firebase/app";
type ProfileProps ={
    onSelect: (fileOrUrl: File | string) => void;
}
type BucketDetails={
    title:string,
    description:string,
    date:string,
    createdAt:Timestamp
}
type BucketData=BucketDetails &{
    id:string
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
interface CompletedGoals{
    completedGoals:BucketData[],
    showGoals:boolean,
    setGoals:(value: boolean)=>void
}
//updater functions have a different type
type NavProps={
    showButtons:boolean,
    setShowButtons:React.Dispatch<React.SetStateAction<boolean>>,
    setGoals:React.Dispatch<React.SetStateAction<boolean>>,
    loadBuckets:()=>void,
    loadGoals:()=>void,
    currentUser: User | null

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
    //const navigate =useNavigate()

    const handleGoogle = async () => {
        try {
            await handleGoogleLogIn(); // This opens the popup
            const user = auth.currentUser;
            if (user) {
            console.log("Logged in user:", user.displayName);
            //navigate("/");
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
    //const {imgUrl,nickName} =useAppStore()
    const [nickname,setNickname] =useState<string>("")
    const [avatar,setAvatar] =useState<string>("");
    const getName = async ()=>{
        const user =getAuth().currentUser;
        if(!user) return;
        const profile =query(collection(db,"users"),where("uid","==",user.uid))
        const profileSnapshot = await getDocs(profile)
        if (profileSnapshot.empty) {
        console.warn("🚫 No profile found for this user!");
        return;
        }
        const profileData = profileSnapshot.docs.map(doc=> doc.data())
        const nickname = profileData[0]?.nickname;
        const avatar = profileData[0]?.avatar;
        setNickname(nickname||"")
        setAvatar(avatar || "");

    }
    getName()
        window.addEventListener("DOMContentLoaded",getName);
    const initial = nickname ? nickname.charAt(0).toUpperCase() : "?";
    const [index,setIndex] =useState<number>(0);
    const images =[
        {
            src:"/hero4.webp",
            alt:"Forest path",
        },
        
        /*{
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
            src:"/hero5.webp",
            alt:"Desert dunes",
        },*/
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
                <h1>
                    Tackly
                </h1>
                {avatar?(
                    <img className="profilePic" src={avatar} alt="" />
                ):(
                    <div className="avatarPlaceholder">
                        <h2>{initial}</h2>
                    </div>
                )}
            </header>
            <section className="heroSection">
                <h1>Welcome, {nickname ?nickname.charAt(0).toUpperCase() + nickname.slice(1) : "Guest"}!</h1>
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
    const {bucketForms,deleteBucketForm}=useAppStore();
    const [formData, setFormData] = useState<BucketFormData>(
    bucketForms[index] ?? { title: "", description: "", date: "" }
    );
    const [successMessage,setSuccessMessage]=useState<boolean>(false)
    const [session,setSession]=useState(false)

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
                setSuccessMessage(false)
                return;
            }
            await addDoc(collection(db,"buckets"),{
                uid:user.uid,
                ...formData,
                createdAt:new Date(),
            });
            console.log(`✅ Bucket ${index + 1} saved to Firestore`, formData);
            setSuccessMessage(true)
            setSession(true)

            setTimeout(() => {
                setSuccessMessage(false)
                setSession(false)
                deleteBucketForm(index);

            }, 4000);
        }
        catch(error){
            console.log("Failed to save bucket",error);
            alert("Error saving bucket data .Please try again")
        }
    };
    
    
    const getBucketName = (index: number) =>index % 2 === 0 ? "Mission: Not-So-Impossible " : "Plot Twist Pending… ";
    
    return(
        <>
        <AnimatePresence>
            <motion.form 
                className="bucketForm"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"

            >
                <h2 style={{fontWeight:700,marginBottom:"0.5rem"}}>
                    <BubbleText>{getBucketName(index)}</BubbleText> 
                </h2>
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
                <label htmlFor="date">Mission End Date</label>
                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    placeholder="Select date to complete activity"
                    onChange={handleChange}
                    
                />
                <motion.button
                    type="button"
                    onClick={()=>handleSave()}
                    disabled={session}
                    whileHover={{
                        rotate:"6deg",
                        boxShadow:"6px 6px 0px black",
                        transition:{duration:0.4,ease:"easeInOut", type:"spring",bounce:0.65,velocity:12,mass:3}
                    }}
                >
                    {session ? "Saving Bucket...": "Save"}
                </motion.button>
            </motion.form>
        </AnimatePresence>
           
            <AnimatePresence>
                {successMessage &&(
                    <motion.section
                        initial={{
                            y:-100,

                            opacity:0
                        }}
                        animate={{
                            y:0,
                            opacity:1,
                        }}
                        exit={{
                            y:100,
                            opacity:0
                        }}
                        transition={{duration:0.8,ease:"backInOut",type:"spring",stiffness:120,damping:10}}
                        className="saveAlert"
                    >
                        <h2>Bucket Successfully Saved</h2>
                    </motion.section>
                )}
            </AnimatePresence>
        </>
    )
}
const BucketManager=()=>{
    const {
        bucketForms,
        addBucketForm,
        updateBucketForm,
    }=useAppStore();
    const [showButtons,setShowButtons] = useState<boolean>(false);
    const [history,setHistory] =useState<BucketData[]>([])
    const [historyContainer,setHistoryContainer]=useState<boolean>(false)
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [editId,setEditId] =useState<string | null >(null)
    const [editForm,setEditForm]=useState({
        title:"",
        description:"",
        date:"",
    })
    const [checkedItems,setIsChecked]= useState<{[id:string]:boolean}>({})
    const [completedGoals,setCompleted]=useState<BucketData[]>([])
    const [showGoals,setGoals] =useState<boolean>(false) 
    const handleSave=(index:number,value:BucketFormData)=>{
        
        const isFomValid = value.title.trim() && value.description.trim() && value.date.trim();
        if (!isFomValid) {
            alert("Please fill in all fields.");
            return;
        }
        updateBucketForm(index,value);
        //setSuccessMessage(true)
        // Here you can save the value to your database or state management
        console.log(`Bucket ${index + 1} saved with value: ${value}`);
        // Optionally, you can clear the input or perform other actions
    }
        

    const buttonContainerRef=useRef<HTMLDivElement | null>(null)
    const historyContainerRef =useRef<HTMLElement | null> (null)
    //const handleButtons =(e:React.MouseEvent)=>{
    //    e.stopPropagation()
    //    setShowButtons(prev =>!prev);
    //}
    const handleHistory=()=>{
        setHistoryContainer(prev=>!prev)
    }
    
    const loadBuckets = async()=>{
        const user =getAuth().currentUser;
        if(!user) return;
        const q = query(collection(db,"buckets"),where("uid","==",user.uid))
        const querySnapshot = await getDocs(q);

        const bucketData:BucketData[] =querySnapshot.docs.map(doc=>({
            id:doc.id ,
            ...doc.data() as BucketDetails
        }))
        console.log("Fetched buckets",bucketData)
        setHistory(bucketData)
        handleHistory();
    }
    const deleteBucket=async(id:string)=>{
        try{
            await deleteDoc(doc(db, "buckets", id));
            console.log("Deleted bucket:", id);
            loadBuckets(); 
        }
        catch(err){
            console.log("error deleteng bucket item",err as FirebaseError)
        }
    }
    const startEditing=(bucket:BucketData)=>{
        setEditId(bucket.id)
        setEditForm({
            title:bucket.title,
            description:bucket.description,
            date:bucket.date
        })
    }
    const cancelEdit=()=>{
        setEditForm({
            title:"",
            description:"",
            date:"",
        })
        setEditId(null);
    }
    const handleEditChange=(e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        const {name,value} =e.target
        setEditForm((prev)=>({...prev,[name]:value}))
    }
    const saveEdit=async ()=>{
        if(!editId)return;
        const {title,description,date} =editForm;
        const isFormValid =title.trim() && description.trim() && date.trim();
        if(!isFormValid){
            alert("Please fill in all the fields")
            return;
        }
        try{
            const bucketRef =doc(db,"buckets",editId);
            await updateDoc(bucketRef,{
                title,description,date,updatedAt:new Date()
            })
            console.log("✅ Bucket updated:", editId);
            await loadBuckets();
            cancelEdit();
        }
        catch(err){
            console.error("❌ Error updating bucket:", err as FirebaseError);
        }

    }
    useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
        setCurrentUser(user);
        //setCheckingSession(false);
        console.log("🚀 Logged in as:", user?.email || "No user"); // done loading
    });

    return () => unsubscribe();
    }, []);
    useEffect(()=>{
        if(!showButtons && !historyContainer) return;
        const handleDisplay=(event:MouseEvent)=>{
            if(showButtons && buttonContainerRef.current && !buttonContainerRef.current.contains(event.target as Node)){
                setShowButtons(false)
            }
            if(historyContainer &&historyContainerRef.current && !historyContainerRef.current.contains(event.target as Node)){
                setHistoryContainer(false)
            }

        }
        document.addEventListener("click",handleDisplay)
        return ()=>{
            document.removeEventListener("click",handleDisplay)
        }
    },[showButtons,historyContainer])
    useEffect(() => {
        if (bucketForms.length === 0) {
            addBucketForm();
        }
    }, [bucketForms.length, addBucketForm]);
    const length =history.length
    const gridStyle:React.CSSProperties={
        display:"grid",
        gridTemplateRows:`repeat(${length},1fr)`,
        gap:"10px"
    }
    const saveGoals=async(goalToSave:BucketData)=>{
        //if(completedGoals.length <= 0)return;
        const user  =getAuth().currentUser;
            if(!user){
                alert("Please Log In or Sign In to save buckets")
                return;
        }
        //const goalToSave =completedGoals.find(item => item.id ===id);
        //if(!goalToSave) return;
        console.log("🧠 Saving this goal:", goalToSave);

        try{
            const ref = collection(db,"completedGoals")
            console.log("🔍collection ref",ref)
            await addDoc(ref,{
                uid:user.uid,
                ...goalToSave,
                savedAt:serverTimestamp(),
            });
            console.log("✅ Goal saved to completedGoals:", goalToSave.title);
        }
        catch(err){
            console.log("❌Couldn't saver completed goals",err as FirebaseError)
        }
    }
    const loadGoals=async()=>{
        const user =getAuth().currentUser;
        if(!user) return;
        const goal = query(collection(db,"completedGoals"),where("uid","==",user.uid))
        const goalSnapShot =await getDocs(goal);
        const goalData:BucketData[]=goalSnapShot.docs.map(doc=>({
            id:doc.id,
            ...doc.data() as BucketDetails
        }));
        console.log("Loaded goals",goalData)

        setCompleted(goalData)

    }
    const deleteHistory=(id:string)=>{
        if(!id) return;
        setIsChecked(prev => ({ ...prev, [id]: true }));
        setTimeout(() => {
            //filter matching item
            const complete = history.filter(item => item.id === id);
            //update the state
            const goalToSave=complete[0];
            //setCompleted(prev => [...prev, ...complete]);
            //save to firestore
            saveGoals(goalToSave);
            //deltet from the history collection
            deleteBucket(id)
            //remove from the ui
            setHistory(history.filter(item => item.id !== id));

            // Clean up checkedItems
            setIsChecked(prev => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
        }, 800);
    }
    
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
                <Nav showButtons={showButtons} setShowButtons={setShowButtons} setGoals={setGoals} loadBuckets={loadBuckets} currentUser={currentUser} loadGoals={loadGoals} />
            </div>
            <AnimatePresence>
                {historyContainer &&(
                        <motion.section
                            variants={containerVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            ref={historyContainerRef} 
                            className="bucketHistory" 
                            style={gridStyle}
                        >
                            <h2>{history.length>0 ?"Your Bucket History": "Your Bucket is Empty"}</h2>
                            {[...history]
                                .sort((a,b)=>b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime())
                                .map((item)=>{
                                const isChecked = checkedItems[item.id] || false;
                                return(
                                    <motion.div
                                        key={item.id} 
                                        className="history"
                                        whileInView={{x:0, opacity:1}}
                                        initial={{x:100, opacity:0}}
                                        exit={{x:-100,opacity:0}}
                                        viewport={{once:true}}
                                        transition={{
                                            duration:8.8,ease:"easeOut",type:"spring",stiffness:150,damping:10
                                        }}
                                    >
                                        {editId === item.id ?(
                                            <form className="editForm" >
                                                <label htmlFor="title">Title</label>
                                                <input
                                                name="title"
                                                value={editForm.title}
                                                onChange={handleEditChange}
                                                />
                                                <label htmlFor="textarea">Description</label>
                                                <textarea
                                                name="description"
                                                typeof="text"
                                                value={editForm.description}
                                                onChange={handleEditChange}
                                                />
                                                <label htmlFor="date">Mission End Date</label>
                                                <input
                                                name="date"
                                                type="date"
                                                value={editForm.date}
                                                onChange={handleEditChange}
                                                />
                                                <motion.button
                                                whileHover={{
                                                    rotate:"6deg",
                                                    boxShadow:"6px 6px 0px black",
                                                    transition:{duration:0.4,ease:"easeInOut", type:"spring",bounce:0.65,velocity:12,mass:3}
                                                }} 
                                                    type="button" 
                                                    onClick={saveEdit}
                                                >
                                                    Save
                                                </motion.button>
                                                <motion.button
                                                whileHover={{
                                                    rotate:"6deg",
                                                    boxShadow:"6px 6px 0px black",
                                                    transition:{duration:0.4,ease:"easeInOut", type:"spring",bounce:0.65,velocity:12,mass:3}
                                                }} 
                                                    type="button" 
                                                    onClick={cancelEdit}
                                                >
                                                    Cancel
                                                </motion.button>
                                            </form>
                                        ):(
                                            <>
                                                <AnimatePresence>
                                                    {isChecked && (
                                                    <motion.svg
                                                        key="x-overlay"
                                                        width="100%"
                                                        height="100%"
                                                        viewBox="0 0 100 100"
                                                        style={{ position: "absolute", top: -20, left: 0, pointerEvents: "none", zIndex: 10 }}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="hidden"
                                                    >
                                                        <motion.path
                                                        d="M0 0 L100 100"
                                                        stroke="red"
                                                        strokeWidth="4"
                                                        strokeLinecap="round"
                                                        variants={{
                                                            hidden: { pathLength: 0 },
                                                            visible: { pathLength: 1 }
                                                        }}
                                                        transition={{ duration: 0.4 }}
                                                        />
                                                        <motion.path
                                                        d="M0 100 L100 0"
                                                        stroke="red"
                                                        strokeWidth="4"
                                                        strokeLinecap="round"
                                                        variants={{
                                                            hidden: { pathLength: 0 },
                                                            visible: { pathLength: 1 }
                                                        }}
                                                        transition={{ duration: 0.4, delay: 0.2 }}
                                                        />
                                                    </motion.svg>
                                                    )}
                                                </AnimatePresence>
                                                <h3> <span>Your Adventure:</span>  {item.title}</h3>
                                                <p> <span>Description:</span>  {item.description}</p>
                                                <p> <span>Wish Deadline:</span>  {item.date}</p>
                                                <input 
                                                    type="checkbox"
                                                    onChange={()=>{
                                                        deleteHistory(item.id);
                                                        //handleCheck(item.id);
                                                    }}
                                                    checked={isChecked} 
                                                />
                                                <p>Completed</p>
                                                <motion.button 
                                                whileHover={{
                                                    rotate:"6deg",
                                                    boxShadow:"6px 6px 0px black",
                                                    transition:{duration:0.4,ease:"easeInOut", type:"spring",bounce:0.65,velocity:12,mass:3}
                                                }}
                                                    onClick={()=>startEditing(item)}
                                                >
                                                    Edit Bucket
                                                </motion.button>
                                                <motion.button
                                                whileHover={{
                                                    rotate:"6deg",
                                                    boxShadow:"6px 6px 0px black",
                                                    transition:{duration:0.4,ease:"easeInOut", type:"spring",bounce:0.65,velocity:12,mass:3}
                                                }} 
                                                onClick={()=>deleteBucket(item.id)}
                                                >
                                                    Delete Bucket
                                                </motion.button>
                                            </>
                                        )}
                                    </motion.div>
                                )
                                })}
                        </motion.section>
                )}
            </AnimatePresence>
            <CompletedGoals completedGoals={completedGoals} showGoals={showGoals} setGoals={setGoals}/>
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
const Nav=({showButtons,setShowButtons,setGoals,loadBuckets,currentUser,loadGoals}:NavProps)=>{
    const {setProfileSelector,addBucketForm}=useAppStore()
    const [hovered,setHovered] =useState<boolean>(false)
    const handleGoals=()=>{
        setGoals(prev=> !prev)
    }
    const handleButtons =(e:React.MouseEvent)=>{
        e.stopPropagation()
        setShowButtons(prev =>!prev);
    }
    return(
        <>
            {showButtons ?(
                    <motion.section
                        variants={modalVariants}
                        initial="initial"
                        animate="animate"
                        exit="initial"
                        className="bucketControlButtons"
                    >
                        <HoverAnimatedButton
                            icon={<AiOutlinePlusCircle size={70}  />}
                            text="Add a New Bucket Item"
                            className="addButton"
                            onClick={addBucketForm}
                            //controls={controls}
                            variants={hoverButtonVariants}
                        />

                        <HoverAnimatedButton
                            icon={<GiEmptyWoodBucketHandle size={70}  />}
                            text="Load your Bucket History"
                            className="loadButton"
                            onClick={()=>
                                loadBuckets()
                            }
                            //controls={controls}
                            variants={hoverButtonVariants}
                        />

                        <HoverAnimatedButton
                            icon={<GiDiamondTrophy size={70} />}
                            text="View Your Achieved Goals"
                            className="logIn"
                            onClick={()=>{
                                loadGoals();
                                handleGoals();
                            }}
                            //controls={controls}
                            variants={hoverButtonVariants}
                        />
                        <HoverAnimatedButton
                            icon={<IoMdPersonAdd size={70} />}
                            text="Create Your Account"
                            className="createAccount"
                            onClick={() => setProfileSelector(true)}
                            //controls={controls}
                            variants={hoverButtonVariants}
                        />
                    </motion.section>
                ):(
                    <motion.div
                        onHoverStart={()=>setHovered(true)}
                        onHoverEnd={()=>setHovered(false)}
                        onTapStart={()=>setHovered(true)}
                        onTap={()=>setHovered(false)}
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
            {!currentUser &&(
                <p></p>
            )}
        </>
    )
}
const CompletedGoals=({completedGoals,showGoals}:CompletedGoals)=>{

    const goalRef =useRef<HTMLDivElement | null>(null)
    
    return(
        <>
        <AnimatePresence>
            {showGoals && (
                    <motion.section
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        ref={goalRef} 
                        className="completedContainer"
                    >
                        <h2>
                        {completedGoals.length === 0
                            ? "No Completed Goals Yet"
                            : "Your Completed Goals"}
                        </h2>

                        {completedGoals
                        .sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime())
                        .map((item) => (
                            <div key={item.id} className="completed">
                            <h3><span>Your Adventure:</span> {item.title}</h3>
                            <p><span>Description:</span> {item.description}</p>
                            <p><span>Wish Deadline:</span> {item.date}</p>
                            </div>
                        ))}
                    </motion.section>
            )}
        </AnimatePresence>
        </>
    )
}

const BubbleText = ({ children }: { children: string }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <p
        style={{
            //textAlign: "center",
            fontSize: "3rem",
            fontWeight: 100,
            color: "rgb(165, 180, 252)",
        }}
        >
        {children.split("").map((char, index) => {
            const isHovered = index === hoveredIndex;
            const isNeighbor =index === hoveredIndex! - 1 || index === hoveredIndex! + 1;

            let scale = 1;
            let color = "rgb(196, 167, 242)"; // base soft purple (was indigo-300)

            if (isHovered) {
            scale = 1.3;
            color = "rgb(243, 232, 255)"; // light lavender glow (was almost-white)
            } else if (isNeighbor) {
            scale = 1.1;
            color = "rgb(216, 180, 254)"; // mid lavender (was light indigo)
            }

            return (
            <motion.span
                key={index}
                style={{
                display: "inline-block",
                marginRight: "1px",
                color,
                cursor: "default",
                }}
                animate={{ scale, color }}
                transition={{ type: "spring",bounce:0.65,mass:4,ease:"easeIn",velocity:10}}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onTapStart={() => setHoveredIndex(index)}
                onTapCancel={() => setHoveredIndex(null)}
            >
                {char}
            </motion.span>
            );
        })}
        </p>
    );
};



const hoverButtonVariants:Variants ={
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
const containerVariants:Variants={
    initial:{
        x:70,
        opacity:0
    }, 
    animate:{
        x:0,
        opacity:1,
        transition:{
            duration:1.5,ease:"easeIn" ,type:"spring",bounce:0.55
        }
    },
    exit:{
        x:-70,
        opacity:0
    },
    
}
const lineVariants:Variants={
    initial:{rotate:0,y:0,opacity:1},
    topHover:{rotate:35,y:18},
    middleHover:{opacity:0},
    bottomHover:{rotate:-35,y:-10}
}
const modalVariants:Variants={
    initial:{
        scaleY: 0,
        opacity: 0,
        originY: 0,
        y: -50,
    },
    animate:{
        scaleY: 1,
        opacity: 1,
        originY: 0,
        y: 0,
        transition: {
            type: 'spring', 
            //stiffness: 150,
            bounce:0.55,
            //damping: 15,
            duration: 1.8,
            //velocity:2,
            staggerChildren: 0.5,
            delayChildren: 0.8
        },
    },
    exit:{
        scaleY: 0,
        opacity: 0,
        originY: 0,
        y: -50,
        transition: {
            type: 'spring',
            stiffness: 150,
            damping: 10,
            duration: 0.8,
        },
    }
}

