import React,{useState,useRef,useEffect} from 'react'
import { gsap } from "gsap";
import Loading from './components/loading'; 
import SlotMachine from './components/slotMachine'
const App = () => {
    const [isLoading,setIsLoading] = useState(true)
    const [isClicked,setIsClicked]=useState(false)
      useEffect(() => {
            if(!isLoading && isClicked){  
                const audio= document.getElementById('bg-audio')
                if(audio){
                    audio.play().catch(err=>console.log("Autoplay Blocked: ",err))
                }
               
            }
            
        }, [isLoading,isClicked]);
    return (
        <div>
            <audio id="bg-audio" loop>
                <source src="src/assets/sound/sound.mp3" type="audio/mpeg" />
            </audio>
            {isLoading && !isClicked?(
                 <Loading onComplete={()=>setIsLoading(false)} isClicked={()=>setIsClicked(true)}/> 
            ):(
                <SlotMachine/>
            )
            }
        </div>
    )
}

export default App