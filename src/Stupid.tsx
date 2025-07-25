import { AnimatePresence, motion } from "framer-motion";
import React, { useState,useEffect } from "react";
function Gf (){
    const text = "To My Lovely Girlfriend😘/ My ride or die😜/ my bestie🥰/ my favourite person😋";
    const h2 =" i appreciate you coming into my life and making it so much better and improving me as a person happy early Girlfriend day😘😍"
    const images =[
        "celine/celinepic1.jpg",
        "celine/celinepic2.jpg",
        "celine/celinepic3.jpg",
        "celine/celinepic4.jpg",
        "celine/celinepic5.jpg",
        "celine/celinepic6.jpg",
        "celine/celinepic7.jpg",
        "celine/celinepic8.jpg",
        "celine/celinepic9.jpg",
        "celine/celinepic10.jpg",
        "celine/celinepic11.jpg",
        "celine/celinepic12.jpg",
        "celine/celinepic13.jpg",
        "celine/me pic1.jpg",
        "celine/mepic2.jpg",
    ];
    const [showText,setShowText] = useState(true);
    const handleText = () => {
        setShowText(prev=>!prev);
    }
    const [showImages,setShowImages] = useState(false);
    const handleImages = () => {
        setShowImages(prev=>!prev);
    }
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowText(false);
        }, 8000);
        return ()=> clearTimeout(timer);
    }, []);
    
    return(
        
        <>
            {showText ?(
                <div className="bg-[linear-gradient(to_right,_#ff69b4,_#8a2be2)] p-5 relative left-[2em] top-[2em] h-fit w-[80%] rounded-2xl  ">
                    <h2 className="text-[6em] text-center text-neon font-chewy">{text.toUpperCase()}</h2>
                </div>
            ):(
                <AnimatePresence>
                    <motion.div 
                    initial={{
                        opacity:0,
                        y:100,
                    }}
                    animate={{
                        opacity:1,
                        y:0,
                    }}
                    exit={{
                        opacity:0,
                        y:100,
                    }}
                    transition={{
                        duration:1.2,
                        type:"spring",
                        bounce:0.65,

                    }}
                    className="absolute p-5 left-[3em] z-4 top-[2em]  w-[80%] h-fit rounded-2xl bg-[#222] border-3 border-white"
                >
                <h2 className="text-center text-neon font-chewy text-7xl">
                    {h2.toUpperCase()}
                </h2>
                </motion.div>
                </AnimatePresence>
                
            )}
            <button onClick={handleText} className="text-6xl absolute left-[20%] rounded-2xl top-[59%] z-20 text-white font-chewy p-4 bg-[#222] border-3 border-white hover:bg-[#444] hover:text-neon hover:scale-110 hover:border-neon transition-all duration-300">Click me 🥺</button>
            <button onClick={handleImages} className="text-6xl absolute left-[20%] rounded-2xl top-[15em] text-white font-chewy z-10 p-4 bg-[#222] border-3 border-white hover:bg-[#444] hover:text-neon hover:scale-110 hover:border-neon transition-all duration-300">Click me Again 🥺</button>
            {showImages &&(
                <motion.ul
                    initial={{
                        opacity:0,
                        y:100,
                    }}
                    animate={{
                        opacity:1,
                        y:0,
                    }}
                    transition={{
                        duration:1.2,
                        type:"spring",
                        bounce:0.65,
                    }}
                    className="mt-[65em] relative"
                >
                    {images.map((img,index)=>(
                        <motion.li 
                            key={index}
                            initial={{
                                opacity:0,
                                x:index %2 ===0 ? -100:100,
                            }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 1.2, type: "spring" }}
                        >
                            <img src={img} alt={`celine-${index}`} key={index} className="w-[30em] relative left-20  mb-20 h-[30em]   object-cover rounded-2xl" />
                        </motion.li>
                        
                    ))}
                </motion.ul>
            )}
            
        </>
    )
}
export default Gf;  