import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Discord, Guard, Slash, SlashChoice, SlashOption } from "discordx";
import { injectable } from "tsyringe";
import { GetMonthlyStatsUseCase } from "../useCases/GetMonthlyStatsUseCase.js";
import { InteractionExceptionHandler } from "../helpers/InteractionExceptionHandler.js";
import dayjs from "dayjs";

@Discord()
@Guard(InteractionExceptionHandler(true))
@injectable()
export class GetWorkStatsCommand {
  constructor(private getWorkStatsUseCase: GetMonthlyStatsUseCase) {}

  @Slash({
    name: "monthlystats-work",
    description: "Get your monthly work statistics",
  })
  async handle(
    @SlashChoice(
      { name: "January", value: 0 },
      { name: "February", value: 1 },
      { name: "March", value: 2 },
      { name: "April", value: 3 },
      { name: "May", value: 4 },
      { name: "June", value: 5 },
      { name: "July", value: 6 },
      { name: "August", value: 7 },
      { name: "September", value: 8 },
      { name: "October", value: 9 },
      { name: "November", value: 10 },
      { name: "December", value: 11 }
    )
    @SlashOption({
      name: "month",
      description: "month to get the stats from",
      required: false,
      type: ApplicationCommandOptionType.Integer,
    })
    month: number = dayjs().month(),

    interaction: CommandInteraction
  ) {
    const { timeWorked, salary } = await this.getWorkStatsUseCase.execute({
      discordUserId: interaction.user.id,
      month,
    });

    const hoursWorkedEmbed = new EmbedBuilder()
      .setTitle(`Work statistics - ${dayjs().month(month).format("MMMM")}`)
      .setDescription(`Hey! Looking for some monthly work statistics?`)
      .setColor("#fe9b69")
      .addFields({
        name: "Hours worked:",
        value: timeWorked,
        inline: true,
      })
      .addFields({
        name: "Your salary:",
        value: `R$ ${salary}`,
        inline: true,
      });

    await interaction.followUp({
      embeds: [hoursWorkedEmbed],
    });
  }
}
