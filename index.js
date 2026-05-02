require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  MessageFlags,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SlashCommandBuilder
} = require("discord.js");

const { pricelists } = require("./pricelists");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function buildMessage(title, body, footer) {
  const components = [
    new TextDisplayBuilder().setContent(title),
    new TextDisplayBuilder().setContent(body)
  ];

  if (footer) {
    components.push(
      new TextDisplayBuilder().setContent(footer),

      // line AFTER xoxo / footer
      new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(SeparatorSpacingSize.Small)
    );
  }

  return {
    flags: MessageFlags.IsComponentsV2,
    components
  };
}

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // delete global commands para mawala duplicate /pl
  await client.application.commands.set([]);

  // register guild-only /pl
  await client.application.commands.set([
    new SlashCommandBuilder()
      .setName("pl")
      .setDescription("send pricelist")
      .toJSON()
  ], process.env.GUILD_ID);

  console.log("Command /pl fixed.");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "pl") return;

  try {
    await interaction.deferReply({ ephemeral: true });

    for (const item of pricelists) {
      await interaction.channel.send(
        buildMessage(item.title, item.body, item.footer)
      );

      await wait(1500);
    }

    await interaction.deleteReply();
  } catch (error) {
    console.error(error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "May error sa bot.",
        ephemeral: true
      });
    }
  }
});

client.login(process.env.TOKEN);
