import tvDisplayStyles from "../../../sass/tvDisplay.module.scss";

export default function TvDisplay() {
  return (
    <div className={tvDisplayStyles.tvContainer}>
      <img
        src="/landing-page/images/tv-frame.png"
        alt="TV Frame"
        width={401}
        height={385}
      />
      <video autoPlay={true} muted loop>
        <source
          src="/landing-page/videos/banana-tv-resize-video.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
} 