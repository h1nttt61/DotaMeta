class CreateHeros < ActiveRecord::Migration[8.1]
  def change
    create_table :heros do |t|
      t.string :name
      t.string :localized_name
      t.string :primary_attr
      t.jsonb :roles

      t.timestamps
    end
  end
end
#отдельную табличку для ролей сделать