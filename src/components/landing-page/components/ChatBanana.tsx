import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function ChatBanana() {
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  
  const toggleSpeechBubble = () => setShowSpeechBubble(!showSpeechBubble);

  const chatBananaRef = useRef(null);

  useGSAP(() => {
    gsap.timeline({ repeat: -1, delay: 5, repeatDelay: 5 })
      .to(chatBananaRef.current, {
        y: -30,
        rotation: 5,
        duration: 0.5,
        ease: "power2.out"
      })
      .to(chatBananaRef.current, {
        y: 10,
        rotation: 0,
        duration: 2,
        ease: "bounce.out"
      });
  });

  return (
    <div className="chatBananaWrapper">
      <button
        className={`no-style chatBanana ${showSpeechBubble ? "active" : ""}`}
        onClick={toggleSpeechBubble}
      >
        <img
          src="/landing-page/images/chat-banana.png"
          alt="Chat Banana"
          width={171}
          height={166}
          ref={chatBananaRef}
        />
      </button>
      {showSpeechBubble && (
        <div className="speechBubble">
          <p>
            Would you like more bananas?
          </p>
        </div>
      )}
    </div>
  );
} 