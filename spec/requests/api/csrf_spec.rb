
require "rails_helper"

RSpec.describe "CSRF API", type: :request do
  it "returns a CSRF token" do
    get "/api/csrf",
        headers: { "HTTP_ACCEPT" => "application/json" }

    expect(response).to have_http_status(:ok)

    body = JSON.parse(response.body)

    expect(body["csrf_token"]).to be_present
  end
end
