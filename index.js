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

// 🔥 style (no line sa title, line sa end lang)
function buildMessage(title, body, footer) {
  const components = [
    new TextDisplayBuilder().setContent(title),
    new TextDisplayBuilder().setContent(body)
  ];

  if (footer) {
    components.push(
      new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(SeparatorSpacingSize.Small),

      new TextDisplayBuilder().setContent(footer)
    );
  }

  return {
    flags: MessageFlags.IsComponentsV2,
    components
  };
}

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // 🔥 IMPORTANT: use GUILD ONLY para walang duplicate
  await client.application.commands.set([
    new SlashCommandBuilder()
      .setName("pl")
      .setDescription("send pricelist")
      .toJSON()
  ], process.env.GUILD_ID);

  console.log("Command /pl registered (guild only).");
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
