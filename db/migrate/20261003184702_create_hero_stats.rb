class CreateHeroStats < ActiveRecord::Migration[8.1]
  def change
    create_table :hero_stats do |t|
      t.references :hero, null: false, foreign_key: true
      t.integer :matches
      t.integer :wins
      t.decimal :pick_rate
      t.decimal :win_rate

      t.timestamps
    end
  end
end
