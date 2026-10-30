require "net/http"
require "json"
require "uri"

class RegionalLeaderboardService
  BASE_URL = "https://www.dota2.com/webapi/ILeaderboard/GetDivisionLeaderboard/v0001"
  REGIONS = %w[europe americas se_asia china].freeze
  LIMIT = 1500

  def self.call(region)
    new(region).call
  end

  def initialize(region)
    @region = region.to_s.downcase
    raise ArgumentError, "Некорректный регион" unless REGIONS.include?(@region)
  end

  def call
    Rails.cache.fetch("regional_leaderboard/#{@region}", expires_in: 30.minutes) do
      fetch_players
    end
  end

  private

  def fetch_players
    uri = URI(BASE_URL)
    uri.query = URI.encode_www_form(
      division: @region,
      leaderboard: 0
    )

    response = Net::HTTP.start(
      uri.host,
      uri.port,
      use_ssl: true,
      open_timeout: 10,
      read_timeout: 30
    ) do |http|
      request = Net::HTTP::Get.new(uri)
      request["User-Agent"] = "Mozilla/5.0"
      request["Referer"] = "https://www.dota2.com/leaderboards"
      http.request(request)
    end

    unless response.is_a?(Net::HTTPSuccess)
      raise "Dota 2 API error: HTTP #{response.code}"
    end

    data = JSON.parse(response.body)
    players = data["leaderboard"] || data.dig("result", "leaderboard") || []

    rows = players.first(LIMIT).filter_map do |player|
      nickname = player["name"].to_s.strip

      next if nickname.empty?

      {
        rank: player["rank"],
        nickname: nickname,
        normalized_name: nickname.downcase,
        team_id: player["team_id"],
        team_tag: player["team_tag"],
        country: player["country"],
        region: @region
      }
    end

    persist_players(rows)
  end

  def persist_players(rows)
    saved_players = []

    RegionalPlayer.transaction do
      used_ids = []

      rows.each do |player|
        record = find_existing_player(player, used_ids)

        if record
          record.update!(
            nickname: player[:nickname],
            team_id: player[:team_id],
            team_tag: player[:team_tag],
            country: player[:country],
            current_rank: player[:rank],
            last_seen_at: Time.current
          )
        else
          record = RegionalPlayer.create!(
            region: @region,
            nickname: player[:nickname],
            normalized_name: player[:normalized_name],
            team_id: player[:team_id],
            team_tag: player[:team_tag],
            country: player[:country],
            current_rank: player[:rank],
            last_seen_at: Time.current
          )
        end

        used_ids << record.id

        saved_players << {
          player_key: record.player_key,
          rank: record.current_rank,
          nickname: record.nickname,
          team_id: record.team_id,
          team_tag: record.team_tag,
          country: record.country,
          region: record.region
        }
      end
    end

    saved_players
  end

  def find_existing_player(player, used_ids)
    candidates = RegionalPlayer
                   .where(region: @region, normalized_name: player[:normalized_name])
                   .where.not(id: used_ids)

    exact_match = candidates
                    .where(team_id: player[:team_id], country: player[:country])

    return exact_match.first if exact_match.one?

    country_matches = candidates.where(country: player[:country])
    return country_matches.first if country_matches.one? && player[:country].present?

    team_matches = candidates.where(team_id: player[:team_id])
    return team_matches.first if team_matches.one? && player[:team_id].present?

    return candidates.first if candidates.one?

    nil
  end
end