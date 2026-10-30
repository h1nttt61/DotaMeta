class RegionalPlayer < ApplicationRecord
  REGIONS = %w[europe americas se_asia china].freeze

  before_validation :generate_player_key, on: :create
  before_validation :normalize_player_name

  validates :player_key, presence: true, uniqueness: true
  validates :region, presence: true, inclusion: { in: REGIONS }
  validates :nickname, presence: true
  validates :normalized_name, presence: true

  scope :in_region, ->(region) { where(region: region) }
  scope :by_rank, -> { order(:current_rank) }

  private

  def generate_player_key
    self.player_key ||= SecureRandom.uuid
  end

  def normalize_player_name
    self.nickname = nickname.to_s.strip
    self.normalized_name = nickname.downcase if nickname.present?
  end
end