import React,{useState,useRef,useEffect} from 'react'
import { gsap } from "gsap";

const SlotMachine = () => {
    const slot = [
        { id: 1, value: '🍎',rewards:10 },
        { id: 2, value: '🍌',rewards:20  },
        { id: 3, value: '🍒',rewards:30  },
        { id: 4, value: '🍇',rewards:40  },
        { id: 5, value: '🍉',rewards:50  },
        { id: 6, value: '🍊',rewards:60  },
        { id: 7, value: '🍋',rewards:70  },
        { id: 8, value: '🍍',rewards:80  },
        { id: 9, value: '7️⃣',rewards:1000 },
    ]
    const [statusText,setStatusText] = useState('Welcome')
    const [tokens, setTokens] = useState(0);
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

    useEffect(()=>{
        const handleKey=(event=>{
            if(event.key.toLowerCase() === 'r'){
                setTokens(prev=>prev+10)
            }
        })
        window.addEventListener('keydown',handleKey)
        return()=>{
            window.removeEventListener('keydown',handleKey)
        }
    },[])
    const getRandomHighChance=(highChanceId)=>{
        const weightPool=[]
        slot.forEach((item)=>{
            if(item.id=== 9){
                weightPool.push(...Array(10).fill(item))
            }else if(item.id === highChanceId){
                weightPool.push(...Array(60).fill(item))
            }else{
                weightPool.push(...Array(30).fill(item));
            }
        })
        return weightPool[Math.floor(Math.random() * weightPool.length)];
    }

    const spinFunc= ()=>{
        setStatusText('Welcome')
        setTokens(prev=>(prev-50))
        if(spinning) return;
        setSpinning(true);

        let finishedCount = 0;

        const spinResults = [];
        const nonJackpotSymbols = slot.filter(s => s.id !== 9);
        const highChanceId = nonJackpotSymbols[
        Math.floor(Math.random() * nonJackpotSymbols.length)
        ].id;

        const forceWin =Math.random()<0.4
        let winningSymbol=null


        for(let i = 0;i<reels.length;i++){
            const element = stripRefs.current[i];

            if(!element){
                finishedCount++;
                continue    
            }
            let symbol;
            if(i===0){
                symbol = getRandomHighChance(highChanceId)
                winningSymbol= symbol
            }else{
                if(forceWin && winningSymbol.id !==9){
                    symbol = winningSymbol
                }else{
                    symbol = getRandomHighChance(highChanceId)
                }
            }
            console.log(symbol)
            const randomIndex = slot.findIndex(s => s.id === symbol.id);

            const loop = 3 + Math.floor(Math.random() * 4); // 3..6 loops
            const finalIndex = baseOffset + loop * slot.length + randomIndex;
            const finalY = -finalIndex * itemHeigh;
            const duration = 0.9 + Math.random() * 1.0 + i * 0.25;

            spinResults[i]=symbol
            console.log('loop', loop, 'finalIndex', finalIndex, 'finalY', finalY, 'duration', duration);
            gsap.to(element,{
                y:finalY,
                duration: duration,
                ease: "power2.inOut",
                onComplete : () => {
                    finishedCount++;
                    if(finishedCount === reels.length){
                        if(spinResults[0].id === spinResults[1].id &&  spinResults[1].id === spinResults[2].id){
                            const matched= slot.find(s=>s.id ===spinResults[0].id)
                            const rewards=matched.rewards

                            console.log('REWARDS'+ rewards)

                            setTokens(prev=>prev+rewards)
                            if(matched.id !== 9){
                                setStatusText(`Congratulation, You Win ${rewards} tokens`)
                            }else{
                                setStatusText(`WE GOT A 777 BONUES WINNER : ${rewards}`)
                            }
                        }
                        setSpinning(false);
                    }
                }
            })
            
        }
    }
   

  return (
    <section className='SlotMachine relative'>
        <div></div>
        <div className='min-h-screen min-w-screen bg-[url(src/assets/images/background.png)] bg-cover bg-center overflow-hidden absolute top-0'></div>
        <div>
            <div className="slot-token ">
                <span className='token'>Tokens: {tokens}</span>
            </div>
            <div className='text-center text-xl py-6'>
                {statusText}
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
                disabled={spinning || tokens<50}
                style={{
                    cursor: spinning ? "not-allowed" : "pointer",
                    background: tokens <50? '': spinning ? "#9ca3af" : "#10b981",}}
                    onClick={spinFunc}>
                        {tokens <50 ? ("Press 'R' to reload Token") :
                            spinning ? 'Spinning...':'Spin'
                        }
                </button>
            </div>
        </div>
        
    </section>
  )
}

export default SlotMachine