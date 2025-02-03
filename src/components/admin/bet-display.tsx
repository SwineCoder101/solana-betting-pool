import { useAllBets } from "@/hooks/queries";

const BetDisplay: React.FC = () => {
  const { data: bets, isLoading, error } = useAllBets();

  if (isLoading) {
    return <div>Loading bets...</div>;
  }
  
  if (error) {
    console.error("Error loading bets:", error);
    return <div>Error loading bets</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Live Bets</h2>
      <div className="p-4 bg-gray-100">
        {bets?.map((bet) => (
          <div key={bet.publicKey}>{bet.user}</div>
        ))}
      </div>
    </div>
  )
}
  
export default BetDisplay;