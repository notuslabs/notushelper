import { Discord } from "discordx";
import { injectable } from "tsyringe";

@Discord()
@injectable()
export class GetDailyStatsUseCase {
  async execute() {}
}
