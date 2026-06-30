import type { OddsSnapshot } from "@/lib/domain/football";
import type { OddsProvider } from "@/lib/providers/odds-provider";

type HttpOddsProviderOptions = {
  baseUrl: string;
  apiKey: string;
};

export class HttpOddsProvider implements OddsProvider {
  constructor(private readonly options: HttpOddsProviderOptions) {}

  async getMatchOdds(matchId: string) {
    const url = new URL(`/matches/${matchId}/odds`, this.options.baseUrl);
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        Accept: "application/json"
      },
      next: { revalidate: 45 }
    });

    if (!response.ok) {
      throw new Error(`Odds provider failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<OddsSnapshot[]>;
  }
}
