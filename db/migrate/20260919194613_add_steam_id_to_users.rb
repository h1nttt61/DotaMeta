class AddSteamIdToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :steam_id, :string
  end
end
