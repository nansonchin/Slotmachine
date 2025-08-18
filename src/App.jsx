import React,{useState,useRef,useEffect} from 'react'
import { gsap } from "gsap";
import Loading from './components/loading'; 
import SlotMachine from './components/slotMachine'
const App = () => {
    const [isLoading,setIsLoading] = useState(true)
    return (
        <div>
            {isLoading?(
                 <Loading onComplete={()=>setIsLoading(false)}/> 
            ):(
                <SlotMachine/>
            )
            }
        </div>
    )
}

export default App