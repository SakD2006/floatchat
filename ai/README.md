# FloatChat AI

FloatChat AI is a conversational agent for querying ARGO oceanographic data. It uses a RAG (Retrieval-Augmented Generation) pipeline with a Text-to-SQL agent to answer questions about a PostgreSQL/PostGIS database containing float, profile, and measurement data.

## Features

- **Text-to-SQL:** Translates natural language questions into complex SQL queries.
- **Spatial Queries:** Utilizes PostGIS for location-based queries (e.g., "find floats near Chennai").
- **Conversational Memory:** Remembers the context of the conversation for follow-up questions.
- **Dockerized:** Easy to set up and run using Docker and Docker Compose.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

## Getting Started

Follow these steps to get the application running locally.

**1. Clone the Repository**
```bash
git clone [https://github.com/SinghAakashdeep/RAG_MCP.git](https://github.com/SinghAakashdeep/RAG_MCP)
cd your-repo-name