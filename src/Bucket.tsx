import React, { useState,useRef } from "react";

function Bucket (){

    // Handler for ProfilePicselector
    const handleSelect = (fileOrUrl: File | string) => {
        // You can do more here, like uploading or previewing
        console.log("Selected:", fileOrUrl);
    };

    
    return(
        <body>
            <ProfilePicselector onSelect={handleSelect} />
        </body>
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
}
const ProfilePicselector = ({onSelect}: Props)=>{
    const [preview,setPreview] = useState<string>(defaultAvatars[0]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const handleAvatarClick =(url: string)=>{
        setPreview(url);
        onSelect(url);
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
            {/*Upload */}
            <label
                className="choseFile"
            >
                👉 Upload Your Own Picture 👈
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </label>
        </div>
    )
}