class UserFavorite < ApplicationRecord
  belongs_to :user

  validates :hero_id, presence: true, uniqueness: { scope: :user_id }
end