class CreateUserFavorites < ActiveRecord::Migration[8.1]
  def change
    create_table :user_favorites do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :hero_id

      t.timestamps
    end
  end
end
