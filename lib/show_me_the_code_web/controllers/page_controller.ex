defmodule ShowMeTheCodeWeb.PageController do
  use ShowMeTheCodeWeb, :controller
  require Ecto

  def index(conn, _params) do
    render(conn, "index.html",
      token:
        Phoenix.Token.sign(
          conn,
          Application.fetch_env!(:show_me_the_code, :user_salt),
          Ecto.UUID.generate()
        )
    )
  end
end
