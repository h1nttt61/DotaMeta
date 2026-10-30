
require "rails_helper"
require "net/http"

RSpec.describe "Heroes API", type: :request do
  let(:heroes_url) do
    URI("https://api.opendota.com/api/heroStats")
  end

  let(:patches_url) do
    URI("https://api.opendota.com/api/constants/patch")
  end

  let(:hero_data) do
    [
      {
        "id" => 1,
        "name" => "npc_dota_hero_antimage",
        "localized_name" => "Anti-Mage",
        "primary_attr" => "agi",
        "roles" => ["Carry", "Escape"],
        "pro_pick" => 100,
        "pub_pick" => 10000
      },
      {
        "id" => 2,
        "name" => "npc_dota_hero_crystal_maiden",
        "localized_name" => "Crystal Maiden",
        "primary_attr" => "int",
        "roles" => ["Support", "Disabler"],
        "pro_pick" => 50,
        "pub_pick" => 5000
      },
      {
        "id" => 3,
        "name" => "npc_dota_hero_puck",
        "localized_name" => "Puck",
        "primary_attr" => "int",
        "roles" => ["Nuker"],
        "pro_pick" => 80,
        "pub_pick" => 7000
      },
      {
        "id" => 4,
        "name" => "npc_dota_hero_storm_spirit",
        "localized_name" => "Storm Spirit",
        "primary_attr" => "int",
        "roles" => ["Escape"],
        "pro_pick" => 60,
        "pub_pick" => 6000
      },
      {
        "id" => 5,
        "name" => "npc_dota_hero_axe",
        "localized_name" => "Axe",
        "primary_attr" => "str",
        "roles" => ["Initiator"],
        "pro_pick" => 40,
        "pub_pick" => 4000
      },
      {
        "id" => 6,
        "name" => "npc_dota_hero_tidehunter",
        "localized_name" => "Tidehunter",
        "primary_attr" => "str",
        "roles" => ["Durable"],
        "pro_pick" => 30,
        "pub_pick" => 3000
      }
    ]
  end

  # Подменяем обращения к OpenDota тестовыми ответами
  before do
    allow(Net::HTTP).to receive(:get)
                          .with(heroes_url)
                          .and_return(hero_data.to_json)

    allow(Net::HTTP).to receive(:get)
                          .with(patches_url)
                          .and_return([{ "name" => "7.38" }].to_json)
  end

  describe "Happy Path" do
    it "returns heroes and the current patch" do
      get "/api/heroes"

      expect(response).to have_http_status(:ok)

      body = response.parsed_body

      expect(body["patch"]).to eq("7.38")
      expect(body["heroes"]).to be_an(Array)
      expect(body["heroes"].size).to eq(6)
      expect(body["heroes"].first["localized_name"]).to eq("Anti-Mage")
    end
  end

  describe "Alternative scenarios" do
    it "filters heroes by Carry role" do
      get "/api/heroes", params: { role: "Carry" }

      expect(response).to have_http_status(:ok)

      names = response.parsed_body["heroes"].map do |hero|
        hero["localized_name"]
      end

      expect(names).to include("Anti-Mage")
      expect(names).not_to include("Crystal Maiden")
    end

    it "returns all heroes when role is ALL" do
      get "/api/heroes", params: { role: "ALL" }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["heroes"].size).to eq(6)
    end

    it "filters Mid heroes by Nuker or Escape roles" do
      get "/api/heroes", params: { role: "Mid" }

      expect(response).to have_http_status(:ok)

      ids = response.parsed_body["heroes"].map { |hero| hero["id"] }

      expect(ids).to contain_exactly(1, 3, 4)
    end

    it "filters Offlane heroes by Initiator or Durable roles" do
      get "/api/heroes", params: { role: "Offlane" }

      expect(response).to have_http_status(:ok)

      ids = response.parsed_body["heroes"].map { |hero| hero["id"] }

      expect(ids).to contain_exactly(5, 6)
    end

    it "filters SoftSupport heroes by Disabler role" do
      get "/api/heroes", params: { role: "SoftSupport" }

      expect(response).to have_http_status(:ok)

      ids = response.parsed_body["heroes"].map { |hero| hero["id"] }

      expect(ids).to contain_exactly(2)
    end

    it "filters HardSupport heroes by Support without Carry" do
      get "/api/heroes", params: { role: "HardSupport" }

      expect(response).to have_http_status(:ok)

      ids = response.parsed_body["heroes"].map { |hero| hero["id"] }

      expect(ids).to contain_exactly(2)
    end
  end
end
