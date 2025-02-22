import leaderboardTableStyles from "../../../sass/leaderboardTable.module.scss";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useQuery } from '@tanstack/react-query'


const goldBananasTotal = 50000; // Total prize pool

const distributePrizes = (users: any) => {
  if (!users?.length) return [];

  // Sort users by invite count (highest first)
  const sortedUsers = [...users].sort((a, b) => b.inviteCount - a.inviteCount);

  // Define percentage distribution for the top 10
  const top10Percentages = [25, 20, 15, 10, 8, 7, 6, 5, 3, 1]; // Sum = 100%
  let totalTop10Prize = goldBananasTotal * 0.75; // 75% of the pool for top 10
  let remainingPrize = goldBananasTotal * 0.25; // 25% for others

  let leaderboardData = sortedUsers.map((entry, index) => {
    let prize = 0;

    if (index < 10) {
      // Assign gold bananas based on the percentage allocation
      prize = Math.floor((top10Percentages[index] / 100) * totalTop10Prize);
    } else {
      // Distribute remaining bananas proportionally
      let totalRemainingInvites = sortedUsers.slice(10).reduce((sum, user) => sum + user.inviteCount, 0);
      if (totalRemainingInvites > 0) {
        prize = Math.floor((entry.inviteCount / totalRemainingInvites) * remainingPrize);
      }
    }

    return {
      image: "/landing-page/images/banana-icon.png",
      name: `@${entry.user.firstName}`,
      bananaGang: `${entry.user.firstName} Team`,
      goldBananas: prize.toLocaleString(),
    };
  });

  return leaderboardData;
};



const LeaderboardTable = () => {
  // Sample JSON data - you can move this to a separate file or fetch it from an API

  // Fetch data and apply the prize distribution
  const { status, data: leaderboard, error, isFetching } = useGetLeaders();
  const leaderboardData = leaderboard?.data ? distributePrizes(leaderboard.data) : [];
  
  useGSAP(() => {
    gsap.timeline({ repeat: -1, delay: 1.8, repeatDelay: 3 })
      .set(`.${leaderboardTableStyles.table} tbody tr:first-child`, {
        className: `${leaderboardTableStyles.yellowHighlight}`
      }, 0)
      .set(`.${leaderboardTableStyles.table} tbody tr:first-child`, {
        className: `${leaderboardTableStyles.yellowHighlight2}`
      }, 0.1)
      .set(`.${leaderboardTableStyles.table} tbody tr:first-child`, {
        className: `${leaderboardTableStyles.yellowHighlight}`
      },0.2)
      .set(`.${leaderboardTableStyles.table} tbody tr:first-child`, {
        className: `${leaderboardTableStyles.yellowHighlight2}`
      },0.3)
      .to(`.${leaderboardTableStyles.table} tbody tr:first-child`, {
        x: -20,
        duration: 0.1,
        ease: "power2.inOut",
        repeat: 3
      }, 0)
      .to(`.${leaderboardTableStyles.table} tbody tr:first-child`, {
        x: 20,
        duration: 0.1,
        ease: "power2.inOut",
        repeat: 3
      })
      .set(`.${leaderboardTableStyles.table} tbody tr:first-child`, {
        className: `${leaderboardTableStyles.yellowHighlight}`
      },0.4)
      .set(`.${leaderboardTableStyles.table} tbody tr:first-child`, {
        className: `${leaderboardTableStyles.yellowHighlight2}`
      },0.5)
      .set(`.${leaderboardTableStyles.table} tbody tr:first-child`, {
        className: `${leaderboardTableStyles.yellowHighlight}`
      },0.6)
      .to(`.${leaderboardTableStyles.table} tbody tr:first-child`, {
        x: 0,
        duration: 0.1,
        ease: "power2.inOut",
        repeat: 3
      })
      .set(`.${leaderboardTableStyles.table} tbody tr:first-child`, {
        className: `${leaderboardTableStyles.yellowHighlight2}`
      },0.7)
      .set(`.${leaderboardTableStyles.table} tbody tr:first-child`, {
        className: ''
      })
  }, [leaderboardData]);

  return (
    <div className={leaderboardTableStyles.tableWrapper}>
      <table className={leaderboardTableStyles.table}>
        <thead>
          <tr>
            <th><h3>Rank</h3></th>
            <th><h3>Name</h3></th>
            <th><h3>Banana Gang</h3></th>
            <th><h3><span>Gold Bananas</span></h3></th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                <img
                  src={item.image}
                  alt="Profile Image"
                  width={30}
                  height={30}
                  className="profileImg"
                />
                <span className="profileName">{item.name}</span>
              </td>
              <td>{item.bananaGang}</td>
              <td>{item.goldBananas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable; 


function useGetLeaders() {
  return useQuery({
    queryKey: ['getLeaders'],
    queryFn: async () => {
      const response = await fetch('https://mini.bananazone.app/api/user/leaderboards');
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaders');
      }

      return response.json();
    },
  });
}
