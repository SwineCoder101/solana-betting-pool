import greenBananaListStyles from "../../../sass/greenBananaList.module.scss";
import {SparkleImages} from "./SparkleImages";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const randomNames = [];
export default function GreenBananasList() {

  const [bananas, setBananas] = useState([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  const intervalRef = useRef(null);

  // Function to fetch data from the API
  const fetchBananas = async () => {
    try {
      const response = await fetch("https://mini.bananazone.app/api/user/all-users"); // Replace with actual API endpoint
      const resp = await response.json();
      const data = resp.data;
      if (data && Array.isArray(data)) {
        // Sort by latest createdAt and take the last 3 users
        const latestUsers = data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt) )
          .slice(0, 1);
  
          setBananas((prevBananas) => [
           
         ...latestUsers.map(user => ({
            username: user.username,
            gang: user.gang,
            time: user.createdAt
          })),
          ...prevBananas.slice(1)
          
          
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
    }, 5000); // Fetch every 5 sec

    return () => clearInterval(intervalRef.current); // Cleanup
  }, []);



  // // Add random users if no new data arrives
  // useEffect(() => {
  //   if (intervalRef.current) {
  //     clearInterval(intervalRef.current);
  //   }

  //   intervalRef.current = setInterval(() => {
  //     setBananas((prevBananas) => {
  //       if (prevBananas.length === 0) return prevBananas;

  //       const now = Date.now();
  //       const lastUserTime = new Date(prevBananas[prevBananas.length - 1].time).getTime();
  //       const diffSeconds = (now - lastUserTime) / 1000;

  //       if (diffSeconds >= 5) {
  //         const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
  //         console.log("Adding random user:", randomName);

  //         return prevBananas.length > 3
  //           ? [ ...prevBananas.slice(1), { username: randomName, gang: "Invited by Federick", time: new Date().toISOString() }]
  //           : [ { username: randomName, gang: "Invited by @Federick", time: new Date().toISOString() }, ...prevBananas];
  //       }

  //       return prevBananas;
  //     });
  //   }, 5000);

  //   return () => clearInterval(intervalRef.current);
  // }, []);

  
  useGSAP(() => {
    gsap.timeline({ repeat: -1, repeatDelay: 3 })
      .set(`.greenBananasList li:first-child`, {
        background: "linear-gradient(180deg, #85FF3F 0%, #85FF3F 100%)",
      }, 0)
      .set(`.greenBananasList li:first-child`, {
        background: "linear-gradient(180deg, #BDF55A 0%, #BDF55A 100%)",
      }, 0.1)
      .set(`.greenBananasList li:first-child`, {
        background: "linear-gradient(180deg, #85FF3F 0%, #85FF3F 100%)",
      }, 0.2)
      .set(`.greenBananasList li:first-child`, {
        background: "linear-gradient(180deg, #BDF55A 0%, #BDF55A 100%)",
      }, 0.3)
      .to(`.greenBananasList li:first-child`, {
        x: 20,
        duration: 0.1,
        ease: "power2.inOut",
        repeat: 3
      }, 0)
      .to(`.greenBananasList li:first-child`, {
        x: -20,
        duration: 0.1,
        ease: "power2.inOut",
        repeat: 3
      })
      .set(`.greenBananasList li:first-child`, {
        background: "linear-gradient(180deg, #85FF3F 0%, #85FF3F 100%)",
      }, 0.4)
      .set(`.greenBananasList li:first-child`, {
        background: "linear-gradient(180deg, #BDF55A 0%, #BDF55A 100%)",
      }, 0.5)
      .set(`.greenBananasList li:first-child`, {
        background: "linear-gradient(180deg, #85FF3F 0%, #85FF3F 100%)",
      }, 0.6)
      .to(`.greenBananasList li:first-child`, {
        x: 0,
        duration: 0.1,
        ease: "power2.inOut",
        repeat: 3
      })
      .set(`greenBananasList li:first-child`, {
        background: "linear-gradient(180deg, #FDDE51 0%, #DE8749 100%)"
      });
  });

 // 🔄 Force re-render every 10 seconds
 useEffect(() => {
  const interval = setInterval(() => {
    setForceUpdate((prev) => prev + 1);
  }, 10000); // Runs every 10 sec

  return () => clearInterval(interval);
}, []);


  // Force re-render every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setForceUpdate((prev) => prev + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
    <ul className={greenBananaListStyles.greenBananasList}>
      {bananas.map((banana, index) => {
    const createdAtDayjs = dayjs(banana.createdAt);
    const secondsDiff = dayjs().diff(banana.createdAt, "second");
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
      )
      })}
    </ul>
    </>
  );
};
