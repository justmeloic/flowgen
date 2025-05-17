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

"""
Root Agent Module

This module defines the root agent that coordinates tariff-related queries.
"""

from datetime import date

from google.adk.agents import Agent
from .prompts import return_global_instructions, return_root_agent_instructions
from .tools import search_cba_datastore


date_today = date.today()

root_agent = Agent(
    name="root_agent",
    model="gemini-2.0-flash",
    description="Supervisor agent that orchestrates CN's CBA query processing system. Coordinates between specialized sub-agents (Context, CBA Retrieval, Policy, and Jargon agents) to provide comprehensive answers about collective bargaining agreements, railway policies, and labor regulations. Manages user interactions, delegates tasks, and synthesizes information from multiple sources into coherent responses.",
    instruction=return_global_instructions(),
    global_instruction=return_root_agent_instructions(),
    tools=[search_cba_datastore],
)
