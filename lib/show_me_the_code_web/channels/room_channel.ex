defmodule ShowMeTheCodeWeb.RoomChannel do
  use Phoenix.Channel

  def join("room:coding", _message, socket) do
    {:ok, socket}
  end

  def join("room:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("new_msg", %{"body" => body}, socket) do
    broadcast!(socket, "new_msg", %{body: body})
    {:noreply, socket}
  end

  intercept ["user_joined"]

  def handle_out("user_joined", msg, socket) do
    IO.inspect(socket, msg)
    push(socket, "user_joined", msg)
  end
end
