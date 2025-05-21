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

This module defines the root agent that coordinates CBA-related queries.
"""

from datetime import date
from dotenv import load_dotenv
import os

from google.adk.tools.agent_tool import AgentTool
from google.adk.agents import Agent
from .prompts import return_global_instructions, return_root_agent_instructions
from .sub_agents import search_agent

# Load environment variables
load_dotenv()

date_today = date.today()

root_agent = Agent(
    name="root_agent",
    model=os.getenv('GEMINI_MODEL', 'gemini-2.0-flash'),
    description="Supervisor agent that orchestrates CN's CBA query processing system. Coordinates with the search agent to provide comprehensive answers about collective bargaining agreements, railway policies, and labor regulations. Manages user interactions, delegates search tasks, and synthesizes information into coherent responses.",
    instruction=return_global_instructions(),
    global_instruction=return_root_agent_instructions(),
    sub_agents=[search_agent]
    #tools=[AgentTool(agent=search_agent)]
)


