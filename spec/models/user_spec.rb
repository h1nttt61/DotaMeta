require "rails_helper"

RSpec.describe User, type: :model do
  describe "validations" do
    it "is valid with valid attributes" do
      user = User.new(
        email: "test@example.com",
        password: "password123",
        password_confirmation: "password123"
      )

      expect(user).to be_valid
    end

    it "requires an email" do
      user = User.new(
        email: nil,
        password: "password123",
        password_confirmation: "password123"
      )

      expect(user).not_to be_valid
      expect(user.errors[:email]).to be_present
    end

    it "requires a unique email" do
      User.create!(
        email: "test@example.com",
        password: "password123",
        password_confirmation: "password123"
      )

      duplicate = User.new(
        email: "test@example.com",
        password: "password123",
        password_confirmation: "password123"
      )

      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:email]).to be_present
    end

    it "requires a password when creating a user" do
      user = User.new(
        email: "test@example.com",
        password: nil
      )

      expect(user).not_to be_valid
      expect(user.errors[:password]).to be_present
    end
  end

  describe "Devise authentication" do
    it "authenticates with a valid password" do
      user = User.create!(
        email: "test@example.com",
        password: "password123",
        password_confirmation: "password123"
      )

      expect(user.valid_password?("password123")).to be true
    end

    it "rejects an invalid password" do
      user = User.create!(
        email: "test@example.com",
        password: "password123",
        password_confirmation: "password123"
      )

      expect(user.valid_password?("wrong_password")).to be false
    end
  end

  describe "Steam integration" do
    it "can store a Steam ID" do
      user = User.new(
        email: "test@example.com",
        password: "password123",
        password_confirmation: "password123",
        steam_id: "76561198000000000"
      )

      expect(user).to be_valid
      expect(user.steam_id).to eq("76561198000000000")
    end
  end
end