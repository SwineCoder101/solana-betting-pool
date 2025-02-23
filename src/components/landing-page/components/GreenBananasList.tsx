import greenBananaListStyles from "../../../sass/greenBananaList.module.scss";
import { SparkleImages } from "./SparkleImages";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Banana {
  username: string;
  gang: string;
  createdAt: string;
}

export default function GreenBananasList() {
  const [bananas, setBananas] = useState<Banana[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to fetch data from the API
  const fetchBananas = async () => {
    try {
      const response = await fetch("https://mini.bananazone.app/api/user/all-users");
      const resp = await response.json();
      const data: Banana[] = resp.data;

      if (data && Array.isArray(data)) {
        const latestUsers = data
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3); // Taking the latest 3 users

        setBananas((prevBananas) => [
          ...latestUsers.map((user) => ({
            username: user.username,
            gang: user.gang,
            createdAt: user.createdAt,
          })),
          ...prevBananas.slice(latestUsers.length),
        ]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Fetch data at intervals
  useEffect(() => {
    fetchBananas(); // Initial fetch

    intervalRef.current = setInterval(() => {
      fetchBananas();
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useGSAP(() => {
    gsap.timeline({ repeat: -1, repeatDelay: 3 })
      .set(".greenBananasList li:first-child", { background: "linear-gradient(180deg, #85FF3F 0%, #85FF3F 100%)" }, 0)
      .set(".greenBananasList li:first-child", { background: "linear-gradient(180deg, #BDF55A 0%, #BDF55A 100%)" }, 0.1)
      .to(".greenBananasList li:first-child", { x: 20, duration: 0.1, ease: "power2.inOut", repeat: 3 }, 0)
      .to(".greenBananasList li:first-child", { x: -20, duration: 0.1, ease: "power2.inOut", repeat: 3 })
      .set(".greenBananasList li:first-child", { background: "linear-gradient(180deg, #FDDE51 0%, #DE8749 100%)" });
  });

  return (
    <ul className={greenBananaListStyles.greenBananasList}>
      {bananas.map((banana, index) => {
        const secondsDiff = dayjs().diff(dayjs(banana.createdAt), "second");

        return (
          <li key={index}>
            <div className={greenBananaListStyles.profile}>
              <img
                src="/landing-page/images/banana-icon.png"
                alt="Banana Icon"
                width={30}
                height={30}
              />
              <h4>
                {banana.username}{" "}
                <em>
                  <span>{banana.gang}</span> Banana Gang
                </em>
              </h4>
            </div>
            <h4 className={greenBananaListStyles.time}>
              {secondsDiff < 20
                ? "Just now"
                : secondsDiff < 60
                ? `${secondsDiff}s ago`
                : `${Math.floor(secondsDiff / 60)}m ago`}
            </h4>
            {index === 0 && <SparkleImages />}
          </li>
        );
      })}
    </ul>
  );
}
