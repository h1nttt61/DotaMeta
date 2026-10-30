require "net/http"
require "json"
require "uri"

class PlayerProfileService
  BASE_URL = "https://api.opendota.com/api"

  def self.call(account_id)
    new(account_id).call
  end

  def initialize(account_id)
    @account_id = Integer(account_id)
  end

  def call
    Rails.cache.fetch("player_profile/#{@account_id}", expires_in: 5.minutes) do
      profile_data = get_json("#{BASE_URL}/players/#{@account_id}")
      matches_data = get_json("#{BASE_URL}/players/#{@account_id}/recentMatches")

      profile = profile_data["profile"] || {}

      leaderboard_player = (Rails.cache.read("leaderboard_players") || [])
                             .find { |player| player[:id].to_i == @account_id }

      {
        id: @account_id,
        nickname: profile["personaname"] || leaderboard_player&.dig(:nickname) || "Unknown",
        avatar: profile["avatarfull"] || leaderboard_player&.dig(:avatar),
        steam_url: profile["profileurl"] || leaderboard_player&.dig(:profile_url),
        team: leaderboard_player&.dig(:team),
        team_tag: leaderboard_player&.dig(:team_tag),
        estimated_mmr: profile_data["computed_mmr"],
        rank_tier: profile_data["rank_tier"],
        matches: matches_data.first(5).map do |match|
          radiant = match["player_slot"].to_i < 128
          won = radiant == match["radiant_win"]

          {
            match_id: match["match_id"],
            hero_id: match["hero_id"],
            result: won ? "win" : "loss",
            duration: match["duration"],
            kills: match["kills"],
            deaths: match["deaths"],
            assists: match["assists"],
            start_time: match["start_time"],
            items: (0..5).map { |i| match["item_#{i}"] }.select { |item| item.to_i.positive? }
          }
        end
      }
    end
  end

  private

  def get_json(url)
    uri = URI(url)

    response = Net::HTTP.start(
      uri.host,
      uri.port,
      use_ssl: true,
      open_timeout: 10,
      read_timeout: 30
    ) do |http|
      http.get(uri.request_uri)
    end

    unless response.is_a?(Net::HTTPSuccess)
      raise "OpenDota error: HTTP #{response.code}"
    end

    JSON.parse(response.body)
  end
end