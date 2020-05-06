defmodule ShowMeTheCodeWeb.RoomController do
  use ShowMeTheCodeWeb, :controller
  require Ecto

  def create(conn, _room) do
    json conn, Ecto.UUID.generate()
    # case ShowMeTheCode.Bucket.get(ShowMeTheCode.RoomBucket, room_name) do
    #   {:ok, room} ->
    #     {:ok, room}

    #   {:error, _} ->
    #     ShowMeTheCode.Bucket.put(ShowMeTheCode.RoomBucket, room_name, %{
    #       "room_name" => room_name
    #     })
    # end
  end
end
