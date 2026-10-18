require "rails_helper"

RSpec.describe HeroStat, type: :model do
  let(:hero) do
    Hero.create!(
      name: "npc_dota_hero_test",
      localized_name: "Test Hero",
      primary_attr: "agi",
      roles: ["Carry"]
    )
  end

  let(:hero_stat) do
    HeroStat.new(
      hero: hero,
      matches: 100,
      wins: 55,
      pick_rate: 12.5,
      win_rate: 55.0
    )
  end

  describe "associations" do
    it "belongs to a hero" do
      association = described_class.reflect_on_association(:hero)

      expect(association.macro).to eq(:belongs_to)
    end

    it "requires a hero" do
      hero_stat.hero = nil

      expect(hero_stat).not_to be_valid
      expect(hero_stat.errors[:hero]).to be_present
    end
  end

  describe "validations" do
    it "is valid with valid attributes" do
      expect(hero_stat).to be_valid
    end

    it "requires matches to be non-negative" do
      hero_stat.matches = -1

      expect(hero_stat).not_to be_valid
      expect(hero_stat.errors[:matches]).to be_present
    end

    it "requires wins to be non-negative" do
      hero_stat.wins = -1

      expect(hero_stat).not_to be_valid
      expect(hero_stat.errors[:wins]).to be_present
    end

    it "does not allow wins to exceed matches" do
      hero_stat.matches = 50
      hero_stat.wins = 60

      expect(hero_stat).not_to be_valid
      expect(hero_stat.errors[:wins]).to be_present
    end

    it "allows wins equal to matches" do
      hero_stat.matches = 50
      hero_stat.wins = 50

      expect(hero_stat).to be_valid
    end

    it "requires pick rate to be between 0 and 100" do
      hero_stat.pick_rate = 101

      expect(hero_stat).not_to be_valid
      expect(hero_stat.errors[:pick_rate]).to be_present
    end

    it "requires win rate to be between 0 and 100" do
      hero_stat.win_rate = 101

      expect(hero_stat).not_to be_valid
      expect(hero_stat.errors[:win_rate]).to be_present
    end

    it "allows valid rates" do
      hero_stat.pick_rate = 25.5
      hero_stat.win_rate = 55.75

      expect(hero_stat).to be_valid
    end
  end
end