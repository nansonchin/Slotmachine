import React,{useRef,useEffect,useState} from 'react'
import { gsap } from "gsap";
import SlotMachine from './slotMachine';

const loading = ({onComplete,isClicked}) => {
    const sRef = useRef()
    const wordsRef=useRef(null)
    const lineLeft=useRef()
    const lineRight=useRef()
    const tlRef=useRef()
    const buttonStart = useRef();
    const rotateFrame= useRef()
    const wholeFrame=useRef();
    const loadingRef=useRef();
    const enterRef=useRef();
    const clickRef=useRef();
    const loadingBg=useRef();
    const [canClick, setCanClick] = useState(false);
    useEffect(() => {
        const bg = loadingBg.current;
        if (bg) {
            // best-effort start (muted autoplay is allowed on most browsers)
            bg.play().catch(() => { /* ignore - fallback handled later */ });
        }
    }, []);

    const fadeAudio = (audioEl, from, to, ms = 500) => {
        if (!audioEl) return;
        try {
            audioEl.volume = from;
            audioEl.muted = false; // unmute inside user gesture
        } catch (e) { /* ignore */ }

        const steps = 20;
        const stepTime = ms / steps;
        let step = 0;
        const id = setInterval(() => {
            step++;
            const v = from + ((to - from) * (step / steps));
            try { audioEl.volume = Math.max(0, Math.min(1, v)); } catch (e) {}
            if (step >= steps) clearInterval(id);
        }, stepTime);
    };

    useEffect(() => {
        fadeAudio(loadingBg.current, 1 /* start muted volume */, 1 /* target */, 600);
    }, []);

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

    const playAndWait =(audioEl,fallbackMs = 600)=>{
        return new Promise((resolve)=>{
            if(!audioEl) return resolve()
            
            let timer =null
            const onEnded=()=>{
                if(timer) clearTimeout(timer)
                resolve()
            }

            try{
                audioEl.currentTime=0
            }catch(e){
                console.log(e)
            }

            audioEl.addEventListener('ended',onEnded,{once:true})

            const playPromise = audioEl.play()

            const dur =(audioEl.duration && !isNaN(audioEl.duration) && audioEl.duration > 0)? Math.random(audioEl.duration * 1000)+100 :fallbackMs

            timer= setTimeout(()=>{
                audioEl.removeEventListener('ended',onEnded)
                resolve()
            },dur)

            if(playPromise && typeof playPromise.catch ==='function'){
                playPromise.catch((err)=>{
                    clearTimeout(timer)
                    audioEl.removeEventListener('ended',onEnded)
                    resolve()
                })
            }

        })
    }
   const handleClicked = (e) => {
    if (!canClick) return;
    // prevent double clicks
    setCanClick(false);

    const clickEl = clickRef.current;
    const enterEl = enterRef.current;

    // play click sound synchronously (directly in the user event)
    if (clickEl) {
        try {
            clickEl.currentTime = 0;
            const playPromise = clickEl.play();

            // Setup a one-time end handler or fallback timeout
            let fallbackTimer = null;
            const onClickEnded = () => {
                clearTimeout(fallbackTimer);
                clickEl.removeEventListener('ended', onClickEnded);
                // now play enter sound and start animations together
                if (enterEl) {
                    try { enterEl.currentTime = 0; enterEl.play().catch(()=>{}); } 
                    catch (err) { console.warn('enter play issue', err); }
                }
                startExitAnimation(); // function that starts the gsap timeline tl2
            };
            clickEl.addEventListener('ended', onClickEnded, { once: true });

            // fallback in case ended event doesn't fire or duration unknown (ms)
            fallbackTimer = setTimeout(() => {
                clickEl.removeEventListener('ended', onClickEnded);
                if (enterEl) {
                    try { enterEl.currentTime = 0; enterEl.play().catch(()=>{}); }
                    catch (err) {}
                }
                startExitAnimation();
            }, 400); // adjust to your click clip length

            // handle play() rejection (shouldn't happen since it's user gesture, but be safe)
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch((err) => {
                // couldn't play — proceed anyway so the UI doesn't hang
                clearTimeout(fallbackTimer);
                clickEl.removeEventListener('ended', onClickEnded);
                if (enterEl) {
                    try { enterEl.currentTime = 0; enterEl.play().catch(()=>{}); }
                    catch (err) {}
                }
                startExitAnimation();
                });
            }
            } catch (err) {
            console.warn('click sound play failed', err);
            // still start animation if playing fails
            if (enterEl) {
                try { enterEl.currentTime = 0; enterEl.play().catch(()=>{}); }
                catch (err) {}
            }
            startExitAnimation();
            }
        } else {
            // no click audio element — simply start animation immediately
            if (enterEl) {
                try { enterEl.currentTime = 0; enterEl.play().catch(()=>{}); } catch(e){}
            }
            startExitAnimation();
        }
    }

    const startExitAnimation=()=>{
                const tl2=gsap.timeline({
           onComplete: () => {
                if (isClicked) isClicked();
                if (onComplete) onComplete(); // ✅ tell parent we are done
                if (loadingRef.current) {
                    loadingRef.current.style.display = "none";
                }
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
    }
        
  return (
    <div className='relative'>
        <section>
            <audio id="bg-audio" ref={enterRef}>
                <source  src="src/assets/sound/enter.mp3"  type="audio/mpeg" preload="auto"/>
            </audio>
            <audio id="bg-audio" ref={clickRef}>
                <source  src="src/assets/sound/click.mp3"  type="audio/mpeg" preload="auto"/>
            </audio>
            <audio
                ref={loadingBg}
                src="src/assets/sound/loadingBg.mp3"
                preload="auto"
                autoPlay
                loop
                muted
                playsInline
            />
        </section>
        <div ref={loadingRef} className='absolute z-60'>
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
        {/* <div className='relative' style={{}}>
            <SlotMachine/>
        </div> */}
    </div>
    
  )
}

export default loading