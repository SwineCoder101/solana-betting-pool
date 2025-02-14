export interface PoolData {
    poolKey: string;
    startTime: number; // Unix timestamp when this pool starts
  }
  
  export interface CompetitionPool {
    competitionKey: string;
    startTime: number; // Competition start time (Unix timestamp)
    endTime: number;   // Competition end time (Unix timestamp)
    pools: PoolData[];
  }
  
  export class CompetitionPools {
    private competitions: Map<string, CompetitionPool>;
  
    constructor(competitions: CompetitionPool[]) {
      this.competitions = new Map();
      competitions.forEach((competition) => {
        this.competitions.set(competition.competitionKey, competition);
      });
    }
  
    /**
     * Returns all pools for the given competition key.
     * @param competitionKey The competition's public key/identifier.
     */
    public getPools(competitionKey: string): PoolData[] | null {
      const competition = this.competitions.get(competitionKey);
      return competition ? competition.pools : null;
    }
  
    /**
     * Optionally you can have a method to get the entire competition data.
     */
    public getCompetition(competitionKey: string): CompetitionPool | null {
      return this.competitions.get(competitionKey) ?? null;
    }
  } 