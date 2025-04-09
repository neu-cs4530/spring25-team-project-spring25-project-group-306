import { useState, useEffect, useMemo } from 'react';
import { getKarmaByUsername } from '../services/userService';

/**
 * Custom hook to fetch karma for a list of usernames.
 * @param usernames - Array of unique usernames.
 * @returns A record mapping each username to their karma.
 */
const useFetchKarma = (usernames: string[]) => {
  const [karmaMap, setKarmaMap] = useState<Record<string, number>>({});
  const stableUsernames = useMemo(() => [...new Set(usernames)].sort(), [usernames]);

  useEffect(() => {
    if (stableUsernames.length === 0) return;

    /**
     * Fetch karma for each username and update the state.
     */
    const fetchKarma = async () => {
      const karmaResults = await Promise.allSettled(
        stableUsernames.map(async username => ({
          username,
          karma: await getKarmaByUsername(username),
        })),
      );

      const newKarmaMap: Record<string, number> = {};
      karmaResults.forEach(result => {
        if (result.status === 'fulfilled') {
          newKarmaMap[result.value.username] = result.value.karma;
        } else {
          const failedUsername = usernames[karmaResults.indexOf(result)];
          newKarmaMap[failedUsername] = 0;
        }
      });

      setKarmaMap(prevKarmaMap =>
        JSON.stringify(prevKarmaMap) !== JSON.stringify(newKarmaMap) ? newKarmaMap : prevKarmaMap,
      );
    };

    fetchKarma();
  }, [stableUsernames, usernames]);

  return karmaMap;
};

export default useFetchKarma;
