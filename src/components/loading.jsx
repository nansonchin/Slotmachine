import React,{useRef,useEffect} from 'react'
import { gsap } from "gsap";

const loading = ({onComplete}) => {
    const sRef = useRef()
    const wordsRef=useRef(null)
    const lineLeft=useRef()
    const lineRight=useRef()
    const tlRef=useRef()

    useEffect(()=>{
        const tl=gsap.timeline({
            onComplete: () => {
                if (onComplete) onComplete()
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

    tl.from(lineLeft.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
        rotation:90
        })
        .from(lineRight.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
        rotation:90,
        }, "<").to(lineLeft.current,{
            opacity:1,
            rotation:90,
        }).to(lineRight.current,{
            opacity:1,
            rotation:90,
        },"<").to(lineLeft.current,{
            rotation:0,
        }).to(lineRight.current,{
            rotation:0,
        },"<")
    
    tl.to([sRef.current,wordsRef.current.children,lineLeft.current,lineRight.current],{
        duration:0.3,
        opacity:0,
    })
        
    return () => {
      tl.kill();
      tlRef.current = null;
    };
  }, [onComplete]);
  return (
    <div className='loading-background flex items-center justify-center min-h-screen overflow-hidden'>
        <div className='flex'>
            <div ref={lineLeft} className='bg-black h-[0.2rem] z-2 relative  min-w-screnn'></div>
            <div ref={lineRight} className='bg-black h-[0.2rem] z-2 relative min-w-screen'></div>
        </div>
        
        <div className='flex gap-[0.5rem] center-box '>
            <div ref={sRef}>
                <p className='text-[8rem] leading-none font-mons'>S</p>
            </div>
            <div ref={wordsRef} className=''>
                <p className='text-[4rem] leading-none font-arse'>lot</p>
                <p className='text-[4rem] leading-none font-arse'>Machine</p>
            </div>
        </div>
    </div>
  )
}

export default loading