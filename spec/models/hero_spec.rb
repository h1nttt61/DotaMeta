require "rails_helper"

RSpec.describe Hero, type: :model do
  describe "validations" do
    let(:hero) do
      Hero.new(
        name: "npc_dota_hero_test",
        localized_name: "Test Hero",
        primary_attr: "agi",
        roles: ["Carry", "Escape"]
      )
    end

    it "is valid with valid attributes" do
      expect(hero).to be_valid
    end

    it "requires a name" do
      hero.name = nil

      expect(hero).not_to be_valid
      expect(hero.errors[:name]).to be_present
    end

    it "requires a localized name" do
      hero.localized_name = nil

      expect(hero).not_to be_valid
      expect(hero.errors[:localized_name]).to be_present
    end

    it "requires a primary attribute" do
      hero.primary_attr = nil

      expect(hero).not_to be_valid
      expect(hero.errors[:primary_attr]).to be_present
    end

    it "accepts valid primary attributes" do
      %w[str agi int universal].each do |attribute|
        hero.primary_attr = attribute

        expect(hero).to be_valid
      end
    end

    it "rejects invalid primary attributes" do
      hero.primary_attr = "invalid"

      expect(hero).not_to be_valid
      expect(hero.errors[:primary_attr]).to be_present
    end

    it "requires roles" do
      hero.roles = nil

      expect(hero).not_to be_valid
      expect(hero.errors[:roles]).to be_present
    end

    it "requires a unique name" do
      Hero.create!(
        name: "npc_dota_hero_test",
        localized_name: "Test Hero",
        primary_attr: "agi",
        roles: ["Carry"]
      )

      duplicate = hero

      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:name]).to be_present
    end
  end

  describe "associations" do
    it "has many hero stats" do
      association = described_class.reflect_on_association(:hero_stats)

      expect(association.macro).to eq(:has_many)
    end
  end
end