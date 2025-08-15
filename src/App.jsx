import React,{useState,useRef,useEffect} from 'react'
import { gsap } from "gsap";

const App = () => {
    const slot = [
        { id: 1, value: '🍎' },
        { id: 2, value: '🍌' },
        { id: 3, value: '🍒' },
        { id: 4, value: '🍇' },
        { id: 5, value: '🍉' },
        { id: 6, value: '🍊' },
        { id: 7, value: '🍋' },
        { id: 8, value: '🍍' },
        { id: 9, value: '7️⃣' },
    ]
    const [tokens, setTokens] = useState(10);
    const [spinning, setSpinning] = useState(false);
    const [reels, setReels] = useState([[], [], []]);
    const stripRefs = useRef([]);
    const itemHeigh=260
    const repeat = 20
    const repeated = Array.from(
        { length: slot.length * repeat },
        (_, i) => slot[i % slot.length]
    )
    
    const baseOffset = Math.floor(repeated.length / 2)
    
    // useEffect(() => {
    //     // debug values
    //     const initialY = -baseOffset * itemHeigh;
    //     // optional debug
    //     console.log('baseOffset', baseOffset, 'itemHeigh', itemHeigh, 'initialY', initialY);

    //     stripRefs.current.forEach((el) => {
    //         if (el) {
    //         gsap.set(el, { y: initialY });
    //         }
    //     });
    //     }, [baseOffset, itemHeigh]);

    const spinFunc= ()=>{
        if(spinning) return;
        setSpinning(true);
        let finishedCount = 0;
        for(let i = 0;i<reels.length;i++){
            const element = stripRefs.current[i];

            if(!element){
                finishedCount++;
                continue    
            }

            const randomIndex = Math.floor(Math.random() * slot.length);
            const loop = 3 + Math.floor(Math.random() * 4); // 3..6 loops
            const finalIndex = baseOffset + loop * slot.length + randomIndex;
            const finalY = -finalIndex * itemHeigh;
            const duration = 0.9 + Math.random() * 1.0 + i * 0.25;
            console.log('loop', loop, 'finalIndex', finalIndex, 'finalY', finalY, 'duration', duration);
            gsap.to(element,{
                y:finalY,
                duration: duration,
                ease: "power2.inOut",
                onComplete : () => {
                    finishedCount++;
                    if(finishedCount === reels.length){
                        setSpinning(false);
                    }
                }
            })
            
        }
    }
   

  return (
    <section className='SlotMachine'>
        <div className='slot-token'>
            <span className='token'>Tokens: {tokens}</span>
        </div>
        <div className='slot-container' >
            {reels.map((reel, index) => (
                <div key={index} className='reels'
                    style={{
                        height: itemHeigh,
                        overflow: 'hidden'
                    }}
                >
                    <div  ref={(el) => (stripRefs.current[index] = el)}>
                        {repeated.map((item,i)=>(
                            <div key={i} className='slot-item strip'   style={{ height: itemHeigh }}>
                                <span className='slot-image'>{item.value}</span>
                                {/* <span>{index}</span> */}
                            </div>

                        ))}
                    </div>
                </div>
            ))}
            
        </div>
        <div className='button-container'>
               <button 
               className='spin-button'
               disabled={spinning}
               style={{
                cursor: spinning ? "not-allowed" : "pointer",
                background: spinning ? "#9ca3af" : "#10b981",}}
               onClick={spinFunc}>
                    {spinning ? 'Spinning...':'Spin'}
               </button>
        </div>
    </section>
  )
}

export default App