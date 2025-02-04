import BetDisplay from './bet-display';
import CompetitionDisplay from './competition-display';
import PoolDisplay from './pool-display';

const AdminPanel: React.FC = () => {
  return (
    <div className="space-y-8">
      <CompetitionDisplay />
      <PoolDisplay />
      <BetDisplay />
    </div>
  );
};

export default AdminPanel; 