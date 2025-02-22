import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function WordArt() {
  let currentNum = 1;  // Initialize counter

  useGSAP(() => {
    const animateWordArt = () => {
      const element = `.wordArt-${currentNum}`;
      
      // Determine direction based on element number
      const isEven = currentNum % 2 === 0;
      
      // Set starting and ending positions using left/right and translateX
      if (isEven) {
        gsap.fromTo(element,
          { 
            right: "0%",
            x: "100%"
          },
          {
            right: "100%",
            x: "-100%",
            duration: 10,
            ease: "steps(100)",
            onComplete: () => {
              gsap.set(element, { 
                right: "0%",
                x: "100%"
              });
              // Increment counter, reset to 1 if we've reached 5
              currentNum = currentNum === 5 ? 1 : currentNum + 1;
            }
          }
        );
      } else {
        gsap.fromTo(element,
          { 
            left: "0%",
            x: "-100%"
          },
          {
            left: "100%",
            x: "100%",
            duration: 10,
            ease: "steps(100)",
            onComplete: () => {
              gsap.set(element, { 
                left: "0%",
                x: "-100%"
              });
              // Increment counter, reset to 1 if we've reached 5
              currentNum = currentNum === 5 ? 1 : currentNum + 1;
            }
          }
        );
      }
    };

    // Run animation every 18 seconds
    const interval = setInterval(animateWordArt, 16000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <img 
        className="wordArt wordArt-1" 
        src="/landing-page/images/word-art-1.png" 
        alt="Banana Zone Text" 
        width={580} 
        height={83} 
      />
      <img 
        className="wordArt wordArt-2" 
        src="/landing-page/images/word-art-2.png" 
        alt="Banana Zone Text" 
        width={659} 
        height={136.6} 
      />
      <img 
        className="wordArt wordArt-3" 
        src="/landing-page/images/word-art-3.png" 
        alt="Banana Zone Text" 
        width={587} 
        height={253.09} 
      />
      <img 
        className="wordArt wordArt-4" 
        src="/landing-page/images/word-art-4.png" 
        alt="Banana Zone Text" 
        width={674} 
        height={165} 
      />
      <img 
        className="wordArt wordArt-5" 
        src="/landing-page/images/word-art-5.png" 
        alt="Banana Zone Text" 
        width={674} 
        height={122} 
      />
    </>
  );
} 