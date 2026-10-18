class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :user_favorites, dependent: :destroy

  validates :username, presence: true, uniqueness: true, length: { minimum: 2, maximum: 30 }

  before_validation :assign_default_username, on: :create

  private

  def assign_default_username
    if username.blank? && email.present?
      self.username = email.split("@").first
    end
  end
end