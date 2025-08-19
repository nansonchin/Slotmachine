import React,{useRef,useEffect,useState} from 'react'
import { gsap } from "gsap";
// import SlotMachine from './slotMachine';

const loading = ({onComplete,isClicked}) => {
    const sRef = useRef()
    const wordsRef=useRef(null)
    const lineLeft=useRef()
    const lineRight=useRef()
    const tlRef=useRef()
    const buttonStart = useRef();
    const rotateFrame= useRef()
    const wholeFrame=useRef();
    const [canClick, setCanClick] = useState(false);
    
    useEffect(()=>{
        const tl=gsap.timeline({
            onComplete: () => {
                setCanClick(true);
            }
        })
        tlRef.current=tl
           
    tl.from(sRef.current,{
      y: -200,         
      opacity: 0,
      duration: 0.6,
      ease: "bounce.out"
    }).to(sRef.current,{
        y:0,
        opacity:1,
    });

    tl.from(wordsRef.current.children,{
        x:-16,
        opacity:0,
        duration:0.8,
        ease:'power2.out'
    },"-=1.5").to(wordsRef.current.children,{
            x:0,
            opacity:1
       }
    )

    tl.from(wholeFrame.current,{
        backgroundColor:'#fff'
    }).from(rotateFrame.current,{
        opacity:1,
        rotate:90,
        duration:0.3,
        ease:'power2.inOut',
    }).from([lineLeft.current,lineRight.current],{
        opacity:0,
        duration:0.3,
        ease: "power2.inOut",
    }).to([lineLeft.current,lineRight.current],{
        opacity:1,
    }).to(rotateFrame.current,{
        rotate:0,
        ease:'power1.inOut'
    }).to(lineLeft.current,{
        backgroundColor:'#000',
        borderBottom:'2px solid #fff',
        duration:0.3,
    }).to(lineRight.current,{
        backgroundColor:'#000',
        borderTop:'2px solid #fff',
        duration:0.3,
    },'<').to([sRef.current,wordsRef.current.children],{
        color:'#fff'
    },'<').to(buttonStart.current,{
        opacity: 1,
        duration:0.3,
        ease:'power1.inOut',
        color:'#fff'
    })
    
    return () => {
      tl.kill();
      tlRef.current = null;
    };
  }, [onComplete]);

   const handleClicked = () => {
        if (!canClick) return; // ❌ ignore clicks before animation finished
        const tl2=gsap.timeline({
           onComplete: () => {
                if (isClicked) isClicked();
                if (onComplete) onComplete(); // ✅ tell parent we are done
            }
        })
        tlRef.current=tl2

        tl2.to([lineLeft.current],{
            yPercent: -100,
            duration:0.7,
            ease:'power1.inOut'
        }).to([lineRight.current],{
            yPercent: 100, 
            duration:0.7,
            ease:'power1.inOut'
        },"<").to(buttonStart.current,{
            duration:0.3,
            ease:'power1.inOut',
            opacity:0,
        },"<").to([sRef.current, wordsRef.current.children],{
             scale: 2,         // grow bigger
            z: 200,           // push out on z-axis (needs perspective on parent)
            opacity: 0,       // fade out
            duration: 0.4,
            ease: 'power2.in',
            stagger: 0.03
        },"<").to(wholeFrame.current,{
            opacity:0,
            duration:0.9,
            ease:'power1.inOut'
        },"<");
        
    };
        
  return (
    <div className='relative'>
        <div className='absolute z-60'>
            <div ref={wholeFrame} className='loading-background flex items-center justify-center min-h-screen overflow-hidden z-50'>
                <div ref={rotateFrame} className=' absolute'>
                    <div className='flex flex-col'>
                        <div ref={lineLeft} className='h-[50vh] border-b-2 border-black min-w-screen top-0 z-2  right-0 top-0 '></div>
                        <div ref={lineRight} className='h-[50vh] border-t-2 border-black  min-w-screen  z-2  left-0 bottom-0'></div>
                    </div>
                </div>
            
                <div className='relative z-9999'>
                    <div className='flex gap-[0.7rem]'>
                        <div ref={sRef}>
                            <p className='text-[8rem] leading-none font-mons'>S</p>
                        </div>
                        <div ref={wordsRef} className=''>
                            <p className='text-[4rem] leading-none font-arse'>lot</p>
                            <p className='text-[4rem] leading-none font-arse'>Machine</p>
                        </div>
                    </div>
                    <div ref={buttonStart} onClick={handleClicked} className='w-full py-[2rem] cursor-pointer opacity-0'>
                        <p className='text-center text-[18px] '>Click anywhere to start</p>
                    </div>
                </div>
            </div>
        </div>
        {/* <div className='relative z-30'>
            <SlotMachine/>
        </div> */}
    </div>
    
  )
}

export default loading