import React,{useState,useRef,useEffect} from 'react'
import { gsap } from "gsap";

const SlotMachine = () => {
    const audioRef = useRef(null);
    const bgFrame = useRef(null)
    const [history,setHistory] = useState([])
    const bonusTitleRef = useRef()
    const bonusStageRef = useRef()
    const [bonusProgress,setBonusProgress] =useState(9)
    const [freeSpinsRemaining,setFreeSpinsRemaining] =useState(0)
    const slot = [
        { id: 1, value: '🍎',rewards:10,name:'Apple X3 (Tokens : 10)' },
        { id: 2, value: '🍌',rewards:20,name:'Banana X3 (Tokens : 20)'  },
        { id: 3, value: '🍒',rewards:30,name:'Cherry X3 (Tokens : 30)'  },
        { id: 4, value: '🍇',rewards:40,name:'Grape X3 (Tokens : 40)'  },
        { id: 5, value: '🍉',rewards:50,name:'Watermelon X3 (Tokens : 50)'  },
        { id: 6, value: '🍊',rewards:60,name:'Orange X3 (Tokens : 60)'  },
        { id: 7, value: '🍋',rewards:70,name:'Mango X3 (Tokens : 70)'  },
        { id: 8, value: '🍍',rewards:80,name:'Pineapple X3 (Tokens : 80)'  },
        { id: 9, value: '7️⃣',rewards:1000,name:'777 Bonus' },
    ]
    const [statusText,setStatusText] = useState('Welcome')
    const [tokens, setTokens] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [reels, setReels] = useState([[], [], []]);
    const stripRefs = useRef([]);
    const historyRef=useRef()
    const historyTitleRef=useRef()
    const itemHeigh=260
    const repeat = 20
    const repeated = Array.from(
        { length: slot.length * repeat },
        (_, i) => slot[i % slot.length]
    )
    const [isAnimatingBonus,setIsAnimatingBonus]= useState(false)
    const baseOffset = Math.floor(repeated.length / 2)
    const splitBox = useRef()
    const splitLeftRef = useRef()
    const splitRightRef = useRef()
    const glitchRef = useRef()
    const isAnimatingBonusRef = useRef(false);
    const handleMouseLeave=()=>{
        const element = bgFrame.current
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
    // useEffect(() => {
    //     if (bonusCount === 10) {
    //         setIsInfinite(true);   // immediately change tokens to infinity symbol
    //     }else{
    //         setIsInfinite(false)
    //     }
    // }, [bonusCount]);

    useEffect(()=>{
        if(isAnimatingBonus) return;
        const handleKey=(event=>{
            if(event.key.toLowerCase() === 'r'){
                setTokens(prev=>prev+10)
            }
        })
        window.addEventListener('keydown',handleKey)
        return()=>{
            window.removeEventListener('keydown',handleKey)
        }
    },[isAnimatingBonus])

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

    useEffect(()=>{
         if (history.length > 0 && historyTitleRef.current) {
                gsap.fromTo(
                historyTitleRef.current,
                { x: -200, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
                );
            }
    },[])

    useEffect(()=>{
        if(history.length > 0 && historyRef.current){
            const lastItem= historyRef.current.lastElementChild
            if(lastItem){
                gsap.fromTo(
                    lastItem,
                    {y:500,opacity:0},
                    {y:0,opacity:1,duration:0.5,ease:'power3.out'}
                )
            }
        }
    },[history])

    const spinFunc= ()=>{

        if(spinning || isAnimatingBonus)return;
        
        if(freeSpinsRemaining === 0 && tokens <50) return;
        setSpinning(true)
        setStatusText('Welcome')
        
        if(freeSpinsRemaining ===0){
            setTokens((prev)=> prev-50)
        }

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
                            setHistory((prev)=>{
                                const updated=[...prev,matched.name]
                                return updated.length > 6? updated.slice(updated.length-6):updated
                            })

                            if(freeSpinsRemaining ===0){
                                setBonusProgress((prev)=>{
                                    const next = prev+1
                                    if(next >=10){
                                        setBonusProgress(0)
                                        setFreeSpinsRemaining(5)
                                        setStatusText("Bonus")
                                    }
                                    return next>=10? 0:next
                                })
                            }
                            setFreeSpinsRemaining((prev)=>{
                                if(prev>0){
                                    const next= prev-1;
                                    if(next<=0){
                                        setStatusText('Free Spins Finished')
                                    }else{
                                        setStatusText(`Free Spins left :${next}`)
                                    }
                                    return Math.max(0,next)
                                }
                                return prev
                                
                            })
                        }
                        setSpinning(false);
                    }
                }
            })
        }
    }

    const prevFreeSpinsRef = useRef(freeSpinsRemaining)

    useEffect(()=>{
        if(freeSpinsRemaining > 0 && prevFreeSpinsRef.current === 0){
            runBonusAnimation()
        }
        prevFreeSpinsRef.current = freeSpinsRemaining
    },[freeSpinsRemaining])

    const startGlitch=()=>{
        const el =glitchRef.current
        if(!el) return

        gsap.set(el,{display:'block',opacity:1,pointerEvents:'none'})

        const imgs = el.querySelectorAll('img')

        if(el._tl){
            el._tl.kill()
        }

        const glitchTl= gsap.timeline({repeat:-1})

        glitchTl.to(imgs,{
            x:()=>gsap.utils.random(-12,12),
            y:()=>gsap.utils.random(-8,8),

            skewX:()=>gsap.utils.random(-8,-8),
            duration:0.8,
            ease:'none',
            stagger:0.02,
        }).to(imgs,{
            x:()=>gsap.utils.random(-6,-6),
            y:()=> gsap.utils.random(-4,4),
            skewX:()=>gsap.utils.random(4,-4),
            duration:5,
            ease:'none',
            stagger:0.02,
        }).to(imgs,{
            x:0,
            y:0,
            skewX:0,
            duration:3,
            ease:'power2.out',
            stagger:0.02
        })

        el._tl = glitchTl()
    }

    const stopGlitch=()=>{
        const el=glitchRef.current;
        if(!el) return
        if(el._tl){
            el._tl.kill()
            delete el._tl
        }
        gsap.set(el,{
            display:'none',
            opacity:0,
            x:0,
            y:0,
            skewX:0
        })
    }
    const runBonusAnimation =()=>{
        if (isAnimatingBonusRef.current) return;

        setIsAnimatingBonus(true);
        isAnimatingBonusRef.current = true;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
            if (!glitchRef.current || !bonusStageRef.current || !splitBox.current || !splitLeftRef.current || !splitRightRef.current) {
                console.warn("bonus refs not ready");
                return;
            }

            setIsAnimatingBonus(true); // already set but safe to call

            gsap.set(bonusStageRef.current, { opacity: 0, display: "none" });
            gsap.set(splitBox.current, { opacity: 0, });
            const tl = gsap.timeline({
                onComplete: () => {
                gsap.set(splitBox.current, { display: "none", opacity: 0 });
                gsap.set(bonusStageRef.current, { display: "none", opacity: 0 });
                stopGlitch();
                setIsAnimatingBonus(false);
                },
            });
            tl.to(splitBox.current,{display:'block',opacity:1,duration:0.65,ease:'power3.out'})
            tl.to(splitLeftRef.current, { yPercent: -100, duration: 0.65, ease: "power3.out" }, 0);
            tl.to(splitRightRef.current, { yPercent:100, duration: 0.65, ease: "power3.out" }, 0);
              tl.call(() => {
                    startGlitch();
                }, null, '>-0.05');
            bonusStageRef.current._tl = tl;
            });
        });
    }

    useEffect(()=>{
        return()=>{
            try{
                if(splitBox.current && splitBox.current._tl){
                  splitBox.current._tl.kill()
                }
                if(bonusStageRef.current && bonusStageRef.current._tl){
                    bonusStageRef.current._tl.kill()
                }
                if(glitchRef.current && glitchRef.current._tl){
                    glitchRef.current._tl.kill();
                }
            }catch(e){}
        }
    },[])
   
    const inFreeSpinMode = freeSpinsRemaining > 0;
  return (
    <section className='SlotMachine relative min-h-screen'>
         <div ref={splitBox} className='center-box w-[50%] h-[8rem] overflow-hidden items-center justify-center bg-[#FFFF3C]' 
          style={{display: "none", zIndex:999}}
          >
              <div className=' center-box text-[3rem] font-mons'
                style={{zIndex:999}}
              >
                    Bonus
                </div>
            <div className='relative w-full h-full flex flex-col overflow-hidden'>
                <div ref={splitLeftRef} className='w-full h-full overflow-hidden flex items-center bg-[#ffff] justify-center ' style={{zIndex:9999}}>
                    <div className='transform translate-x-0'>
                    </div>
                </div>
  
                <div ref={splitRightRef} className='w-full h-full overflow-hidden flex items-center bg-[#ffff] justify-center ' style={{zIndex:9999}}>
                    <div className='transform translate-x-0'>
                    </div>
                </div>
            </div>
        </div>
    
        {
            isAnimatingBonus && (
                <div className='absolute inset-0 z-[9999] pointer-events-auto flex items-center justify-center'>
                    <div className='absolute inset-0'>
                        <img ref={bonusStageRef} src="src/assets/images/BONUSSTAGE.png" className='relative w-full h-full object-cover z-[10000] pointer-events-none' 
                        style={{display:'none',opacity:'0'}}/>
                    </div>
                </div>
            )
        }
        <div className='center-box'>
            <div ref={glitchRef} className='m-auto w-full' style={{ display: 'none', opacity: 0, zIndex: 9999 }}>
            {
                [...Array(10)].map((_,i)=>(
                    <img className="py-5  " src='src/assets/images/BONUSSTAGE.png'/>

                ))
            }
            </div>
        </div>
        
        {/*       
            <video
                className="absolute top-0 left-0 w-full min-h-screen object-cover z-1"
                src="src/assets/video/pixel.mp4"
                autoPlay
                loop
                muted
                playsInline
            /> */}
            {/* <div className=" bg-black opacity-30 z-1 absolute min-h-screen min-w-screen"></div> */}
        <div ref={bgFrame} 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className='min-h-screen min-w-screen bg-[url(src/assets/images/background.png)] bg-cover bg-center overflow-hidden absolute top-0 z-20'></div>
        
        <div className='relative z-0'>
            <div className='bg-black opacity-100 min-w-screen min-h-[60vh] absolute border
           [transform-style:preserve-3d] [transform:rotateX(-8deg)_rotateY(0deg)] mix-blend-difference
            [mask-image:radial-gradient(60%_180px_at_bottom,#0000_98%,#000)] 
            [clip-path:ellipse(98%_95%_at_bottom)]
            '>
                <video
                className="absolute top-0 left-0 w-full min-h-screen object-center z-1"
                src="src/assets/video/pixel.mp4"
                autoPlay
                loop
                muted
                playsInline
            />
            </div>
            <div className="slot-token ">
                {/* <span className='token'>Tokens: {tokens}</span> */}
            </div>
            <div className='text-center text-xl py-6'>
                {/* {statusText} */}
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
                    <div className={` h-[100%] w-[100%] absolute center-box mix-blend-difference cursor-pointer`}
                        >
                        <p className='center-box font-arse text-xl !top-[6rem] text-center'
                        > {tokens <50 ? ("Press 'R' to reload Token") :
                            spinning ? 'Spinning...':'Spin'
                        }</p>
                    </div>
                </div>
            </div>
        </div>
        
       <div className="relative w-[100%] [perspective:100px] mt-[10rem] z-50 flex" >
            <div className=' w-[20%]'>
                {
                    history.length >0 &&(
                        <div  className='p-[.5rem] [transform-style:preserve-3d] [transform:rotateX(-15deg)_rotateY(35deg)] rotate-5'>
                            <div ref={historyTitleRef} className='font-mons'>History </div>
                            <div ref ={historyRef}className='flex flex-col justify-end items-end'>{
                                history.map((data)=>(
                                    <div>{data}</div>
                                ))
                                }</div>
                        </div>
                    )
                }
                
            </div>
        <div className='flex flex-col absolute right-[10rem] gap-[.5rem]'>
                <div className={`${tokens<50? 'bg-[#D97F9C]':'bg-[#3BD5C8]'} p-[2.125rem]  border-black opacity-75
                    [transform-style:preserve-3d] [transform:rotateX(2deg)_rotateY(-5deg)] mix-blend-difference flex items-center gap-[0.6rem] rotate-5 !clip-path-[polygon(0_12%,100%_0%,100%_100%,0_83%)]`} 
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseLeave}
                    onMouseEnter={handleMouseLeave}
                > 
                        <span className='font-mons text-[0.7rem]'>Tokens:</span> 
                        <span className='!text-[1rem]'>{tokens}</span>
                </div>
                <div className={`${!inFreeSpinMode? 'bg-[#D97F9C]':'bg-white'} p-[2.125rem]  border-black opacity-75
                    [transform-style:preserve-3d] [transform:rotateX(-5deg)_rotateY(-10deg)] mix-blend-difference flex items-center gap-[0.6rem] rotate-5 !clip-path-[polygon(0_12%,100%_0%,100%_100%,0_83%)]
                     ${inFreeSpinMode ? "animated-border" : ""}
                    `} 
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseLeave}
                    onMouseEnter={handleMouseLeave}
                > 
                        <span className='font-mons text-[0.7rem]'>Bonus Stage:</span> 
                        <span className='!text-[1rem]'>{bonusProgress} / 10</span>
                </div>
                <div className={`${!inFreeSpinMode? 'bg-[#D97F9C]':'bg-white'} p-[2.125rem]  border-black opacity-75
                    [transform-style:preserve-3d] [transform:rotateX(-5deg)_rotateY(-10deg)] mix-blend-difference flex items-center gap-[0.6rem] rotate-5 !clip-path-[polygon(0_12%,100%_0%,100%_100%,0_83%)]
                     ${inFreeSpinMode? "animated-border" : ""}
                    `} 
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseLeave}
                    onMouseEnter={handleMouseLeave}
                > 
                        <span className='font-mons text-[0.7rem]'>Bonus Left:</span> 
                        <span className='!text-[1rem]'>{freeSpinsRemaining}</span>
                </div>
                <div className={`${!inFreeSpinMode? 'bg-[#D97F9C]':'bg-white'} p-[2.125rem]  border-black opacity-75
                    [transform-style:preserve-3d] [transform:rotateX(-5deg)_rotateY(-10deg)] mix-blend-difference flex items-center gap-[0.6rem] rotate-5 !clip-path-[polygon(0_12%,100%_0%,100%_100%,0_83%)]
                     ${inFreeSpinMode? "animated-border" : ""}
                    `} 
                    onClick={runBonusAnimation}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseLeave}
                    onMouseEnter={handleMouseLeave}
                > 
                        <span className='font-mons text-[0.7rem]'>Test Bonus Button</span> 
                </div>
            </div>
       </div>
        
    </section>
  )
}

export default SlotMachine