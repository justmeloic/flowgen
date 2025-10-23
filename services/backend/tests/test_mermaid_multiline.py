# Copyright 2025 Google LLC
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

"""Test multiline label handling in mermaid diagrams."""

import pytest

from src.lib.mermaid_utils import sanitize_mermaid


def test_multiline_node_labels():
    """Test that multiline labels in node definitions are properly cleaned."""
    input_diagram = """graph TD
    FrontendApp[fa:fa-window-maximize Azure App Service 
(Frontend)]
    BackendApi[fa:fa-server Azure App Service 
(Backend API)]
    FrontendApp --> BackendApi
"""

    result = sanitize_mermaid(input_diagram)

    # Should not have newlines in node definitions
    assert '\n(' not in result
    assert 'Azure App Service (Frontend)]' in result
    assert 'Azure App Service (Backend API)]' in result

    # Should still have the arrow relationship
    assert '-->' in result


def test_complex_azure_diagram():
    """Test the full Azure architecture diagram with multiline labels."""
    input_diagram = """graph TD
    %% --- Define Styles ---
    %% --- Actors ---
    subgraph Azure Cloud
        %% --- Edge & Identity ---
        AFD(fa:fa-globe Azure Front Door 
+ WAF)
        AAD(fa:fa-users Microsoft Entra ID)
        %% --- VNet and Subnets ---
        subgraph VNet [Azure Virtual Network]
            class VNet vnet;
            subgraph AppServiceSubnet [App Service Subnet]
                class AppServiceSubnet subnet;
                FrontendApp[fa:fa-window-maximize Azure App Service 
(Frontend)]
                BackendApi[fa:fa-server Azure App Service 
(Backend API)]
            end
            subgraph PrivateEndpointSubnet [Private Endpoint Subnet]
                class PrivateEndpointSubnet subnet;
                PESQL(fa:fa-lock Private Endpoint 
SQL)
                PERedis(fa:fa-lock Private Endpoint 
Redis)
                PEKV(fa:fa-lock Private Endpoint 
Key Vault)
            end
        end
        %% --- PaaS Data & Secrets ---
        subgraph DataTier [Data Tier]
            SQLDB[(fa:fa-database Azure SQL DB)]
            Redis[(fa:fa-memory Azure Cache for Redis)]
        end
        subgraph SecurityTier [Security]
            KV(fa:fa-key Azure Key Vault)
        end
        %% --- Monitoring ---
        subgraph Observability
            Monitor(fa:fa-chart-line Azure Monitor)
            AppInsights(fa:fa-lightbulb Application Insights)
        end
    end
    %% --- Main Application Flow ---
    User -- HTTPS --> AFD
    AFD -- HTTPS Traffic --> FrontendApp
    FrontendApp -- REST API Call --> BackendApi
"""

    result = sanitize_mermaid(input_diagram)

    # Check that multiline labels are fixed
    assert 'Azure App Service (Frontend)]' in result
    assert 'Azure App Service (Backend API)]' in result
    assert 'Azure Front Door + WAF)' in result
    assert 'Private Endpoint SQL)' in result

    # Should not have line breaks in the middle of node definitions
    assert '\n(' not in result or result.count('\n(') == 0
    assert '\n[' not in result or all(
        line.strip().startswith('[') for line in result.split('\n') if '\n[' in line
    )


def test_parentheses_shapes():
    """Test various parentheses-based shapes."""
    input_diagram = """graph TD
    A(Simple rounded 
box)
    B((Circle with 
text))
    C[Square 
box]
    A --> B --> C
"""

    result = sanitize_mermaid(input_diagram)

    # All labels should be on single lines
    assert 'Simple rounded box)' in result
    assert 'Circle with text))' in result
    assert 'Square box]' in result

    # No orphan line breaks
    lines = result.split('\n')
    for line in lines:
        stripped = line.strip()
        if stripped and not stripped.startswith('%%'):
            # Lines should not start with just closing brackets/parens
            assert not stripped.startswith(')')
            assert not stripped.startswith(']')


def test_diamond_shapes():
    """Test diamond shapes with multiline text."""
    input_diagram = """graph TD
    A{Decision 
Point}
    B{Another long 
decision text}
    A --> B
"""

    result = sanitize_mermaid(input_diagram)

    # Should have single-line labels
    assert 'Decision Point}' in result
    assert 'Another long decision text}' in result


def test_ampersand_in_labels():
    """Test that ampersands (&) are replaced with 'and' to prevent parse errors."""
    input_diagram = """graph TD
    TaskTopic[fa:fa-comments Pub/Sub (Task & A2A Topic)]
    ResultTopic[fa:fa-comments Pub/Sub (Result & Status Topic)]
    Agent((Agent & Worker))
    Decision{Accept & Process?}
    TaskTopic --> Agent
    Agent --> Decision
    Decision -->|Yes & Go| ResultTopic
"""

    result = sanitize_mermaid(input_diagram)

    # Ampersands should be replaced with 'and'
    assert '&' not in result or '&' not in result.split('graph TD')[1]
    assert 'Task and A2A Topic' in result
    assert 'Result and Status Topic' in result
    assert 'Agent and Worker' in result
    assert 'Accept and Process' in result


def test_ampersand_in_quoted_labels():
    """Test ampersand replacement in quoted strings."""
    input_diagram = """graph TD
    A["Task & Response"]
    B("Data & Processing")
    C{"Accept & Continue?"}
    A --> B --> C
"""

    result = sanitize_mermaid(input_diagram)

    # Ampersands should be replaced
    assert 'Task and Response' in result
    assert 'Data and Processing' in result
    assert 'Accept and Continue' in result


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
