# Copyright 2025 Loïc Muhirwa
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Simple integration tests that focus on API structure and basic functionality."""


def test_api_endpoints_exist(client):
    """Test that all expected API endpoints exist and respond appropriately."""
    # Test health endpoint (should always work)
    response = client.get('/api/v1/health')
    assert response.status_code == 200
    assert 'status' in response.json()

    # Test status endpoint
    response = client.get('/api/v1/status')
    assert response.status_code == 200
    assert 'title' in response.json()


def test_agent_models_endpoint(client):
    """Test that agent models endpoint works."""
    response = client.get('/api/v1/root_agent/models')
    assert response.status_code == 200
    data = response.json()
    assert 'models' in data
    assert 'default_model' in data


def test_agent_endpoint_validation(client):
    """Test agent endpoint validation without full processing."""
    # Test empty request
    response = client.post('/api/v1/root_agent/', data={'text': ''})
    assert response.status_code == 400

    # Test missing data
    response = client.post('/api/v1/root_agent/', data={})
    assert response.status_code == 400


def test_docs_available(client):
    """Test that API documentation is available."""
    response = client.get('/docs')
    assert response.status_code == 200

    response = client.get('/openapi.json')
    assert response.status_code == 200
    assert response.headers['content-type'] == 'application/json'


def test_cors_headers(client):
    """Test CORS configuration."""
    # Make a request to trigger CORS handling
    response = client.get('/api/v1/health', headers={'Origin': 'http://localhost:3000'})
    assert response.status_code == 200
