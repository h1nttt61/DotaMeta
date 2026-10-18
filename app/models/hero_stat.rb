class HeroStat < ApplicationRecord
  belongs_to :hero

  validates :matches,
            numericality: {
              only_integer: true,
              greater_than_or_equal_to: 0
            }

  validates :wins,
            numericality: {
              only_integer: true,
              greater_than_or_equal_to: 0
            }

  validates :pick_rate,
            numericality: {
              greater_than_or_equal_to: 0,
              less_than_or_equal_to: 100
            }

  validates :win_rate,
            numericality: {
              greater_than_or_equal_to: 0,
              less_than_or_equal_to: 100
            }

  validate :wins_cannot_exceed_matches

  private

  def wins_cannot_exceed_matches
    return if matches.blank? || wins.blank?

    if wins > matches
      errors.add(
        :wins,
        "не может быть больше количества матчей"
      )
    end
  end
end