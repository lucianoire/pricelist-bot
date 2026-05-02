require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  MessageFlags,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");

const { pricelists } = require("./pricelists");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function build(title, body, footer) {
  const components = [
    new TextDisplayBuilder().setContent(title),
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

const commands = [
  new SlashCommandBuilder()
    .setName("pl")
    .setDescription("send pricelist")
    .toJSON()
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log("Command /p registered.");
  } catch (error) {
    console.error(error);
  }
})();

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "p") return;

  await interaction.deferReply({ ephemeral: true });

  for (const item of pricelists) {
    await interaction.channel.send(build(item.title, item.body, item.footer));
    await wait(1500);
  }

  await interaction.deleteReply();
});

client.login(process.env.TOKEN);
