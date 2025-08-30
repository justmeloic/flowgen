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

"""Mermaid diagram edit data models."""

from enum import Enum


class DiagramType(str, Enum):
    """Diagram type enumeration."""

    FLOWCHART = 'flowchart'
    SEQUENCE = 'sequence'
    CLASS = 'class'
    STATE = 'state'
    GANTT = 'gantt'
    PIE = 'pie'
    GITGRAPH = 'gitgraph'
    JOURNEY = 'journey'
    ARCHITECTURE = 'architecture'
    SYSTEM_DESIGN = 'system_design'


class EditInstruction(str, Enum):
    """Edit instruction type enumeration."""

    ADD_COMPONENT = 'add_component'
    REMOVE_COMPONENT = 'remove_component'
    MODIFY_RELATIONSHIP = 'modify_relationship'
    IMPROVE_LAYOUT = 'improve_layout'
    ADD_DETAILS = 'add_details'
    SIMPLIFY = 'simplify'
    RESTRUCTURE = 'restructure'
    CUSTOM = 'custom'
