  
  require "rails_helper"
  
  RSpec.describe "API authentication", type: :request do
    let(:headers) do
      { "HTTP_ORIGIN" => "http://localhost:5173" }
    end
  
    let(:attributes) do
      {
        email: "player@example.com",
        username: "player",
        password: "password123",
        password_confirmation: "password123"
      }
    end
  
    describe "Happy Path" do
      it "registers a user, checks authentication and logs out" do
        expect do
          post "/api/auth/register",
               params: attributes,
               headers: headers,
               as: :json
        end.to change(User, :count).by(1)
  
        expect(response).to have_http_status(:created)
        expect(JSON.parse(response.body).dig("user", "email"))
          .to eq("player@example.com")
  
        get "/api/auth/status"
  
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)["authenticated"]).to be true
  
        delete "/api/auth/logout", headers: headers
  
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)["authenticated"]).to be false
  
        get "/api/auth/status"
  
        expect(JSON.parse(response.body)["authenticated"]).to be false
      end
  
      it "logs in an existing user with the correct password" do
        User.create!(attributes)
  
        post "/api/auth/login",
             params: {
               email: attributes[:email],
               password: attributes[:password]
             },
             headers: headers,
             as: :json
  
        expect(response).to have_http_status(:ok)
  
        body = JSON.parse(response.body)
        expect(body["authenticated"]).to be true
        expect(body.dig("user", "email")).to eq(attributes[:email])
  
        get "/api/auth/status"
  
        expect(JSON.parse(response.body)["authenticated"]).to be true
      end
    end
  
    describe "Alternative scenarios" do
      it "rejects registration when the email is already taken" do
        User.create!(attributes)
  
        expect do
          post "/api/auth/register",
               params: attributes,
               headers: headers,
               as: :json
        end.not_to change(User, :count)
  
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)["errors"]).to be_present
      end
  
      it "rejects login with an incorrect password" do
        User.create!(attributes)
  
        post "/api/auth/login",
             params: {
               email: attributes[:email],
               password: "wrongpassword"
             },
             headers: headers,
             as: :json
  
        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)["errors"]).to be_present
  
        get "/api/auth/status"
  
        expect(JSON.parse(response.body)["authenticated"]).to be false
      end
  
      it "rejects registration with an invalid email" do
        invalid_attributes = attributes.merge(email: "invalid-email")
  
        expect do
          post "/api/auth/register",
               params: invalid_attributes,
               headers: headers,
               as: :json
        end.not_to change(User, :count)
  
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)["errors"]).to be_present
      end
    end
  
    describe "GET /api/auth/status" do
      it "returns unauthenticated when no user is signed in" do
        get "/api/auth/status",
            headers: { "HTTP_ACCEPT" => "application/json" }
  
        expect(response).to have_http_status(:ok)
  
        data = response.parsed_body
        expect(data["authenticated"]).to be(false)
        expect(data["user"]).to be_nil
      end
    end
  
    describe "POST /api/auth/register" do
      it "rejects registration when passwords do not match" do
        post "/api/auth/register",
             params: {
               email: "mismatch@example.com",
               username: "Mismatch",
               password: "Password123!",
               password_confirmation: "DifferentPassword123!"
             },
             headers: {
               "HTTP_ORIGIN" => "http://localhost:5173"
             },
             as: :json
  
        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body["errors"]).to be_present
      end
  
      it "rejects registration when required fields are missing" do
        post "/api/auth/register",
             params: {},
             headers: {
               "HTTP_ORIGIN" => "http://localhost:5173"
             },
             as: :json
  
        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body["errors"]).to be_present
      end
    end
  
    describe "POST /api/auth/login" do
      it "rejects login when the email is not registered" do
        post "/api/auth/login",
             params: {
               email: "unknown@example.com",
               password: "Password123!"
             },
             headers: {
               "HTTP_ORIGIN" => "http://localhost:5173"
             },
             as: :json
  
        expect(response).to have_http_status(:unauthorized)
        expect(response.parsed_body["errors"]).to be_present
      end
  
      it "rejects login when credentials are missing" do
        post "/api/auth/login",
             params: {},
             headers: {
               "HTTP_ORIGIN" => "http://localhost:5173"
             },
             as: :json
  
        expect(response).to have_http_status(:unauthorized)
        expect(response.parsed_body["errors"]).to be_present
      end
    end
  end
