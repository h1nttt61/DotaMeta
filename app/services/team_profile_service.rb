require "net/http"
require "json"
require "uri"

class TeamProfileService
  BASE_URL = "https://api.opendota.com/api"

  def self.call(team_id)
    new(team_id).call
  end

  def initialize(team_id)
    @team_id = Integer(team_id)
  end

  def call
    {
      team: get_json("/teams/#{@team_id}"),
      players: get_json("/teams/#{@team_id}/players"),
      matches: get_json("/teams/#{@team_id}/matches").first(20)
    }
  end

  private

  def get_json(path)
    uri = URI("#{BASE_URL}#{path}")

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

    JSON.parse(response.body)
  end
end