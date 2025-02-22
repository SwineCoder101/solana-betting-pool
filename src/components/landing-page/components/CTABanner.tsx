import ctaBannerStyles from "../../../sass/ctaBanner.module.scss";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";


export default function CTABanner({ isMobile }: any) {
  const moreBananasRef = useRef(null);
  const starRef = useRef(null);
  const displayClass = isMobile ? "d-block d-md-none" : "d-none d-md-block";

  useGSAP(() => {
    gsap.to(moreBananasRef.current, {
      rotation: 5,
      duration: 0.7,
      repeat: -1,
      yoyo: true,
      ease: "steps(6)",
    });

    gsap.to(starRef.current, {
      scale: 1.1,
      duration: 0.7,
      repeat: -1,
      yoyo: true,
      ease: "steps(6)",
    });
  }, []);

  return (
    <div className={`${displayClass} ${ctaBannerStyles.ctaBanner}`}>
      <h3 className="yellowStroke">More Invites Means...</h3>
      <img
        src="/landing-page/images/banana-men.png"
        alt="Two men dressed as bananas"
        width={315}
        height={155}
        className={ctaBannerStyles.bananaMen}
      />
      <img
        src="/landing-page/images/more-bananas-text.png"
        alt="More bananas"
        width={474}
        height={120}
        className={ctaBannerStyles.moreBananasText}
        ref={moreBananasRef}
      />
      <img
        src="/landing-page/images/star.png"
        alt="star with 13 points"
        width={153}
        height={153}
        className={ctaBannerStyles.star}
        ref={starRef}
      />
    </div>
  );
} 