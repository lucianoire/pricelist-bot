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

    // real gray line
    new SeparatorBuilder()
      .setDivider(true)
      .setSpacing(SeparatorSpacingSize.Small),

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

  // clear old commands like /p
  await client.application.commands.set([]);

  // register /pl
  await client.application.commands.set([
    new SlashCommandBuilder()
      .setName("pl")
      .setDescription("send pricelist")
      .toJSON()
  ]);

  console.log("Command /pl registered.");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "pl") return;

  try {
    // hidden reply para hindi mag-timeout
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
