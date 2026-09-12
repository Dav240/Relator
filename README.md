# Relator

Relator is a local-first visual relationship mapping tool for building and exploring networks of connected entities.

It was originally designed for tabletop RPG campaign planning, where characters, factions, locations, and secrets often form messy relationship webs. Relator turns those relationships into an interactive graph, making it easier to see who is connected to whom, how they are connected, and how different groups relate visually.

## Purpose

Relator is useful for:

- Concept and knowledge graphs
- Lightweight local diagramming
- Investigation boards
- Narrative and worldbuilding relationship maps
- Character and faction networks

Relator is not limited to a single central topic. It is built around graph-based relationships, where any actor can connect to any other actor through directed or undirected relationships.

## Features

- Create actors as graph nodes
- Add relationships between actors
- Support for directed and undirected relationships
- Drag actors around an interactive diagram space
- Pan around the diagram using a slippy-map style workspace
- Group actors and apply shared visual styles
- Customise grouped actors with shapes and colours
- Save and load `.relator` diagram files
- Export diagrams as image or PDF files
- Local-first desktop experience powered by Tauri

## Tech Stack

- Tauri
- React
- TypeScript
- Tailwind CSS
- html-to-image
- jsPDF

## File Format

Relator diagrams are saved as `.relator` files. Internally, these files store structured diagram data, including actors, relationships, groupings, and node positions.

## Project Goals

The goal of Relator is to provide a fast, focused local tool for visual thinking without requiring a browser account, cloud storage, or a heavier diagramming suite.

The project prioritises:

- Local-first file ownership
- Simple diagram interaction
- Clear visual relationships
- Extensible graph structure
- Clean desktop UX

## Status

Relator is currently a prototpye and in development.