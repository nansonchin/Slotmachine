import React,{useState,useRef,useEffect} from 'react'
import { gsap } from "gsap";

const SlotMachine = () => {
    const audioRef = useRef(null);
    const bgFrame = useRef(null)

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
    const handleMouseLeave=()=>{
        const element = frameRef.current
        gsap.to(element,{
            duration:0.3,
            rotateX:0,
            rotateY:0,
            ease:'power2.inOut'
        })
    }
  const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const element = bgFrame.current;
        if (!element) return;

        const rect = element.getBoundingClientRect();

        // Mouse position relative to element
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Element center
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Correct: rotateX depends on vertical (y), rotateY depends on horizontal (x)
        const rotateX = ((y - centerY) / centerY) * -10; // invert so it feels natural
        const rotateY = ((x - centerX) / centerX) * 10;

        gsap.to(element, {
            duration: 0.3,
            rotateY,
            rotateX,
            transformPerspective: 500,
            ease: "power1.inOut",
        });
        };
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
        if(tokens<50) return
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
    <section className='SlotMachine relative min-h-screen border-2'>
            <video
                className="absolute top-0 left-0 w-full min-h-screen object-cover z-1"
                src="src/assets/video/pixel.mp4"
                autoPlay
                loop
                muted
                playsInline
            />
            <div className=" bg-black opacity-30 z-1 absolute min-h-screen min-w-screen"></div>
        <div ref={bgFrame} 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className='min-h-screen min-w-screen bg-[url(src/assets/images/background.png)] bg-cover bg-center overflow-hidden absolute top-0 z-20'></div>
        
        <div className='relative z-20'>
            <div className='bg-white opacity-35 min-w-screen min-h-[60vh] absolute border
           [transform-style:preserve-3d] [transform:rotateX(-8deg)_rotateY(0deg)] mix-blend-difference
            [mask-image:radial-gradient(60%_180px_at_bottom,#0000_98%,#000)] 
            [clip-path:ellipse(98%_95%_at_bottom)]
            '>

            </div>
            <div className="slot-token ">
                {/* <span className='token'>Tokens: {tokens}</span> */}
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
        
        </div>
        <div className='min-h-full min-w-full relative z-50'>
            <div className='w-[28.125rem] h-[28.125rem] absolute top-1/2 left-1/2 -translate-x-1/2'>
                <div onClick={tokens<50? undefined : spinFunc} className={`${tokens<50? "border-purple-500 ":"border-sky-500  "} rounded-full p-2 absolute w-[24.125rem] h-[24.125rem] left-1/2 -translate-x-1/2 top-1/2`}>
                    <div className={`${
                            tokens < 50 ? "radar-red" : "radar-blue"
                        } h-[100%] w-[100%] absolute center-box mix-blend-difference cursor-pointer`}
                        >
                        <p className='center-box font-arse text-xl !top-[6rem] text-center'
                        > {tokens <50 ? ("Press 'R' to reload Token") :
                            spinning ? 'Spinning...':'Spin'
                        }</p>
                    </div>
                </div>
            </div>
        </div>

       <div class="relative w-[25%] [perspective:100px] mt-[10rem] z-50" >
            <div className='p-[3.125rem] absolute left-1/6 border-black bg-white opacity-75
            [transform-style:preserve-3d] [transform:rotateX(-2deg)_rotateY(5deg)] mix-blend-difference flex items-center gap-[0.6rem]' 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseLeave}
            onMouseEnter={handleMouseLeave}
        > 
                <span className='font-mons'>Tokens:</span> 
                <span className='!text-[3rem]'>{tokens}</span>
            </div>
        </div>
        
    </section>
  )
}

export default SlotMachine