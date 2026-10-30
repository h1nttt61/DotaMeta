require "net/http"
require "json"
require "uri"

class LeaderboardService
  BASE_URL = "https://api.opendota.com/api"

  def self.refresh
    new.refresh
  end

  def refresh
    players = fetch_pro_players

    pro_players = players.filter_map do |player|
      account_id = player["account_id"]

      next if account_id.blank? || account_id.to_i <= 0

      nickname = player["name"].presence ||
                 player["personaname"].presence

      next if nickname.blank?

      {
        id: account_id,
        nickname: nickname,
        avatar: player["avatarfull"] || player["avatarmedium"],
        team: player["team_name"].presence,
        team_tag: player["team_tag"].presence,
        profile_url: player["profileurl"],
        steam_id: player["steamid"],
        mmr: nil,
        mmr_type: "unavailable",
        is_pro: true
      }
    end

    pro_players.sort_by! do |player|
      [
        player[:team].to_s.downcase,
        player[:nickname].to_s.downcase
      ]
    end

    Rails.cache.write(
      "leaderboard_players",
      pro_players,
      expires_in: 30.minutes
    )

    ActionCable.server.broadcast(
      "leaderboard",
      { players: pro_players }
    )

    pro_players
  end

  private

  def fetch_pro_players
    get_json("#{BASE_URL}/proPlayers")
  end

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