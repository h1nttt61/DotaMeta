class Hero < ApplicationRecord
  has_many :hero_stats,
           dependent: :destroy

  validates :name,
            presence: true,
            uniqueness: true

  validates :localized_name,
            presence: true

  validates :primary_attr,
            presence: true,
            inclusion: {
              in: %w[str agi int universal]
            }

  validates :roles,
            presence: true
end