defmodule ShowMeTheCodeWeb.RoomChannel do
  use Phoenix.Channel
  alias ShowMeTheCodeWeb.Presence

  @max_user 7

  @colors [
    # Violet
    "#9400D3",
    # Indigo
    "#4B0082",
    # Blue
    "#0000FF",
    # Green
    "#00FF00",
    # Yellow
    "#FFFF00",
    # Orange
    "#FF7F00",
    # Red
    "#FF0000"
  ]

  defp valid_room_id?(room_id) do
    room_id =~ ~r/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  end

  defp assign_color(socket) do
    picked_colors =
      Enum.map(
        Presence.list(socket),
        &get_in(&1, [Access.elem(1), :metas, Access.at(0), "color"])
      )

    Enum.random(@colors -- picked_colors)
  end

  def join("room:" <> room_id, %{"user_name" => user_name}, socket) when not is_nil(user_name) do
    if valid_room_id?(room_id) do
      if map_size(Presence.list(socket)) + 1 > @max_user do
        {:error, %{"msg" => "room is full"}}
      else
        color = assign_color(socket)

        send(self(), {:after_join, %{"color" => color}})

        {:ok, %{"user_name" => user_name, "user_id" => socket.assigns.user_id, "color" => color},
         socket |> assign(:room_id, room_id) |> assign(:user_name, user_name)}
      end
    else
      {:error, %{"msg" => "room id is invalid"}}
    end
  end

  def join("room:" <> _room_id, _message, _socket) do
    {:error, %{"msg" => "message.user_name is required"}}
  end

  def handle_in("sync_request", _payload, socket) do
    user_id = Enum.find(Map.keys(Presence.list(socket)), &(&1 !== socket.assigns.user_id))

    broadcast_from!(socket, "sync_request", %{
      "body" => %{
        "to" => user_id
      }
    })

    {:noreply, socket}
  end

  def handle_in(event_name, payload, socket) do
    if Enum.member?(["sync", "edit", "selection"], event_name) do
      broadcast_from!(socket, event_name, Map.take(payload, ["body"]))
    end

    {:noreply, socket}
  end

  def handle_info({:after_join, data}, socket) do
    push(socket, "presence_state", Presence.list(socket))

    {:ok, _} =
      Presence.track(socket, socket.assigns.user_id, %{
        "user_name" => socket.assigns.user_name,
        "color" => data["color"]
      })

    {:noreply, socket}
  end
end
