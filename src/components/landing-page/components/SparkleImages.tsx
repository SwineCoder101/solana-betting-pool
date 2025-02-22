import greenBananaListStyles from "../../../sass/greenBananaList.module.scss";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function SparkleImages() {
  useGSAP(() => {
    // Create function to generate random positions
    const getRandomPositions = () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      scale: 0.8 + Math.random() * 0.8,
    });

    // Get all sparkle images
    const sparkleElements = document.querySelectorAll(`.${greenBananaListStyles.greenBananasList} li:first-child .${greenBananaListStyles.sparkle}`);
    
    sparkleElements.forEach((el, index) => {
      // Set initial random position for each sparkle
      const initialPos = getRandomPositions();
      const startDelay = index * 0.5; // 0.4 seconds between each sparkle
      
      gsap.set(el, { ...initialPos, opacity: 0, scale: 0 });

      // Create timeline for each sparkle
      gsap.timeline({ repeat: -1, delay: startDelay })
        .to(el, {
          opacity: 1,
          scale: initialPos.scale,
          duration: 1,
          ease: "power1.inOut",
          yoyo: true,
          repeat: 1,
          onComplete: function() {
            // Only update position when opacity is 0
            const newPos = getRandomPositions();
            gsap.set(el, { ...newPos, opacity: 0, scale: 0 });
            // Restart the timeline
            this.restart();
          }
        });
    });
  }, []);
  
  return (
    <>
      {[...Array(5)].map((_, index) => (
        <img
          key={index}
          src="/landing-page/images/sparkle.png"
          alt="Sparkle"
          width={28}
          height={28}
          className={greenBananaListStyles.sparkle}
        />
      ))}
    </>
  );
} 