# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_10_30_205348) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "hero_stats", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "hero_id", null: false
    t.integer "matches"
    t.decimal "pick_rate"
    t.datetime "updated_at", null: false
    t.decimal "win_rate"
    t.integer "wins"
    t.index ["hero_id"], name: "index_hero_stats_on_hero_id"
  end

  create_table "heros", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "localized_name"
    t.string "name"
    t.string "primary_attr"
    t.jsonb "roles"
    t.datetime "updated_at", null: false
  end

  create_table "regional_players", force: :cascade do |t|
    t.string "country"
    t.datetime "created_at", null: false
    t.integer "current_rank"
    t.datetime "last_seen_at"
    t.string "nickname", null: false
    t.string "normalized_name", null: false
    t.uuid "player_key", default: -> { "gen_random_uuid()" }, null: false
    t.string "region", null: false
    t.bigint "team_id"
    t.string "team_tag"
    t.datetime "updated_at", null: false
    t.index ["player_key"], name: "index_regional_players_on_player_key", unique: true
    t.index ["region", "current_rank"], name: "index_regional_players_on_region_and_current_rank"
    t.index ["region", "normalized_name"], name: "index_regional_players_on_region_and_normalized_name"
    t.index ["region", "team_id"], name: "index_regional_players_on_region_and_team_id"
  end

  create_table "user_favorites", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "hero_id"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_user_favorites_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.string "steam_id"
    t.datetime "updated_at", null: false
    t.string "username"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "hero_stats", "heros"
  add_foreign_key "user_favorites", "users"
end
