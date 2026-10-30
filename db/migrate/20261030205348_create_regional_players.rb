class CreateRegionalPlayers < ActiveRecord::Migration[8.1]
  def change
    create_table :regional_players do |t|
      t.uuid :player_key, null: false, default: -> { "gen_random_uuid()" }
      t.string :region, null: false
      t.string :nickname, null: false
      t.string :normalized_name, null: false
      t.string :country
      t.bigint :team_id
      t.string :team_tag
      t.integer :current_rank
      t.datetime :last_seen_at

      t.timestamps
    end

    add_index :regional_players, :player_key, unique: true
    add_index :regional_players, [:region, :normalized_name]
    add_index :regional_players, [:region, :team_id]
    add_index :regional_players, [:region, :current_rank]
  end
end