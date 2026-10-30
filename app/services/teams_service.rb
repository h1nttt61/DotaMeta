require "net/http"
require "json"
require "uri"

class TeamsService
  API_URL = "https://api.opendota.com/api/teams"

  def self.call
    Rails.cache.fetch("leaderboard_teams", expires_in: 30.minutes) do
      new.call
    end
  end

  def call
    uri = URI(API_URL)

    response = Net::HTTP.start(
      uri.host,
      uri.port,
      use_ssl: true,
      open_timeout: 10,
      read_timeout: 30
    ) do |http|
      http.get(uri.request_uri)
    end

    raise "OpenDota error: HTTP #{response.code}" unless response.is_a?(Net::HTTPSuccess)

    teams = JSON.parse(response.body)

    normalized_teams = teams
                         .sort_by { |team| -(team["rating"] || 0).to_f }
                         .uniq do |team|
      tag = team["tag"].to_s.strip.downcase
      name = team["name"].to_s.strip.downcase

      if tag.present?
        [:tag, tag]
      elsif name.present?
        [:name, name]
      else
        [:id, team["team_id"]]
      end
    end

    normalized_teams.first(50).map do |team|
      {
        id: team["team_id"],
        name: team["name"].presence || "Unknown",
        tag: team["tag"],
        rating: team["rating"],
        wins: team["wins"],
        losses: team["losses"],
        logo: team["logo_url"]
      }
    end
  end
end