import { createStaleWhileRevalidateCache } from "stale-while-revalidate-cache";
import { client } from "../clients/clickup.js";
import { Exception } from "../helpers/Exception.js";
import Fuse from "fuse.js";

const cache = new Map();
const swr = createStaleWhileRevalidateCache({
  storage: {
    getItem(key) {
      return cache.get(key);
    },
    setItem(key, value) {
      cache.set(key, value);
    },
    removeItem(key) {
      cache.delete(key);
    },
  },
});

export type SearchMembersByTeamUseCaseInput = {
  teamId: string;
  query: string;
};

export class SearchMembersByTeamUseCase {
  async execute({ query, teamId }: SearchMembersByTeamUseCaseInput) {
    const members = await swr(
      "clickup-members",
      async () => {
        const teams = await client.team.getCurrentUserTeams();

        const team = teams.find((team) => team.id === teamId);

        if (!team) {
          throw new Exception("Team not found", "team_not_found");
        }

        return team.members;
      },
      { minTimeToStale: 60 * 1000 }
    );

    const fuse = new Fuse(members.value, {
      keys: ["username"],
    });

    const results = fuse.search(query, {
      limit: 5,
    });

    return results;
  }
}
