import BetDisplay from './bet-display';
import CompetitionDisplay from './competition-display';

const AdminPanel: React.FC = () => {
  return (
    <div className="space-y-8">
      <CompetitionDisplay />
      <BetDisplay />
    </div>
  );
};

export default AdminPanel; 