# Shortwave

Shortwave is a swipe-based music discovery app.

Instead of searching for music, users discover songs by swiping through short previews tailored to their taste.

The system learns from swipe behavior and quickly adapts recommendations.

Inspired by:
- TikTok style discovery
- Tinder swipe UX
- Spotify recommendation systems

Goal:
Make discovering new music effortless and fun.

---

## Core Idea

Users swipe through songs:

Right → Like  
Left → Dislike  
Up → Save  
Down → Skip

The system updates a user taste vector and continuously improves recommendations.

---

## Features

- Swipe-based music discovery
- 30 second song previews
- Mood prompt search
- AI-powered recommendations
- Exploration to prevent genre lock-in
- Surreal interactive visuals

---

## Tech Stack

Frontend
- React
- Vite
- Tailwind
- Framer Motion

Backend
- Node / Express
- SQLite

Recommendation Engine
- Embedding similarity
- Multi-armed bandit exploration
- Diversity constraints

---

## Architecture

User → Swipe Feedback  
↓  
Taste Vector Update  
↓  
Candidate Retrieval  
↓  
Ranking + Diversity Filter  
↓  
Next Swipe Deck

---

## Data Sources (planned)

- Apple iTunes API
- Deezer API
- Spotify metadata

Audio playback will use preview clips only.

---

## Development

This project is built using AI coding agents.

Workflow:

Human → system design  
Codex → implementation  
GitHub Actions → CI validation

---

## Status

MVP under development.
