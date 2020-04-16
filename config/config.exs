# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :show_me_the_code, ShowMeTheCode.Repo,
  database: "show_me_the_code_repo",
  username: "postgres",
  password: "postgres",
  hostname: "localhost"

config :show_me_the_code,
  ecto_repos: [ShowMeTheCode.Repo]

# Configures the endpoint
config :show_me_the_code, ShowMeTheCodeWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "5gLdDqUdNPGJJ3t5i7SHpfntK8apbH6Wxy8MTaey9oNCbpwTHJtSeJbXwEzz/t7q",
  render_errors: [view: ShowMeTheCodeWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: ShowMeTheCode.PubSub, adapter: Phoenix.PubSub.PG2],
  live_view: [signing_salt: "EiqFNW+S"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
